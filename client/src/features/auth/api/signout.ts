import { axios } from "@/lib";
import type { ApiResponse } from "../types";

const signout = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await axios.delete<ApiResponse>("/api/v1/auth/signout");

    return {
      success: res.success,
      message: res.message
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("something went wrong");
    }
  }
};
export default signout;
