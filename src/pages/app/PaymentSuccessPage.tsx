import { Link, useSearchParams } from "react-router-dom";
import "../../assets/css/pricing.css";

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");

  const isSucceeded = status === "succeeded";

  return (
    <div className="order-summary">
      <div className="order-card" style={{ textAlign: "center" }}>
        {isSucceeded ? (
          <>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              style={{ margin: "0 auto 1.5rem" }}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l3 3 5-6" />
            </svg>
            <h2>Payment Successful!</h2>
            <p className="order-tagline">
              Your credits have been added to your account.
            </p>
          </>
        ) : (
          <>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#eab308"
              strokeWidth="2"
              style={{ margin: "0 auto 1.5rem" }}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <h2>Payment Processing</h2>
            <p className="order-tagline">
              Your payment is being processed. Credits will appear in your
              account shortly.
            </p>
          </>
        )}

        {paymentId && (
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "1rem" }}>
            Payment reference: <code>{paymentId}</code>
          </p>
        )}

        <div className="order-actions" style={{ marginTop: "2rem" }}>
          <Link to="/app" className="btn-payment active">
            Go to Dashboard
          </Link>
          <Link to="/app/buy-credits" className="btn-back">
            Buy More Credits
          </Link>
        </div>
      </div>
    </div>
  );
}
