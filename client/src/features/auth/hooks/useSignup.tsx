import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import signup from "../api/signup";
import type { SignupInputs, SignupResponse } from "../types";

const useSignup = (): UseMutationResult<
  SignupResponse,
  Error,
  SignupInputs
> => {
  return useMutation<SignupResponse, Error, SignupInputs>({
    mutationKey: ["signup"],
    mutationFn: (data: SignupInputs) => signup(data),
    onSuccess: (data: SignupResponse) => {
      toast.success(data.message);
    },
    onError: (error: unknown) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Server error");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred.");
      }
    }
  });
};

export default useSignup;
