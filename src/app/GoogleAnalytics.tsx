import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID = "G-LVNPXKJDMR";
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_name",
  "utm_term",
  "utm_content",
] as const;

type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;

function readStoredUtms(): UtmParams {
  try {
    const raw = sessionStorage.getItem("mixar_utms");
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: UtmParams = {};
    UTM_KEYS.forEach((k) => {
      const v = parsed[k];
      if (typeof v === "string" && v) out[k] = v;
    });
    return out;
  } catch {
    return {};
  }
}

function buildPageLocationWithUtms(search: string, utms: UtmParams): string {
  const params = new URLSearchParams(search);
  (Object.entries(utms) as [string, string][]).forEach(([k, v]) => {
    if (!params.has(k)) params.set(k, v);
  });
  const qs = params.toString();
  return window.location.origin + window.location.pathname + (qs ? `?${qs}` : "");
}

export function GoogleAnalytics() {
  const location = useLocation();
  const { user } = useAuth();

  // Set user identity when logged in
  useEffect(() => {
    if (user) {
      window.gtag?.("config", GA_ID, {
        user_id: user.id,
        send_page_view: false,
      });
      window.gtag?.("set", "user_properties", {
        user_name: user.name ?? "",
        subscription_type: user.subscription_type,
      });
    }
  }, [user]);

  // Track SPA page views on every route change, carrying captured UTMs so GA4 can attribute
  useEffect(() => {
    const utms = readStoredUtms();
    window.gtag?.("event", "page_view", {
      page_path: location.pathname + location.search,
      page_location: buildPageLocationWithUtms(location.search, utms),
      page_title: document.title,
      ...utms,
    });
  }, [location]);

  return null;
}
