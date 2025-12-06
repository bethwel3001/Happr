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
    bank_name: string;
    account_name: string;
    account_number: string;
  };
  created_at: string | Date;
  updated_at: string | Date;
}

type User = UserData | null;

export type { UserData, User };
