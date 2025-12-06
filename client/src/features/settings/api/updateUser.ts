import { axios } from "@/lib";
import type { ApiResponse } from "../types";
import type { Bank } from "@/types";

interface UserUpdate {
  id: string;
  email?: string;
  password?: string;
  username?: string;
  bio?: string;
  avatar?: File | null;
  cover_photo?: File | null;
  display_name?: string;
  website_link?: string;
  phone_number?: string;
  is_onboarded?: boolean;
  bank_account?: Bank;
}

const appendIfPresent = <T extends Record<string, unknown>>(
  form: FormData,
  key: keyof T,
  value: T[keyof T]
) => {
  if (value !== undefined && value !== null && value !== "") {
    if (typeof value === "object" && !(value instanceof File)) {
      form.append(String(key), JSON.stringify(value));
    } else {
      form.append(String(key), value as Blob | string);
    }
  }
};

const updateUser = async (data: UserUpdate): Promise<ApiResponse> => {
  try {
    const form = new FormData();

    (Object.keys(data) as (keyof UserUpdate)[]).forEach(key => {
      if (key === "id") return;
      appendIfPresent(form, key, data[key]);
    });

    const res = await axios.patch<ApiResponse>(
      `/api/v1/user/${data.id}`,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" }
      }
    );

    console.log(res);
    return {
      success: res.success,
      message: res.message,
      data: res.data
    };
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Something went wrong");
  }
};

export default updateUser;
