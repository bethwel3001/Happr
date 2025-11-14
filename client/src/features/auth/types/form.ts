type SignupInputs = {
  email: string;
  username: string;
  password: string;
};

type SigninInputs = {
  email: string;
  password: string;
};

interface FieldError {
  field: string;
  errors: string[];
}

export type { SignupInputs, SigninInputs, FieldError };
