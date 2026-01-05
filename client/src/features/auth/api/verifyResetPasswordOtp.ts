import { axios } from "@/lib";
import { AxiosError } from "axios";

type FuncArgs = {
  email: string;
  otp: string;
};

type ReturnResponse = {
  success: boolean;
  message: string;
  accessToken: string;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data: { accessToken: string };
};

const verifyResetPasswordOtp = async ({
  email,
  otp
}: FuncArgs): Promise<ReturnResponse> => {
  try {
    const { success, data } = await axios.post<ApiResponse>(
      "/api/v1/auth/verify-forgot-email-password-otp",
      {
        email,
        otp
      }
    );

    return {
      success,
      message: "OTP verified successfully, redirecting you...",
      accessToken: data.accessToken
    };
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const status = error.response?.status;

      if (status === 400 || status === 404) {
        throw new Error("Invalid OTP");
      }

      throw new Error(
        error.response?.data?.message || "Something went wrong on the server"
      );
    }

    throw new Error("Something went wrong while verifying OTP");
  }
};

export default verifyResetPasswordOtp;
