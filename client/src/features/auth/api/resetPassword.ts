import { axios } from "@/lib";
import { AxiosError } from "axios";
import type { ApiResponse } from "../types";

const resetPassword = async ({ newPassword }: { newPassword: string }) => {
  try {
    const { success, message } = await axios.patch<ApiResponse>(
      "/api/v1/auth/reset-password",
      {
        newPassword
      }
    );

    return { success, message };
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Reset password eror:", error);
      throw new Error("Something went wrong on the server");
    }

    throw new Error("Something went wrong while reseting password");
  }
};

export default resetPassword;
