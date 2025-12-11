import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import type {
  SignupInputs,
  SigninInputs,
  UserData,
  AuthFuncResponse,
} from "@/features/auth/types";

export interface AuthProviderProps {
  children: ReactNode;
}

export interface AuthContextType {
  isFetchingUser: boolean;
  isUserAuthenticated: boolean;
  user: UserData | null;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;

  signup: (data: SignupInputs) => Promise<AuthFuncResponse>;
  isSigningUp: boolean;

  signin: (data: SigninInputs) => Promise<AuthFuncResponse>;
  isSigningIn: boolean;

  signout: () => Promise<void>;
  isSigningOut: boolean;

  deleteAccount: () => Promise<AuthFuncResponse>;
  isDeletingAccount: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
