import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";

import resetPassword from "../api/resetPassword";
import {
  getAccessToken,
  removeAccessToken
} from "@/features/auth/lib/auth-token";

type FieldError = {
  field: string;
  errors: string[];
};

type ResetPasswordResponse = {
  success: boolean;
  message: string;
};

type ApiErrorResponse = {
  success: false;
  message?: string;
  fieldsError?: Record<string, string[]>;
};

const useResetPassword = (): UseMutationResult<
  ResetPasswordResponse,
  ApiErrorResponse,
  { newPassword: string }
> => {
  return useMutation({
    mutationKey: ["reset", "password"],
    mutationFn: async ({ newPassword }) => {
      const accessToken = getAccessToken();

      if (!accessToken) {
        throw {
          success: false,
          message: "Password reset session expired. Please restart the process."
        } as ApiErrorResponse;
      }

      try {
        return await resetPassword({ newPassword, accessToken });
      } catch (error: unknown) {
        if (isAxiosError(error) && error.response?.data?.errors) {
          const formattedErrors = error.response.data.errors.reduce(
            (acc: Record<string, string[]>, curr: FieldError) => {
              acc[curr.field] = curr.errors;
              return acc;
            },
            {}
          );

          throw {
            success: false,
            fieldsError: formattedErrors
          } as ApiErrorResponse;
        }

        throw {
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Something went wrong while resetting password"
        } as ApiErrorResponse;
      }
    },

    onSuccess: ({ message }) => {
      removeAccessToken();
      toast.success(message);
    }
  });
};

export default useResetPassword;
