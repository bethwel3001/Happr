import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";
import resetPassword from "../api/resetPassword";

type ResetPasswordResponse = {
  success: boolean;
  message: string;
};

const useResetPassword = (): UseMutationResult<
  ResetPasswordResponse,
  Error,
  { newPassword: string }
> => {
  return useMutation({
    mutationKey: ["reset", "password"],
    mutationFn: ({ newPassword }) => resetPassword({ newPassword }),
    onSuccess: ({ message }) => {
      toast.success(message);
    },
    onError: error => {
      if (error instanceof Error) toast.error(error.message);
    }
  });
};

export default useResetPassword;
