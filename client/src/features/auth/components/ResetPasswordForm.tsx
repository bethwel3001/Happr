import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

import { useGenerateOtp } from "@/features/auth";

const COOLDOWN_KEY = "$happr_otp_cooldown_expiry";

const ResetPasswordForm = () => {
  const { mutate: generateOtp, isPending: generatingOtp } = useGenerateOtp();

  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [isOtpGenerated, setIsOtpGenerated] = useState<boolean>(false);
  const [cooldown, setCooldown] = useState<number>(0);

  useEffect(() => {
    const expiry = localStorage.getItem(COOLDOWN_KEY);

    if (expiry) {
      const remaining = Math.floor((Number(expiry) - Date.now()) / 1000);

      if (remaining > 0) setCooldown(remaining);
    }
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

  const handleOtpGeneration = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed) {
      toast.error("Invalid email format");
      return;
    }

    generateOtp(
      { email },
      {
        onSuccess: () => {
          setIsOtpGenerated(true);
          setCooldown(60);

          const expiryTimestamp = Date.now() + 60 * 1000;
          localStorage.setItem(COOLDOWN_KEY, expiryTimestamp.toString());
        }
      }
    );
  };

  const handleOtpVerification = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // handle OTP verification logic here
  };

  return (
    <div
      className="w-full flex flex-col gap-2"
      aria-labelledby="reset your password"
    >
      <h2 className="text-primary text-2xl">
        {isOtpGenerated ? "Enter OTP Received" : "Reset Your Password"}
      </h2>

      <p className="text-sm mb-4">
        {isOtpGenerated
          ? "Enter the OTP sent to your inbox in the input below."
          : `Forgot your password? Don't panic, it happens. Enter the email associated with your account in the input below.`}
      </p>

      {isOtpGenerated ? (
        <form
          aria-label="Reset Password Form"
          onSubmit={handleOtpVerification}
          className="w-full flex flex-col gap-1 py-4"
        >
          <Input
            id="otp-input"
            name="otp"
            type="text"
            value={otp}
            placeholder="Enter the OTP sent to your email"
            disabled={generatingOtp}
            onChange={e => setOtp(e.target.value)}
            className="mb-3"
          />

          {cooldown > 0 ? (
            <span className="self-start text-muted-foreground ml-2 mb-2">
              Resend OTP in {cooldown}s
            </span>
          ) : (
            <button
              type="button"
              disabled={cooldown > 0 || generatingOtp}
              onClick={() => handleOtpGeneration()}
              className="self-start text-primary ml-2 mb-2"
            >
              Resend OTP
            </button>
          )}

          <Button disabled={!otp || generatingOtp} className="w-full h-14">
            {generatingOtp ? "Verifying OTP..." : "Verify OTP"}
          </Button>
        </form>
      ) : (
        <form
          aria-label="Reset Password Form"
          onSubmit={handleOtpGeneration}
          className="w-full flex flex-col gap-1 py-4"
        >
          <Input
            id="email-input"
            name="email"
            type="email"
            value={email}
            placeholder="Enter a valid email address"
            disabled={generatingOtp}
            onChange={e => setEmail(e.target.value)}
            className="mb-3"
          />

          <Button disabled={!email || generatingOtp} className="w-full h-14">
            {generatingOtp ? "Generating OTP..." : "Submit"}
          </Button>
        </form>
      )}

      <p className="text-center -mt-2">
        Remembered your password?{" "}
        <Link to="/signin" className="text-primary">
          Sign in here
        </Link>
      </p>
    </div>
  );
};

export default ResetPasswordForm;
