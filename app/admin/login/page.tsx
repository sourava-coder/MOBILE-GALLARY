import Link from "next/link";
import Image from "next/image";
import LoginForm from "@/components/login-form";

export const metadata = { title: "Admin sign in | Mobile Gallary" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <main className="auth-page">
      <div className="auth-card clay-card">
        <Link className="brand auth-brand" href="/">
          <Image className="brand-logo" src="/logo.png" alt="" width={52} height={52} priority />
          <span><strong>Mobile Gallary</strong><small>Store administration</small></span>
        </Link>
        <p className="section-label">PRIVATE ADMIN ACCESS</p>
        <h1>Enter your PIN.</h1>
        <p className="auth-intro">Enter the 4-digit admin PIN to manage the store.</p>
        <LoginForm redirectPath={redirect} />
        <Link className="back-link" href="/">← Back to the storefront</Link>
      </div>
    </main>
  );
}
