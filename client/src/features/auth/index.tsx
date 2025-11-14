// components
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import SignupForm from "./components/SignupForm";
import SigninForm from "./components/SigninForm";
import ResetPasswordForm from "./components/ResetPasswordForm";
import InvalidEmailVerification from "./components/email_verification/InvalidEmailVerification";
import LoadingEmailVerification from "./components/email_verification/LoadingEmailVerification";
import SuccessEmailVerification from "./components/email_verification/SuccessEmailVerification";

//hooks
import useUsernameAvailability from "./hooks/useUsernameAvailability";
import useEmailVerification from "./hooks/useEmailVerification";
import useAuth from "./hooks/useAuth";

// images
import MailRed from "./assets/mail-red.png";

// exporting components
export {
  AuthProvider,
  Layout,
  SignupForm,
  SigninForm,
  ResetPasswordForm,
  InvalidEmailVerification,
  LoadingEmailVerification,
  SuccessEmailVerification
};

// exporting hooks
export { useUsernameAvailability, useEmailVerification, useAuth };

// exporting assets
export { MailRed };
