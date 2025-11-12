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
  const res = await axios.get<ApiResponse<[]>>(
    `/api/v1/auth/username?username=${username}`
  );

  return {
    success: res.success,
    message: res.message
  };
};

export default checkUsernameAvailability;
