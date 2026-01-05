import { axios } from "@/lib";
import { AxiosError } from "axios";
import type { ApiResponse } from "../types";

type ReturnResponse = {
  success: boolean;
  message: string;
};

const updateEmail = async ({
  email
}: {
  email: string;
}): Promise<ReturnResponse> => {
  try {
    const response = await axios.patch<ApiResponse>(
      "/api/v1/user/change-email",
      {
        email
      }
    );

    return {
      success: response.success,
      message: response.message
    };
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const statusCode = error?.response?.status;
      console.log(error);

      if (statusCode === 401) {
        const errMessage = "Unauthorized, please login to change your email.";

        throw new Error(errMessage);
      }

      throw new Error("Server error, please try again.");
    } else {
      throw new Error("Something went wrong while updating email");
    }
  }
};

export default updateEmail;
