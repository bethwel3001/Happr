import { axios } from "@/lib";
import type { SigninInputs, SigninResponse } from "../types";

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T[];
}

const signin = async ({
  email,
  password
}: SigninInputs): Promise<SigninResponse> => {
  try {
    const response = await axios.post<ApiResponse>("/api/v1/auth/signin", {
      email,
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

export default signin;
