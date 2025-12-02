"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [secret, setSecret] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    // read query params from URL
    const qp = new URLSearchParams(window.location.search);
    const uid = qp.get("userId") || qp.get("user_id") || qp.get("user") || "";
    const sec = qp.get("secret") || qp.get("token") || "";
    setUserId(uid);
    setSecret(sec);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (password.length < 6) return setMsg("Password must be at least 6 characters");
    if (password !== confirm) return setMsg("Passwords do not match");
    setLoading(true);
    try {
      const res = await fetch("/api/reset/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, secret, password }),
      });
      const data = await res.json();
      if (data.ok) {
        // go to sign-in so user can login
        router.push("/sign-in");
      } else {
        setMsg(data.error || "Reset failed");
      }
    } catch (err: any) {
      setMsg(err.message || "Reset failed");
    }
    setLoading(false);
  };

  if (!userId || !secret) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-[65%] max-w-[600px] bg-[#f87274] text-white rounded-3xl p-14 shadow-[0_25px_60px_rgba(0,0,0,0.15)]">
          <h2 className="text-2xl font-bold text-center mb-4">Invalid reset link</h2>
          <p className="text-center text-white/80">Missing or invalid reset link. Please request a new link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-[65%] max-w-[600px] bg-[#f87274] text-white rounded-3xl p-14 shadow-[0_25px_60px_rgba(0,0,0,0.15)]">
        <h2 className="text-3xl font-extrabold text-center mb-2">Set new password</h2>
        <p className="text-center text-white/80 mb-6">Enter a new password for your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">New password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg p-3 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Confirm password</label>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg p-3 text-black"
            />
          </div>

          {msg && <div className="text-sm text-yellow-200 font-medium">{msg}</div>}

          <button className="w-full bg-white text-[#f87274] font-semibold py-3 rounded-lg" disabled={loading}>
            {loading ? "Saving..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
