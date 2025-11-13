type UsernameAvailability = {
  success: boolean;
  message: string;
};

type SignupInputs = {
  email: string;
  username: string;
  password: string;
};

interface SignupResponse {
  success: boolean;
  message: string;
}

interface FieldError {
  field: string;
  errors: string[];
}

interface EmailVerificationResponse {
  success: boolean;
  message: string;
}

type SigninInputs = {
  email: string;
  password: string;
};

interface SigninResponse {
  success: boolean;
  message: string;
}

export type {
  UsernameAvailability,
  SignupInputs,
  SignupResponse,
  FieldError,
  EmailVerificationResponse,
  SigninInputs,
  SigninResponse
};
