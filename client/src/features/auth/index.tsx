// components
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import SignupForm from "./components/SignupForm";
import SigninForm from "./components/SigninForm";
import ResetPasswordForm from "./components/ResetPasswordForm";
import NewPasswordForm from "./components/NewPasswordForm";
import InvalidEmailVerification from "./components/email_verification/InvalidEmailVerification";
import LoadingEmailVerification from "./components/email_verification/LoadingEmailVerification";
import SuccessEmailVerification from "./components/email_verification/SuccessEmailVerification";

//hooks
import useUsernameAvailability from "./hooks/useUsernameAvailability";
import useEmailVerification from "./hooks/useEmailVerification";
import useGenerateOtp from "./hooks/useGenerateOtp";
import useVerifyPasswordOtp from "./hooks/useVerifyPasswordOtp";
import useResetPassword from "./hooks/useResetPassword";
import { useAuth } from "@/hooks/useAuth";

// images
import MailRed from "./assets/mail-red.png";

// exporting components
export {
  AuthProvider,
  Layout,
  SignupForm,
  SigninForm,
  ResetPasswordForm,
  NewPasswordForm,
  InvalidEmailVerification,
  LoadingEmailVerification,
  SuccessEmailVerification
};

// exporting hooks
export {
  useUsernameAvailability,
  useEmailVerification,
  useGenerateOtp,
  useVerifyPasswordOtp,
  useResetPassword,
  useAuth
};

// exporting assets
export { MailRed };
