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

interface AuthFuncResponse {
  success: boolean;
  fieldsError?: Record<string, string[]> | null;
}

type User = UserData | null;

interface AuthContextType {
  isFetchingUser: boolean;
  isUserAuthenticated: boolean;
  user: User;
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
  EmailVerificationResponse,
  AuthFuncResponse,
  AuthContextType
};
