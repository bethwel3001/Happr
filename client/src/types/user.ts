interface UserData {
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
    account_number: string;
    account_name: string;
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

type User = UserData;

export type { UserData, User };
