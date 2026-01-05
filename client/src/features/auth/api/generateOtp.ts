import { axios } from "@/lib";
import type { ApiResponse } from "../types";
import { AxiosError } from "axios";

type Response = {
  success: boolean;
  message: string;
};

const GENERIC_MESSAGE =
  "If an account with this email exists, you will receive an email shortly.";

const generateOtp = async ({ email }: { email: string }): Promise<Response> => {
  try {
    await axios.post<ApiResponse>("/api/v1/user/generate-otp", { email });

    return { success: true, message: GENERIC_MESSAGE };
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("OTP generation error:", error?.response?.data?.message);

      if (error.response?.status === 404) {
        return { success: true, message: GENERIC_MESSAGE };
      }

      throw new Error(
        error.response?.data?.message || "Something went wrong on the server"
      );
    }

    throw new Error("Something went wrong while generating OTP");
  }
};

export default generateOtp;
