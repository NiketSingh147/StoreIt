"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { createAdminClient } from "@/lib/appwrite";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [backendMsg, setBackendMsg] = useState("");

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  // FIXED — Magic link sending
const sendResetLink = async (email: string) => {
  setLoading(true);
  setBackendMsg("");

  try {
    const res = await fetch("/api/reset/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (data.ok) {
      setBackendMsg("Reset link sent! Check your inbox.");
    } else {
      setBackendMsg(data.error || "Failed to send reset link.");
    }
  } catch (err) {
    setBackendMsg("Something went wrong.");
  }

  setLoading(false);
};



  return (
    <div className="flex justify-center w-full">
      <div className="w-[65%] max-w-[600px] bg-[#f87274] text-white rounded-3xl p-14 shadow-[0_25px_60px_rgba(0,0,0,0.15)]">
        <h1 className="text-4xl font-extrabold text-center">Reset Password</h1>
        <p className="text-center text-white/80 mt-2 mb-10 text-lg">
          Enter your email to receive a reset link
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => sendResetLink(data.email))}
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="mb-8">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your email"
                      data-no-error-border="true"
                      className="bg-white text-black w-full"
                      onChange={(e) => {
                        field.onChange(e);
                        setBackendMsg("");
                      }}
                    />
                  </FormControl>
                  <FormMessage className="auth-error" />
                </FormItem>
              )}
            />

            <Button
              disabled={loading}
              type="submit"
              className="w-full bg-white text-[#f87274] hover:bg-gray-100 font-semibold text-lg py-4 rounded-xl"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            {backendMsg && (
              <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-center font-medium">
                {backendMsg}
              </div>
            )}

            <p className="text-center mt-8 text-white/90">
              Remembered your password?{" "}
              <Link href="/sign-in" className="font-bold underline">
                Sign In
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
}
