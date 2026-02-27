import { useAuth } from "../../features/auth/AuthContext";

export function AccountPage() {
  const { user } = useAuth();
  return (
    <div>
      <h1>Account</h1>
      <section className="card">
        <p>Email: {user?.email}</p>
        <p>Name: {user?.name ?? "-"}</p>
        <p>Verified: {String(user?.is_verified ?? false)}</p>
        <p>Superuser: {String(user?.is_superuser ?? false)}</p>
        <p>Credits: {user?.credits ?? 0}</p>
      </section>
    </div>
  );
}
