import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";
import generateOtp from "../api/generateOtp";

type GenerateOtpResponse = {
  success: boolean;
  message: string;
};

const useGenerateOtp = (): UseMutationResult<
  GenerateOtpResponse,
  Error,
  { email: string }
> => {
  return useMutation({
    mutationKey: ["generate", "otp"],
    mutationFn: ({ email }) => generateOtp({ email }),
    onSuccess: ({ message }) => {
      toast.success(message);
    },
    onError: error => {
      if (error instanceof Error) toast.error(error.message);
    }
  });
};

export default useGenerateOtp;
