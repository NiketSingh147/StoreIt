"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();

  // Values from reset link
  const userId = params.get("userId");
  const secret = params.get("secret");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clearErrors = () => setError("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // OLD PASSWORD CHECK
      const check = await fetch("/api/reset/check-old", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, userId }),
      });

      const old = await check.json();

      if (old.samePassword) {
        setError(
          "The password you are trying to use is similar to your previous password. Please choose a different password."
        );
        setLoading(false);
        return;
      }

      // RESET PASSWORD COMPLETE
      const res = await fetch("/api/reset/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          userId,
          secret,
        }),
      });

      const json = await res.json();

      if (json.ok) {
        router.push("/sign-in");
      } else {
        // Check for expired or already-used reset token
        if (
          json.error?.toLowerCase().includes("expired") ||
          json.error?.toLowerCase().includes("invalid") ||
          json.error?.toLowerCase().includes("used") ||
          json.error?.toLowerCase().includes("token")
        ) {
          setError(
            "This reset link has expired or has already been used.\nPlease request a new password reset link."
          );
        } else {
          setError(json.error || "Something went wrong. Please try again.");
        }
      }
    } catch (err) {
      setError("Unexpected error. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-[480px] p-10 rounded-2xl shadow-2xl bg-[#f87274] text-white">
        <h2 className="text-3xl font-extrabold text-center mb-1">
          Set New Password
        </h2>
        <p className="text-center text-white/80 mb-6">
          Enter a new password for your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* NEW PASSWORD */}
          <div className="space-y-2">
            <label className="text-sm font-medium">New Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Enter new password"
                className="w-full rounded-lg bg-white px-12 py-3 text-black border border-white/40"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearErrors();
                }}
              />
              <Lock className="absolute left-4 top-3 text-[#f87274] h-5 w-5" />
              {showPass ? (
                <EyeOff
                  className="absolute right-4 top-3 text-[#f87274] cursor-pointer"
                  onClick={() => setShowPass(false)}
                />
              ) : (
                <Eye
                  className="absolute right-4 top-3 text-[#f87274] cursor-pointer"
                  onClick={() => setShowPass(true)}
                />
              )}
            </div>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                className="w-full rounded-lg bg-white px-12 py-3 text-black border border-white/40"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  clearErrors();
                }}
              />
              <Lock className="absolute left-4 top-3 text-[#f87274] h-5 w-5" />
              {showConfirm ? (
                <EyeOff
                  className="absolute right-4 top-3 text-[#f87274] cursor-pointer"
                  onClick={() => setShowConfirm(false)}
                />
              ) : (
                <Eye
                  className="absolute right-4 top-3 text-[#f87274] cursor-pointer"
                  onClick={() => setShowConfirm(true)}
                />
              )}
            </div>

            {confirm.length > 0 && confirm !== password && (
              <p className="text-sm text-red-200 font-semibold">
                Passwords do not match
              </p>
            )}
          </div>

          {error && (
            <p className="text-red-200 text-center font-semibold leading-relaxed">
              {error}
            </p>
          )}

          <button
            className="w-full bg-white text-[#f87274] py-3 font-bold rounded-lg"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
