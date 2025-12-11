import { axios } from "@/lib";

interface GoogleAuthResponse {
  data: {
    uri: string;
  };
}

export const getGoogleAuthUri = async (): Promise<string> => {
  const response = await axios.get<GoogleAuthResponse>(
    "/api/v1/auth/google-auth",
  );
  const data = response.data.uri;

  if (!data) throw new Error("Failed to get Google auth URI");

  return data;
};
