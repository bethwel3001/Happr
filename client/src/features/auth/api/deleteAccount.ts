import { axios } from "@/lib";
import type { ApiResponse } from "../types";

const deleteAccount = async (
  id: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.delete<ApiResponse>(`/api/v1/user/${id}`);

    return {
      success: response.success ? true : false,
      message: response.message,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Something went wrong");
    }
  }
};

export default deleteAccount;
