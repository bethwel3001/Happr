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
    bank_id: string;
    bank_code: string;
    longcode?: string | null;
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

const getSignature = async (
  data: SignatureRequest,
): Promise<SimpleApiResponse<SignatureData>> => {
  try {
    const response = await axios.post<SimpleApiResponse<SignatureData>>(
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

