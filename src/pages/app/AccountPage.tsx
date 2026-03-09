import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
export function AccountPage() {
  const { user } = useAuth();

  const planLabel = user?.plan_name ?? "Free";
  const isFree = !user || user.subscription_type === 0;

  const expiresAt = user?.subscription_expires_at
    ? new Date(user.subscription_expires_at)
    : null;

  return (
    <div>
      <h1>Account</h1>
      <section className="card">
        <p>Email: {user?.email}</p>
        <p>Name: {user?.name ?? "-"}</p>
        <p>Verified: {String(user?.is_verified ?? false)}</p>
        <p>Credits: {user?.credits ?? 0}</p>
      </section>

      <section className="card" style={{ marginTop: "1rem" }}>
        <p>
          Plan: <strong>{planLabel}</strong>
          {isFree && (
            <>
              {" "}
              &mdash;{" "}
              <Link to="/app/pricing">Upgrade</Link>
            </>
          )}
        </p>
        {expiresAt && (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Subscription active until{" "}
            <strong>{expiresAt.toLocaleDateString(undefined, { dateStyle: "long" })}</strong>
            {" "}(cancelled — access continues until then)
          </p>
        )}
      </section>
    </div>
  );
}
