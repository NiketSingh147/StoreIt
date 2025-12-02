"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function SetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const getStrength = () => {
    if (password.length >= 10) return "Strong";
    if (password.length >= 6) return "Good";
    return "Weak";
  };

  const strength = getStrength();
  const strengthWidth =
    strength === "Strong" ? "100%" : strength === "Good" ? "65%" : "35%";
  const strengthColor =
    strength === "Strong"
      ? "bg-green-500"
      : strength === "Good"
      ? "bg-yellow-400"
      : "bg-red-500";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password || !confirm) {
      setError("Please fill out all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      router.push("/sign-in");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      {/* CARD */}
      <div className="w-[480px] p-10 rounded-2xl shadow-2xl bg-[#f87274] text-white">

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-center mb-2">
          Create Your Password
        </h2>
        <p className="text-center text-white/90 mb-8">
          Secure your StoreIt account
        </p>

        {/* FORM */}
        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* ENTER PASSWORD */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Enter Password</label>

            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                className="w-full rounded-lg bg-white text-black border border-white/30 px-12 py-3 outline-none"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Lock className="absolute left-4 top-3 text-[#e55557] h-5 w-5" />

              {showPass ? (
                <EyeOff
                  className="absolute right-4 top-3 text-[#e55557] cursor-pointer"
                  onClick={() => setShowPass(false)}
                />
              ) : (
                <Eye
                  className="absolute right-4 top-3 text-[#e55557] cursor-pointer"
                  onClick={() => setShowPass(true)}
                />
              )}
            </div>

            {/* STRENGTH BAR */}
            {password.length > 0 && (
              <>
                <div className="h-2 bg-white/40 rounded-full overflow-hidden">
                  <div
                    className={`${strengthColor} h-full transition-all`}
                    style={{ width: strengthWidth }}
                  ></div>
                </div>
                <p className="text-xs opacity-90">Strength: {strength}</p>
              </>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Confirm Password</label>

            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                className="w-full rounded-lg bg-white text-black border border-white/30 px-12 py-3 outline-none"
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />

              <Lock className="absolute left-4 top-3 text-[#e55557] h-5 w-5" />

              {showConfirm ? (
                <EyeOff
                  className="absolute right-4 top-3 text-[#e55557] cursor-pointer"
                  onClick={() => setShowConfirm(false)}
                />
              ) : (
                <Eye
                  className="absolute right-4 top-3 text-[#e55557] cursor-pointer"
                  onClick={() => setShowConfirm(true)}
                />
              )}
            </div>

            {confirm && confirm !== password && (
              <p className="text-xs text-red-200 font-medium">
                Passwords do not match
              </p>
            )}
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-red-200 text-center font-medium">{error}</p>
          )}

          {/* BUTTON */}
          <button
            className="w-full bg-white text-[#e55557] font-semibold py-3 rounded-lg shadow-lg hover:bg-gray-100 transition"
            disabled={loading}
          >
            {loading ? "Saving..." : "Set Password"}
          </button>

        </form>
      </div>
    </div>
  );
}
