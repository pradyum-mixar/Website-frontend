import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function BuyCreditsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/app/manage-subscription?tab=upgrade", { replace: true });
  }, [navigate]);

  return null;
}
