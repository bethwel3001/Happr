import type { Dispatch, SetStateAction } from "react";
import type { SigninInputs, SignupInputs, UserData } from "../types";

type UsernameAvailability = {
  success: boolean;
  message: string;
};

interface SignupResponse {
  success: boolean;
  message: string;
}

interface EmailVerificationResponse {
  success: boolean;
  message: string;
}

interface SigninResponse {
  success: boolean;
  message: string;
}

type AuthFormError = {
  fieldsError?: Record<string, string[]> | null;
};

interface AuthFuncResponse {
  success: boolean;
  fieldsError?: Record<string, string[]> | null;
}

type User = UserData | null;

interface AuthContextType {
  isFetchingUser: boolean;
  isUserAuthenticated: boolean;
  user: User;
  setUser: Dispatch<SetStateAction<User>>;
  signup: (data: SignupInputs) => Promise<AuthFuncResponse>;
  isSigningUp: boolean;
  signin: (data: SigninInputs) => Promise<AuthFuncResponse>;
  isSigningIn: boolean;
  signout: () => void;
  isSigningOut: boolean;
}

export type {
  UsernameAvailability,
  SignupResponse,
  SigninResponse,
  AuthFormError,
  EmailVerificationResponse,
  AuthFuncResponse,
  AuthContextType
};
