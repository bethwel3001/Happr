import { axios } from "@/lib";
import type { ApiResponse } from "../types";

type ResetPasswordArgs = {
  newPassword: string;
  accessToken: string;
};

type ResetPasswordResponse = {
  success: boolean;
  message: string;
};

const resetPassword = async ({
  newPassword,
  accessToken
}: ResetPasswordArgs): Promise<ResetPasswordResponse> => {
  try {
    const { success, message } = await axios.patch<ApiResponse>(
      "/api/v1/auth/reset-password",
      { newPassword },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    return { success, message };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Something went wrong while resetting your password.");
    }
  }
};

export default resetPassword;
