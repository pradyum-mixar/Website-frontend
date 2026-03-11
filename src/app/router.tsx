import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LandingRoute, RequireAdmin, RequireAuth } from "./guards";
import { AppShell } from "../layouts/AppShell";
import { LoginPage } from "../pages/auth/LoginPage";
import { SignupPage } from "../pages/auth/SignupPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import { HandoffPage } from "../pages/auth/HandoffPage";
import { DashboardPage } from "../pages/app/DashboardPage";
import { AccountPage } from "../pages/app/AccountPage";
import { AdminPage } from "../pages/app/AdminPage";
import { PricingPage, PublicPricingPage } from "../pages/app/PricingPage";
import { OrderSummaryPage } from "../pages/app/OrderSummaryPage";
import { BuyCreditsPage } from "../pages/app/BuyCreditsPage";
import { DownloadsPage } from "../pages/app/DownloadsPage";
import { PaymentSuccessPage } from "../pages/app/PaymentSuccessPage";
import { CancelSubscriptionPage } from "../pages/app/CancelSubscriptionPage";
import { BillingHistoryPage } from "../pages/app/BillingHistoryPage";
import { DesktopLoginPage } from "../pages/auth/DesktopLoginPage";
import { GoogleCallbackPage } from "../pages/auth/GoogleCallbackPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/handoff" element={<HandoffPage />} />
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
        <Route path="/pricing" element={<PublicPricingPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/app/desktop-login" element={<DesktopLoginPage />} />
          <Route path="/app" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="account" element={<AccountPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="order" element={<OrderSummaryPage />} />
            <Route path="buy-credits" element={<BuyCreditsPage />} />
            <Route path="downloads" element={<DownloadsPage />} />
            <Route path="payment-success" element={<PaymentSuccessPage />} />
            <Route path="billing" element={<BillingHistoryPage />} />
            <Route path="cancel-subscription" element={<CancelSubscriptionPage />} />
            <Route element={<RequireAdmin />}>
              <Route path="admin" element={<AdminPage />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all: redirect unknown routes to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
