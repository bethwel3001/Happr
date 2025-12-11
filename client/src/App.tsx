import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import LoadingScreen from "@/components/ui/LoadingScreen";
import LandingPage from "@/pages/LandingPage";
import SupportPage from "@/pages/SupportPage";

// route guards
import { ProtectedRoute, PublicRoute } from "@/components/guards";

const AuthLayout = lazy(() =>
  import("@/features/auth").then((module) => ({ default: module.Layout })),
);
const UserPagesLayout = lazy(
  () => import("@/components/layouts/UserPagesLayout"),
);

// Auth Pages
const authPages = {
  signup: lazy(() => import("@/pages/SignUp")),
  signin: lazy(() => import("@/pages/SignIn")),
  "reset-assword": lazy(() => import("@/pages/ResetPassword")),
  "email-verification": lazy(() => import("@/pages/EmailVerification")),
  "complete-setup": lazy(() => import("@/pages/Onboarding")),
  "complete-google-auth-setup": lazy(
    () => import("@/pages/GoogleAuthCallback"),
  ),
};

// User Pages
const userPages = {
  dashboard: lazy(() => import("@/pages/Dashboard")),
  supporters: lazy(() => import("@/pages/Supporters")),
  payout: lazy(() => import("@/pages/Payout")),
  settings: lazy(() => import("@/pages/SettingsPage")),
};

const App = () => {
  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route element={<AuthLayout />}>
            {Object.entries(authPages).map(([path, Component]) => (
              <Route
                key={path}
                path={`/${path}`}
                element={
                  <PublicRoute>
                    <Component />
                  </PublicRoute>
                }
              />
            ))}
          </Route>

          <Route element={<UserPagesLayout />}>
            {Object.entries(userPages).map(([path, Component]) => (
              <Route
                key={path}
                path={`/${path}`}
                element={
                  <ProtectedRoute>
                    <Component />
                  </ProtectedRoute>
                }
              />
            ))}
          </Route>

          <Route path="/:username" element={<SupportPage />} />
        </Routes>
      </Suspense>

      <Toaster duration={2000} />
    </>
  );
};

export default App;
