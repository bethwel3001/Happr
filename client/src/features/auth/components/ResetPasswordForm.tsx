import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import { useGenerateOtp, useVerifyPasswordOtp } from "@/features/auth";

const COOLDOWN_KEY = "$happr_otp_cooldown_expiry";
const OTP_COOLDOWN_SECONDS = 60;

const ResetPasswordForm = () => {
  const navigate = useNavigate();

  const { mutate: generateOtp, isPending: generatingOtp } = useGenerateOtp();
  const { mutate: verifyOtp, isPending: verifyingOtp } = useVerifyPasswordOtp();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpGenerated, setIsOtpGenerated] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const expiry = Number(localStorage.getItem(COOLDOWN_KEY)) || 0;
    const remaining = Math.floor((expiry - Date.now()) / 1000);

    if (remaining > 0) setCooldown(remaining);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;

    const interval = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          localStorage.removeItem(COOLDOWN_KEY);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  const startCooldown = useCallback((seconds: number) => {
    const expiryTimestamp = Date.now() + seconds * 1000;
    localStorage.setItem(COOLDOWN_KEY, expiryTimestamp.toString());
    setCooldown(seconds);
  }, []);

  const handleOtpGeneration = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Please enter a valid email address.");
      return;
    }

    generateOtp(
      { email },
      {
        onSuccess: () => {
          setIsOtpGenerated(true);
          startCooldown(OTP_COOLDOWN_SECONDS);
        }
      }
    );
  };

  const handleOtpVerification = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = otp.trim();
    if (!trimmed) {
      toast.error("Please enter the OTP.");
      return;
    }

    if (trimmed.length !== 8) {
      toast.error("OTP must be 8 digits.");
      return;
    }

    verifyOtp(
      { email, otp },
      {
        onSuccess: () => {
          setOtp("");
          setTimeout(() => navigate("/new-password"), 500);
        }
      }
    );
  };

  const EmailForm = (
    <form
      aria-label="Request OTP Form"
      onSubmit={handleOtpGeneration}
      className="w-full flex flex-col gap-2 py-4"
    >
      <Input
        id="email-input"
        name="email"
        type="email"
        value={email}
        placeholder="Enter your email"
        disabled={generatingOtp}
        onChange={e => setEmail(e.target.value)}
        className="mb-3"
      />
      <Button disabled={!email || generatingOtp} className="w-full h-14">
        {generatingOtp ? "Generating OTP..." : "Generate OTP"}
      </Button>
    </form>
  );

  const OtpForm = (
    <form
      aria-label="Verify OTP Form"
      onSubmit={handleOtpVerification}
      className="w-full flex flex-col gap-2 py-4"
    >
      <Input
        id="otp-input"
        name="otp"
        type="text"
        value={otp}
        placeholder="Enter OTP"
        disabled={verifyingOtp}
        onChange={e => setOtp(e.target.value)}
        className="mb-3"
      />

      {cooldown > 0 ? (
        <span
          role="status"
          className="self-start text-muted-foreground ml-2 mb-2"
        >
          Resend OTP in {cooldown}s
        </span>
      ) : (
        <button
          type="button"
          disabled={cooldown > 0 || verifyingOtp}
          onClick={() => handleOtpGeneration()}
          className="self-start text-primary ml-2 mb-2"
        >
          Resend OTP
        </button>
      )}

      <Button disabled={!otp || verifyingOtp} className="w-full h-14">
        {verifyingOtp ? "Verifying OTP..." : "Verify OTP"}
      </Button>
    </form>
  );

  return (
    <div
      className="w-full flex flex-col gap-2"
      aria-labelledby="reset-password"
    >
      <h2 className="text-primary text-2xl">
        {isOtpGenerated ? "Enter OTP" : "Reset Your Password"}
      </h2>

      <p className="text-sm mb-4">
        {isOtpGenerated
          ? "Enter the OTP sent to your email."
          : "Forgot your password? Enter the email associated with your account below."}
      </p>

      {isOtpGenerated ? OtpForm : EmailForm}

      <p className="text-center -mt-2">
        Remembered your password?{" "}
        <Link to="/signin" className="text-primary">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default ResetPasswordForm;
