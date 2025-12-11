import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoadingScreen from "@/components/ui/LoadingScreen";

interface PublicRouteProp {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProp) => {
  const { isUserAuthenticated, isFetchingUser } = useAuth();

  useEffect(() => {
    if (isUserAuthenticated && !isFetchingUser)
      window.location.href = "/dashboard";
  }, [isUserAuthenticated, isFetchingUser]);

  if (isFetchingUser) return <LoadingScreen />;
  return <> {children} </>;
};

export default PublicRoute;
