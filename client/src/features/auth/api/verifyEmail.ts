import { axios } from "@/lib";
import type { EmailVerificationResponse } from "../types";

const verifyEmail = async (
  verificationToken: string
): Promise<EmailVerificationResponse> => {
  try {
    const response = await axios.get<EmailVerificationResponse>(
      `/api/v1/auth/verify-email?token=${verificationToken}`
    );

    return {
      success: response.success,
      message: response.message
    };
  } catch (error: unknown) {
    if (error instanceof Error) throw error;
    else throw new Error("something went wrong.");
  }
};
export default verifyEmail;
