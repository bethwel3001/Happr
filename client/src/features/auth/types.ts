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

export type { UsernameAvailability, SignupInputs, SignupResponse, FieldError };
