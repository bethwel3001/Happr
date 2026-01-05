import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";

import verifyResetPasswordOtp from "../api/verifyResetPasswordOtp";
import { setAccessToken } from "@/features/auth/lib/auth-token";

type VerifyPasswordOtpResponse = {
  success: boolean;
  message: string;
  accessToken: string;
};

type VerifyPasswordOtpArg = {
  email: string;
  otp: string;
};

const useVerifyPasswordOtp = (): UseMutationResult<
  VerifyPasswordOtpResponse,
  Error,
  VerifyPasswordOtpArg
> => {
  return useMutation({
    mutationKey: ["verify", "password-reset", "otp"],
    mutationFn: ({ email, otp }) => verifyResetPasswordOtp({ email, otp }),

    onSuccess: ({ message, accessToken }) => {
      setAccessToken(accessToken);
      toast.success(message);
    },

    onError: error => {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  });
};

export default useVerifyPasswordOtp;
