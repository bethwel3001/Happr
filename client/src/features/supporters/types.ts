type Supporter = {
  id: string;
  amount: number;
  message?: string | null;
  created_at: Date;
  is_guest: boolean;

  smile_count: number;
  smile_price: number;
  is_anonymous: boolean;
  supporter_name?: string | null;
  supporter_xhandle?: string | null;

  supporter?: {
    id: string;
    username: string;
    avatar?: string | null;
    cover_photo?: string | null;
  } | null;
};

export type { Supporter };
