import { axios } from "@/lib";
import type { ApiResponse, UserData } from "../types";

export interface UserUpdate {
  id: string;
  email?: string;
  username?: string;
  bio?: string;
  display_name?: string;
  website_link?: string;
  phone_number?: string;
  is_onboarded?: boolean;
  avatar?: string;
  cover_photo?: string;
  smile_price?: number;
}

export interface SignatureRequest {
  file_size: number;
  content_type: string;
}

export interface SignatureData {
  signature: string;
  timestamp: number;
  folder: string;
  public_id: string;
  cloud_name: string;
  api_key: string;
}

const updateUser = async (
  data: UserUpdate,
): Promise<ApiResponse<UserData>> => {
  try {
    const { id, ...payload } = data;

    const response = await axios.patch<ApiResponse<UserData>>(
      `/api/v1/user/${id}`,
      payload,
    );

    return response;
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Something went wrong while updating user";
    throw new Error(errorMessage);
  }
};

const getSignature = async (
  data: SignatureRequest,
): Promise<ApiResponse<SignatureData>> => {
  try {
    const response = await axios.post<ApiResponse<SignatureData>>(
      "/api/v1/user/signature",
      data,
    );

    return response;
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Something went wrong while getting signature";
    throw new Error(errorMessage);
  }
};

export { updateUser, getSignature };

