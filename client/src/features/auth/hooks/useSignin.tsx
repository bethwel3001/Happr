import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import signin from "../api/signin";
import type { SigninInputs, SigninResponse } from "../types";

const useSignin = (): UseMutationResult<
  SigninResponse,
  Error,
  SigninInputs
> => {
  return useMutation<SigninResponse, Error, SigninInputs>({
    mutationKey: ["signin"],
    mutationFn: (data: SigninInputs) => signin(data),
    onSuccess: (data: SigninResponse) => {
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

export default useSignin;
