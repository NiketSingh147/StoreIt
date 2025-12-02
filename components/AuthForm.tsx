"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createAccount, loginWithPassword } from "@/lib/actions/user.actions";
import OtpModal from "@/components/OTPModal";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

type FormType = "sign-in" | "sign-up";

// ---------------- ZOD SCHEMA ----------------
const authFormSchema = (formType: FormType) =>
  z.object({
    email: z.string().email("⚠️ Please enter a valid email"),
    password:
      formType === "sign-in"
        ? z.string().min(6, "⚠️ Password must be at least 6 characters")
        : z.string().optional(),
    fullName:
      formType === "sign-up"
        ? z.string().min(2, "⚠️ Full name is too short").max(50)
        : z.string().optional(),
  });

export default function AuthForm({ type }: { type: FormType }) {
  const [isLoading, setIsLoading] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);

  // ⭐ NEW: Remember Me
  const [rememberMe, setRememberMe] = useState(false);

  const router = useRouter();
  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  // ⭐ LOAD saved email from localStorage
  useEffect(() => {
    if (type !== "sign-in") return;

    const savedEmail = localStorage.getItem("storeit-remember-email");
    if (savedEmail) {
      form.setValue("email", savedEmail);
      setRememberMe(true);
    }
  }, [form, type]);

  // Remove backend errors when typing
  const clearBackendError = () => {
    if (backendError) setBackendError("");
  };

  // Trigger form shake
  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setBackendError("");

    try {
      if (type === "sign-in") {
        const res = await loginWithPassword({
          email: values.email,
          password: values.password!,
        });

        if (!res.ok) {
          triggerShake();
          if (res.errorType === "NO_USER") {
            setBackendError("User not registered — please Sign Up first.");
          } else if (res.errorType === "WRONG_PASSWORD") {
            setBackendError("Incorrect password. Please try again.");
          } else {
            setBackendError("Login failed. Try again.");
          }
          return;
        }

        // ⭐ SAVE EMAIL if Remember Me checked
        if (rememberMe) {
          localStorage.setItem("storeit-remember-email", values.email);
        } else {
          localStorage.removeItem("storeit-remember-email");
        }

        // SUCCESS ANIMATION
        setSuccess(true);
        setTimeout(() => router.push("/"), 600);
        return;
      }

      // SIGN-UP FLOW
      const user = await createAccount({
        fullName: values.fullName!,
        email: values.email,
      });

      if (user?.accountId) setAccountId(user.accountId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-center w-full">
        <div
          className={`
            w-[65%] max-w-[600px]
            bg-[#f87274]
            text-white
            rounded-3xl
            p-14
            shadow-[0_25px_60px_rgba(0,0,0,0.15)]
            transition-all
            ${shake ? "shake" : ""}
            ${success ? "success-zoom-fade" : ""}   
          `}
        >
          <h1 className="text-4xl font-extrabold text-center">
            {type === "sign-in" ? "Sign In" : "Sign Up"}
          </h1>

          <p className="text-center text-white/80 mt-2 mb-10 text-lg">
            {type === "sign-in"
              ? "Welcome back to StoreIt"
              : "Create your StoreIt account"}
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} onChange={clearBackendError}>
              
              {/* FULL NAME (Signup only) */}
              {type === "sign-up" && (
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="mb-8">
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your name"
                          {...field}
                          className="bg-white text-black w-full !border-gray-300"
                        />
                      </FormControl>
                      <FormMessage className="text-yellow-200 text-sm" />
                    </FormItem>
                  )}
                />
              )}

              {/* EMAIL */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="mb-8 relative">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your email"
                        className="bg-white text-black w-full"
                        {...field}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val);

                          // If user clears email manually → uncheck rememberMe
                          if (val === "") setRememberMe(false);
                        }}
                      />
                    </FormControl>
                    <FormMessage className="auth-error before:content-['⚠️']" />
                  </FormItem>
                )}
              />

              {/* PASSWORD (Sign-in only) */}
              {type === "sign-in" && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel>Password</FormLabel>

                      <div className="relative">
                        <Input
                          {...field}
                          type={showPass ? "text" : "password"}
                          placeholder="Enter your password"
                          className="bg-white text-black w-full pr-12 !border-gray-300"
                        />

                        {showPass ? (
                          <EyeOff
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f87274] cursor-pointer"
                            size={20}
                            onClick={() => setShowPass(false)}
                          />
                        ) : (
                          <Eye
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f87274] cursor-pointer"
                            size={20}
                            onClick={() => setShowPass(true)}
                          />
                        )}
                      </div>

                      <div className="flex justify-between items-center mt-2">

                        {/* ⭐ REMEMBER ME */}
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 accent-white"
                          />
                          <span className="text-sm text-white/90">Remember Me</span>
                        </label>

                        <Link href="/forgot-password" className="text-sm text-white underline">
                          Forgot password?
                        </Link>
                      </div>

                      <FormMessage className="text-yellow-200 text-sm" />
                    </FormItem>
                  )}
                />
              )}

              {/* SUBMIT BUTTON */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-[#f87274] hover:bg-gray-200 font-semibold text-lg py-4 rounded-xl"
              >
                {isLoading
                  ? "Loading..."
                  : type === "sign-in"
                    ? "Sign In"
                    : "Sign Up"}
              </Button>

              {/* BACKEND ERROR */}
              {backendError && (
                <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-center font-medium">
                  {backendError}
                </div>
              )}

              {/* FOOTER */}
              <p className="text-center mt-8 text-white/90">
                {type === "sign-in"
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <Link
                  href={type === "sign-in" ? "/sign-up" : "/sign-in"}
                  className="font-bold underline"
                >
                  {type === "sign-in" ? "Sign Up" : "Sign In"}
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </div>

      {/* OTP MODAL */}
      {accountId && type === "sign-up" && (
        <OtpModal email={form.getValues("email")} accountId={accountId} />
      )}
    </>
  );
}
