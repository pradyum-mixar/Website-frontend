import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID = "G-LVNPXKJDMR";

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

  // Track SPA page views on every route change
  useEffect(() => {
    window.gtag?.("event", "page_view", {
      page_path: location.pathname + location.search,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location]);

  return null;
}
