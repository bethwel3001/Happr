import type { UserData } from "@/types";

interface ApiResponse {
  success: boolean;
  message: string;
  data: UserData;
}

export type { ApiResponse };
