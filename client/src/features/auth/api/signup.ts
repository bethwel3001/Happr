import { axios } from "@/lib";
import type { SignupInputs, SignupResponse } from "../types";

const signup = async ({
  email,
  username,
  password
}: SignupInputs): Promise<SignupResponse> => {
  try {
    const response = await axios.post<SignupResponse>("/api/v1/auth/register", {
      email,
      username,
      password
    });

    return {
      success: response.success ? true : false,
      message: response.message
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Something went wrong");
    }
  }
};

export default signup;
