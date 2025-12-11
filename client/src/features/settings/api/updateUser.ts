import { axios } from "@/lib";

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
}

export interface UserData {
  id: string;
  email: string;
  password: string;
  username: string;
  bio: string;
  avatar: string;
  cover_photo: string;
  display_name: string;
  website_link: string;
  phone_number: string;
  is_onboarded: boolean;
  auth_provider: string;
  is_verified: boolean;
  bank_account: {
    bank_name: string;
    account_name: string;
    account_number: string;
  };
  stats: {
    total_amount_given: number;
    total_amount_received: number;
    total_donations_given: number;
    total_donations_received: number;
    total_supporters: number;
  };
  recent_donations: [];
  created_at: string | Date;
  updated_at: string | Date;
}

export interface PresignedUrlRequest {
  file_size: number;
  content_type: string;
}

export interface PresignedUrlData {
  presigned_url: string;
  objectKey: string;
  expiresIn: number;
}

interface SimpleApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const updateUser = async (
  data: UserUpdate,
): Promise<SimpleApiResponse<UserData>> => {
  try {
    const { id, ...payload } = data;

    const response = await axios.patch<SimpleApiResponse<UserData>>(
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

const getPresignedUrl = async (
  data: PresignedUrlRequest,
): Promise<SimpleApiResponse<PresignedUrlData>> => {
  try {
    const response = await axios.post<SimpleApiResponse<PresignedUrlData>>(
      "/api/v1/user/presigned-url",
      data,
    );

    return response;
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Something went wrong while getting presigned URL";
    throw new Error(errorMessage);
  }
};

export { updateUser, getPresignedUrl };
