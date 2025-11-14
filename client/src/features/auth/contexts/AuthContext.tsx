import { createContext, useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import getUser from "../api/getUser";
import useSignup from "../hooks/useSignup";
import useSignin from "../hooks/useSignin";
import useSignout from "../hooks/useSignout";
import type {
  SignupInputs,
  SigninInputs,
  FieldError,
  UserData,
  AuthFuncResponse,
  AuthContextType
} from "../types";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isUserAuthenticated, setIsUserAuthenticated] =
    useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);

  const navigate = useNavigate();
  const { mutate: rawSignup, isPending: isSigningUp } = useSignup();
  const { mutate: rawSignin, isPending: isSigningIn } = useSignin();
  const { mutate: rawSignout, isPending: isSigningOut } = useSignout();

  const userQuery = useQuery({
    queryKey: ["getUser"],
    queryFn: getUser
  });

  useEffect(() => {
    if (userQuery.isSuccess && userQuery.data) {
      setUser(userQuery.data.data);
      setIsUserAuthenticated(true);
    }

    if (userQuery.isError && userQuery.error instanceof Error) {
      toast.error("An error has occurred");
    }
  }, [userQuery.isSuccess, userQuery.data, userQuery.isError, userQuery.error]);

  const signup = (data: SignupInputs): Promise<AuthFuncResponse> => {
    return new Promise<AuthFuncResponse>((resolve, reject) => {
      rawSignup(
        {
          email: data.email.trim(),
          username: data.username.trim(),
          password: data.password.trim()
        },
        {
          onSuccess: () => resolve({ success: true }),
          onError: (error: unknown) => {
            if (isAxiosError(error) && error.response?.data?.errors) {
              const formattedErr = error.response.data.errors.reduce(
                (acc: Record<string, string[]>, curr: FieldError) => {
                  acc[curr.field] = curr.errors;
                  return acc;
                },
                {}
              );
              reject({ success: false, fieldsError: formattedErr });
            } else {
              reject({ success: false, fieldsError: null });
            }
          }
        }
      );
    });
  };

  const signin = (data: SigninInputs): Promise<AuthFuncResponse> => {
    return new Promise<AuthFuncResponse>((resolve, reject) => {
      rawSignin(
        {
          email: data.email.trim(),
          password: data.password.trim()
        },
        {
          onSuccess: () => {
            resolve({ success: true });
          },
          onError: (error: unknown) => {
            if (isAxiosError(error) && error.response?.data?.errors) {
              const formattedErr = error.response.data.errors.reduce(
                (acc: Record<string, string[]>, curr: FieldError) => {
                  acc[curr.field] = curr.errors;
                  return acc;
                },
                {}
              );
              reject({ success: false, fieldsError: formattedErr });
            } else {
              reject({ success: false, fieldsError: null });
            }
          }
        }
      );
    });
  };

  const signout = () => {
    rawSignout(undefined, {
      onSuccess: () => {
        setUser(null);
        setIsUserAuthenticated(false);
        setTimeout(() => navigate("/signin"), 1500);
      }
    });
  };

  const value = {
    isFetchingUser: userQuery.isLoading,
    isUserAuthenticated,
    user,
    signup,
    isSigningUp,
    signin,
    isSigningIn,
    signout,
    isSigningOut
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
