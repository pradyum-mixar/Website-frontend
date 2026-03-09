import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import { ENV } from "../config/env";
import { authStorage } from "../features/auth/storage";
import type { CurrentUser } from "../features/auth/types";

type RetryConfig = AxiosRequestConfig & { _retry?: boolean };

type TokenPair = {
  access_token: string;
  refresh_token?: string;
  token_type: string;
};

export type Plan = {
  id: string;
  name: string;
  tagline: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  credits_per_month: number;
  features: string[];
  highlight: boolean;
  cta_label: string;
};

export type PaymentHistoryItem = {
  id: string;
  payment_type: string;
  status: string;
  dodo_payment_id: string;
  amount: number | null;
  currency: string | null;
  plan_id: string | null;
  billing_interval: string | null;
  credit_quantity: number | null;
  has_invoice: boolean;
  created_at: string;
};

export type PaymentHistoryResponse = {
  status: string;
  data: PaymentHistoryItem[];
  pagination: { page_no: number; page_size: number; total: number };
};

export type SubscriptionStatus = {
  plan_slug: string;
  plan_name: string;
  billing_interval: string;
  credits_per_month: number;
  cycle_start: string;
  cycle_end: string;
  days_left: number;
  subscription_expires_at: string | null;
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: ENV.API_BASE_URL,
      headers: { "Content-Type": "application/json" },
    });

    this.client.interceptors.request.use((config) => {
      const tokens = authStorage.readTokens();
      if (tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const original = error.config as RetryConfig | undefined;
        const statusCode = error.response?.status;
        const tokens = authStorage.readTokens();
        if (!original || original._retry || statusCode !== 401 || !tokens?.refreshToken) {
          return Promise.reject(error);
        }

        original._retry = true;
        try {
          const refreshed = await this.client.post<TokenPair>("/auth/refresh", {
            refresh_token: tokens.refreshToken,
          });
          authStorage.writeTokens({
            accessToken: refreshed.data.access_token,
            refreshToken: refreshed.data.refresh_token,
          });
          return this.client(original);
        } catch {
          authStorage.clearTokens();
          authStorage.clearUser();
          return Promise.reject(error);
        }
      },
    );
  }

  get instance(): AxiosInstance {
    return this.client;
  }

  async login(email: string, password: string): Promise<void> {
    const response = await this.client.post<TokenPair>("/auth/login/json", { email, password });
    authStorage.writeTokens({
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
    });
  }

  async sendSignupOtp(payload: {
    email: string;
    password: string;
    name: string;
    referral_code?: string;
  }): Promise<void> {
    await this.client.post("/auth/signup/send-otp", payload);
  }

  async verifySignupOtp(payload: {
    email: string;
    password: string;
    name: string;
    otp_code: string;
    referral_code?: string;
  }): Promise<void> {
    const response = await this.client.post<TokenPair>("/auth/signup/verify-otp", payload);
    authStorage.writeTokens({
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
    });
  }

  async logout(): Promise<void> {
    try {
      await this.client.post("/auth/logout");
    } finally {
      authStorage.clearTokens();
      authStorage.clearUser();
    }
  }

  async me(): Promise<CurrentUser> {
    const response = await this.client.get<CurrentUser>("/auth/me");
    authStorage.writeUser(response.data);
    return response.data;
  }

  async forgotPasswordSendOtp(email: string): Promise<void> {
    await this.client.post("/auth/forgot-password/send-otp", { email });
  }

  async forgotPasswordVerifyOtp(email: string, otp_code: string): Promise<{ reset_token: string }> {
    const response = await this.client.post<{ reset_token: string }>("/auth/forgot-password/verify-otp", {
      email,
      otp_code,
    });
    return response.data;
  }

  async resetPassword(reset_token: string, new_password: string): Promise<void> {
    await this.client.post("/auth/forgot-password/reset", { reset_token, new_password });
  }

  async exchangeHandoff(ticket: string): Promise<void> {
    const response = await this.client.post<TokenPair>("/auth/handoff/exchange", { ticket });
    authStorage.writeTokens({
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
    });
  }

  async getPlans(): Promise<{ status: string; data: Plan[] }> {
    const response = await this.client.get<{ status: string; data: Plan[] }>("/plans/");
    return response.data;
  }

  async createCheckout(planId: string, billing: string): Promise<{ status: string; data: { payment_link: string } }> {
    const response = await this.client.post<{ status: string; data: { payment_link: string } }>(
      "/subscriptions/checkout",
      { plan_id: planId, billing }
    );
    return response.data;
  }

  async getCreditPricing(): Promise<{ status: string; data: { price_per_credit: number; currency: string; min_quantity: number; max_quantity: number } }> {
    const response = await this.client.get<{ status: string; data: { price_per_credit: number; currency: string; min_quantity: number; max_quantity: number } }>("/plans/credit-pricing");
    return response.data;
  }

  async cancelSubscription(): Promise<{ status: string; message: string }> {
    const response = await this.client.post<{ status: string; message: string }>("/subscriptions/cancel");
    return response.data;
  }

  async createCreditCheckout(quantity: number): Promise<{ status: string; data: { payment_link: string } }> {
    const response = await this.client.post<{ status: string; data: { payment_link: string } }>(
      "/subscriptions/checkout/credits",
      { quantity }
    );
    return response.data;
  }

  async getPaymentHistory(page_no = 1, page_size = 20): Promise<PaymentHistoryResponse> {
    const response = await this.client.get<PaymentHistoryResponse>(
      `/subscriptions/history?page_no=${page_no}&page_size=${page_size}`
    );
    return response.data;
  }

  async getGoogleLoginUrl(): Promise<string> {
    const response = await this.client.get<{ url: string }>("/auth/login/google");
    return response.data.url;
  }

  async exchangeGoogleCode(code: string, state: string): Promise<void> {
    const response = await this.client.post<TokenPair>("/auth/google", { code, state });
    authStorage.writeTokens({
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
    });
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const response = await this.client.get<SubscriptionStatus>("/subscriptions/status");
    return response.data;
  }

  async getAvailableDownloads(): Promise<{
    status: string;
    data: { platform: string; version: string; size_bytes: number; installer_type: string | null }[];
  }> {
    const response = await this.client.get("/downloads");
    return response.data;
  }

  async getDownloadUrl(platform: string): Promise<{
    status: string;
    data: { url: string; platform: string; version: string; size_bytes: number; sha256: string; installer_type: string | null };
  }> {
    const response = await this.client.get(`/downloads/${platform}`);
    return response.data;
  }

  async downloadInvoice(paymentId: string): Promise<void> {
    const response = await this.client.get(`/subscriptions/invoices/${paymentId}`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(response.data as Blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${paymentId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}

export const apiClient = new ApiClient();
