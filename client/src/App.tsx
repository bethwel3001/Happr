import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import LoadingScreen from "@/components/ui/LoadingScreen";
import LandingPage from "@/pages/LandingPage";
import SupportPage from "@/pages/SupportPage";

// Auth Pages
const AuthLayout = lazy(() =>
  import("@/features/auth").then(module => ({ default: module.Layout }))
);
const SignupPage = lazy(() => import("@/pages/SignUp"));
const SigninPage = lazy(() => import("@/pages/SignIn"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));

// User Pages
const UserPagesLayout = lazy(
  () => import("@/components/layouts/UserPagesLayout")
);
const OnboardingPage = lazy(() => import("@/pages/Onboarding"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const SupportersPage = lazy(() => import("@/pages/Supporters"));
const PayoutPage = lazy(() => import("@/pages/Payout"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));

// pages array
const pages: { path: string; element: React.FC; cat: "auth" | "user" }[] = [
  { path: "/signup", element: SignupPage, cat: "auth" },
  { path: "/signin", element: SigninPage, cat: "auth" },
  { path: "/reset-password", element: ResetPassword, cat: "auth" },
  { path: "/complete-setup", element: OnboardingPage, cat: "auth" },
  { path: "/dashboard", element: Dashboard, cat: "user" },
  { path: "/supporters", element: SupportersPage, cat: "user" },
  { path: "/payout", element: PayoutPage, cat: "user" },
  { path: "/settings", element: SettingsPage, cat: "user" }
];

const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            {pages
              .filter(page => page.cat === "auth")
              .map(page => (
                <Route
                  key={page.path}
                  path={page.path}
                  element={<page.element />}
                />
              ))}
          </Route>

          {/* User Routes */}
          <Route element={<UserPagesLayout />}>
            {pages
              .filter(page => page.cat === "user")
              .map(page => (
                <Route
                  key={page.path}
                  path={page.path}
                  element={
                    <Suspense fallback={<LoadingScreen />}>
                      <page.element />
                    </Suspense>
                  }
                />
              ))}
          </Route>

          <Route path="/:username" element={<SupportPage />} />
        </Routes>
      </BrowserRouter>

      <Toaster />
    </>
  );
};
export default App;
