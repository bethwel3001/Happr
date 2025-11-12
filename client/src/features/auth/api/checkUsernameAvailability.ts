import { axios } from "@/lib";
import type { UsernameAvailability } from "../types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const checkUsernameAvailability = async (
  username: string
): Promise<UsernameAvailability> => {
  try {
    const res = await axios.get<ApiResponse<[]>>(
      `/api/v1/auth/username?username=${username}`
    );

    return {
      success: res.success,
      message: res.message
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Something went wrong");
    }
  }
};

export default checkUsernameAvailability;
