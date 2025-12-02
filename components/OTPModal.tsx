// components/OTPModal.tsx
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { sendEmailOTP } from "@/lib/actions/user.actions";
import { useRouter } from "next/navigation";

export default function OtpModal({
  accountId,
  email,
}: {
  accountId: string;
  email: string;
}) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [secret, setSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    setIsOpen(true);
  }, []);

  // ▶︎ Submit — call your server route /api/create-session (server sets cookie)
  const handleSubmit = async () => {
    setIsLoading(true);
    setOtpError("");

    try {
      const res = await fetch("/api/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, secret }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        // close modal and redirect to set-password
        setIsOpen(false);
        router.push("/set-password");
      } else {
        // server sent back ok: false or status !== 200
        setOtpError(data?.error || "Incorrect OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP verify error:", err);
      setOtpError("OTP verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await sendEmailOTP({ email });
    } catch (err) {
      console.error("Resend OTP failed:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="shad-alert-dialog">
        <AlertDialogHeader className="relative flex justify-center">
          <AlertDialogTitle className="h2 text-center">
            Enter Your OTP
            <Image
              src="/assets/icons/close-dark.svg"
              alt="close"
              width={20}
              height={20}
              onClick={() => setIsOpen(false)}
              className="otp-close-button"
            />
          </AlertDialogTitle>

          <AlertDialogDescription className="subtitle-2 text-center text-light-100">
            We’ve sent a code to <span className="pl-1 text-brand">{email}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <InputOTP
          maxLength={6}
          value={secret}
          onChange={(value) => {
            setSecret(value);
            setOtpError("");
          }}
          onKeyDown={handleKeyDown}
        >
          <InputOTPGroup className="shad-otp">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot key={i} index={i} className="shad-otp-slot" />
            ))}
          </InputOTPGroup>
        </InputOTP>

        {otpError && <p className="text-red-500 text-center mt-3">{otpError}</p>}

        <AlertDialogFooter>
          <div className="flex w-full flex-col gap-4">
            <AlertDialogAction
              onClick={handleSubmit}
              className="shad-submit-btn h-12"
              type="button"
            >
              Submit
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="ml-2 animate-spin"
                />
              )}
            </AlertDialogAction>

            <div className="subtitle-2 mt-2 text-center text-light-100">
              Didn’t get a code?
              <Button
                type="button"
                variant="link"
                className="pl-1 text-brand"
                onClick={handleResendOtp}
              >
                Click to resend
              </Button>
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
