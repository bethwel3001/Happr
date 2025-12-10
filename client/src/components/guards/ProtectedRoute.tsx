import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoadingScreen from "@/components/ui/LoadingScreen";

interface ProtectedRouteProp {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProp) => {
  const { isUserAuthenticated, isFetchingUser } = useAuth();

  useEffect(() => {
    if (!isUserAuthenticated && !isFetchingUser)
      window.location.href = "/signin";
  }, [isUserAuthenticated, isFetchingUser]);

  if (isFetchingUser) return <LoadingScreen />;
  return <> {children} </>;
};

export default ProtectedRoute;
