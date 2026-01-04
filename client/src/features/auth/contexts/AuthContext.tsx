import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import getUser from "../api/getUser";
import useSignup from "../hooks/useSignup";
import useSignin from "../hooks/useSignin";
import useSignout from "../hooks/useSignout";
import useDeleteAccount from "../hooks/useDeleteAccount";
import type {
  SignupInputs,
  SigninInputs,
  FieldError,
  UserData,
  AuthFuncResponse,
} from "../types";
import type { AuthProviderProps } from "@/hooks/useAuth";
import { AuthContext } from "@/hooks/useAuth";

const excludedPaths = [
  "/signin",
  "/signup",
  "/reset-password",
  "/email-verification",
  "/complete-google-auth-setup",
  "/complete-x-auth-setup",
];

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isUserAuthenticated, setIsUserAuthenticated] =
    useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);

  const location = useLocation();
  const queryClient = useQueryClient();

  const { mutate: rawSignup, isPending: isSigningUp } = useSignup();
  const { mutate: rawSignin, isPending: isSigningIn } = useSignin();
  const { mutate: rawSignout, isPending: isSigningOut } = useSignout();
  const { mutate: rawAccountDeletion, isPending: isDeletingAccount } =
    useDeleteAccount();

  const userQuery = useQuery({
    queryKey: ["getUser"],
    queryFn: getUser,
  });

  useEffect(() => {
    const isExcluded =
      location.pathname === "/" ||
      excludedPaths.some((path) => location.pathname.startsWith(path));

    if (userQuery.isSuccess && userQuery.data) {
      if (userQuery.data.success && userQuery.data.data) {
        setUser(userQuery.data.data);
        setIsUserAuthenticated(true);
      } else {
        setUser(null);
        setIsUserAuthenticated(false);
      }
    }

    if (userQuery.isError && !isExcluded) {
      toast.error("An error has occurred");
    }
  }, [
    userQuery.isSuccess,
    userQuery.data,
    userQuery.isError,
    location.pathname,
  ]);

  const signup = (data: SignupInputs): Promise<AuthFuncResponse> => {
    return new Promise<AuthFuncResponse>((resolve, reject) => {
      rawSignup(
        {
          email: data.email.trim(),
          username: data.username.trim(),
          password: data.password.trim(),
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
                {},
              );
              reject({ success: false, fieldsError: formattedErr });
            } else {
              reject({ success: false, fieldsError: null });
            }
          },
        },
      );
    });
  };

  const signin = (data: SigninInputs): Promise<AuthFuncResponse> => {
    return new Promise<AuthFuncResponse>((resolve, reject) => {
      rawSignin(
        {
          email: data.email.trim(),
          password: data.password.trim(),
        },
        {
          onSuccess: async () => {
            await queryClient.invalidateQueries({
              queryKey: ["getUser"],
              exact: true,
            });
            resolve({ success: true });
          },
          onError: (error: unknown) => {
            if (isAxiosError(error) && error.response?.data?.errors) {
              const formattedErr = error.response.data.errors.reduce(
                (acc: Record<string, string[]>, curr: FieldError) => {
                  acc[curr.field] = curr.errors;
                  return acc;
                },
                {},
              );
              reject({ success: false, fieldsError: formattedErr });
            } else {
              reject({ success: false, fieldsError: null });
            }
          },
        },
      );
    });
  };

  const signout = async (): Promise<void> => {
    await new Promise<void>((resolve, reject) => {
      rawSignout(undefined, {
        onSuccess: () => {
          setUser(null);
          setIsUserAuthenticated(false);
          resolve();
        },
        onError: (err) => reject(err),
      });
    });
  };

  const deleteAccount = async (): Promise<AuthFuncResponse> => {
    if (!user) return { success: false };
    return await new Promise<AuthFuncResponse>((resolve) => {
      rawAccountDeletion(user.id, {
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: ["getUser"],
            exact: true,
          });
          setUser(null);
          setIsUserAuthenticated(false);
          resolve({ success: true });
        },
        onError: () => resolve({ success: false }),
      });
    });
  };

  const value = {
    isFetchingUser: userQuery.isLoading,
    isUserAuthenticated,
    user,
    setUser,
    signup,
    isSigningUp,
    signin,
    isSigningIn,
    signout,
    isSigningOut,
    deleteAccount,
    isDeletingAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
