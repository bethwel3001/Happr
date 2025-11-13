import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  InvalidEmailVerification,
  LoadingEmailVerification,
  SuccessEmailVerification,
  useEmailVerification
} from "@/features/auth";

const EmailVerification = () => {
  const [countdown, setCountdown] = useState<number>(5);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verificationToken = searchParams.get("token") ?? "";

  const { data, isLoading, isError } = useEmailVerification({
    verificationToken
  });

  const isInvalid = !verificationToken || isError;
  const isSuccess = data?.success === true;

  useEffect(() => {
    if (isInvalid || isSuccess) {
      setCountdown(5);

      const interval = setInterval(() => {
        setCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      const timeout = setTimeout(() => {
        navigate(isInvalid ? "/signup" : "/complete-setup");
      }, 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isInvalid, isSuccess, navigate]);

  if (isInvalid)
    return (
      <InvalidEmailVerification
        countdown={countdown}
        errorMsg={
          !verificationToken
            ? "Invalid Email verification link"
            : "Email verification failed"
        }
      />
    );
  if (isLoading) return <LoadingEmailVerification />;
  if (isSuccess) return <SuccessEmailVerification countdown={countdown} />;
};

export default EmailVerification;
