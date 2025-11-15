import type { UserData } from "@/types";

/* interface UserStats {
  total_donations_received: number;
  total_donations_given: number;
  total_amount_received: number;
  total_amount_given: number;
  total_supporters: number;
}
*/

interface GetUserResponse {
  success: boolean;
  data: UserData;
  message: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {};
}

export type { UserData, GetUserResponse, ApiResponse };
