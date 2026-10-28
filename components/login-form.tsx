"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ redirectPath }: { redirectPath?: string }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const response = await fetch("/api/admin/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "PIN verification failed.");
        setBusy(false);
        return;
      }

      const safeRedirect = redirectPath?.startsWith("/admin") && redirectPath !== "/admin/login"
        ? redirectPath
        : "/admin";
      router.replace(safeRedirect);
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      {error && <p className="notice notice-error" role="alert">{error}</p>}
      <label className="field">
        <span>4-digit admin PIN</span>
        <input
          autoComplete="current-password"
          inputMode="numeric"
          maxLength={4}
          minLength={4}
          pattern="[0-9]{4}"
          type="password"
          required
          autoFocus
          value={pin}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
        />
      </label>
      <button className="button button-dark button-wide" type="submit" disabled={busy || pin.length !== 4}>
        {busy ? "Verifying…" : "Unlock admin"}
      </button>
    </form>
  );
}
