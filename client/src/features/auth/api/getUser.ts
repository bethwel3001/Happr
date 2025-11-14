import { axios } from "@/lib";
import type { UserData, GetUserResponse } from "../types";

interface ApiResponse {
  success: boolean;
  data: UserData;
  message: string;
}

const getUser = async (): Promise<GetUserResponse> => {
  try {
    const response = await axios.get<ApiResponse>("/api/v1/user/me");

    return {
      success: response.success,
      data: response.data,
      message: response.message
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("Something went wrong");
  }
};

export default getUser;
