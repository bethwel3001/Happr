import { axios } from "@/lib";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

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
  username: string;
  bio?: string;
  display_name?: string;
  website_link?: string;
  phone_number?: string;
  is_onboarded: boolean;
  avatar?: string;
  cover_photo?: string;
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

const updateUser = async (data: UserUpdate): Promise<ApiResponse<UserData>> => {
  try {
    const { id, ...payload } = data;

    const res = await axios.patch<ApiResponse<UserData>>(
      `/api/v1/user/${id}`,
      payload,
    );

    return res;
  } catch (err: unknown) {
    if (err instanceof Error) throw err;
    throw new Error("Something went wrong");
  }
};

const getPresignedUrl = async (
  data: PresignedUrlRequest,
): Promise<ApiResponse<PresignedUrlData>> => {
  try {
    const res = await axios.post<ApiResponse<PresignedUrlData>>(
      "/api/v1/user/presigned-url",
      data,
    );

    return res;
  } catch (err: unknown) {
    if (err instanceof Error) throw err;
    throw new Error("Something went wrong");
  }
};

export { updateUser, getPresignedUrl };
