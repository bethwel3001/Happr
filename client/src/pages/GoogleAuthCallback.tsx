import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

type AuthStatus = "success" | "error";

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status") as AuthStatus | null;
  const username = searchParams.get("username");
  const isOnboarded = searchParams.get("is_onboarded") === "true";

  const isSuccess = status === "success";
  const isError = status === "error";

  const [countdown, setCountdown] = useState(1);

  useEffect(() => {
    if (!status) {
      navigate("/signup", { replace: true });
      return;
    }

    const interval = setInterval(() => {
      setCountdown((v) => v - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      if (isSuccess) {
        if (isOnboarded) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/complete-setup", { replace: true });
        }
      } else {
        navigate("/signin", { replace: true });
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [status, isSuccess, isOnboarded, navigate]);

  return (
    <section className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-10 shadow-xl flex flex-col items-center gap-6 text-center">
        {isSuccess && (
          <svg
            viewBox="0 0 52 52"
            className="w-20 h-20 text-green-500 animate-scale-in"
            fill="none"
          >
            <circle
              cx="26"
              cy="26"
              r="25"
              className="stroke-current opacity-20"
              strokeWidth="2"
            />
            <circle
              cx="26"
              cy="26"
              r="25"
              className="stroke-current"
              strokeWidth="2"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="1"
            >
              <animate
                attributeName="stroke-dashoffset"
                dur="0.6s"
                from="1"
                to="0"
                fill="freeze"
              />
            </circle>
            <path
              d="M14 27 L23 35 L38 18"
              className="stroke-current"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="1"
            >
              <animate
                attributeName="stroke-dashoffset"
                dur="0.4s"
                begin="0.6s"
                from="1"
                to="0"
                fill="freeze"
              />
            </path>
          </svg>
        )}

        {isError && (
          <svg
            viewBox="0 0 52 52"
            className="w-20 h-20 text-red-500 animate-scale-in"
            fill="none"
          >
            <circle
              cx="26"
              cy="26"
              r="25"
              className="stroke-current opacity-20"
              strokeWidth="2"
            />
            <circle
              cx="26"
              cy="26"
              r="25"
              className="stroke-current"
              strokeWidth="2"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="1"
            >
              <animate
                attributeName="stroke-dashoffset"
                dur="0.6s"
                from="1"
                to="0"
                fill="freeze"
              />
            </circle>
            <path
              d="M18 18 L34 34 M34 18 L18 34"
              className="stroke-current"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="1"
            >
              <animate
                attributeName="stroke-dashoffset"
                dur="0.4s"
                begin="0.6s"
                from="1"
                to="0"
                fill="freeze"
              />
            </path>
          </svg>
        )}

        <h1 className="text-2xl font-semibold">
          {isSuccess && `Welcome ${username || ''}!`}
          {isError && "Google sign-in failed"}
        </h1>

        <p className="text-muted-foreground">
          {isSuccess && "Redirecting..."}
          {isError && "Redirecting back to sign in"}
        </p>

        <div className="w-full h-1 bg-muted rounded overflow-hidden">
          <div
            className={`h-full transition-all duration-[1000ms] ${isSuccess ? "bg-green-500" : "bg-red-500"
              }`}
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </section>
  );
};

export default GoogleAuthCallback;

