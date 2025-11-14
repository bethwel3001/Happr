interface UserStats {
  total_donations_received: number;
  total_donations_given: number;
  total_amount_received: number;
  total_amount_given: number;
  total_supporters: number;
}

interface UserData {
  id: string;
  email: string;
  username: string;
  bio: string | null;
  display_name: string | null;
  avatar: string;
  cover_photo: string;
  phone_number: string | null;
  auth_provider: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  bank_account: string | null;
  stats: UserStats;
  recent_donations: any[];
}

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

export type { UserData, GetUserResponse, ApiResponse};
