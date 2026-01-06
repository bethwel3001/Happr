
import type { UserStats, DonationDetails } from "@/types";

export interface PublicUserProfile {
    username: string;
    display_name?: string | null;
    bio?: string | null;
    avatar?: string | null;
    cover_photo?: string | null;
    is_verified: boolean;
    website_link?: string | null;
    created_at: string | Date;
    stats?: UserStats;
    recent_donations?: DonationDetails[];
    smile_price?: number;
}

export interface InitializeDonationPayload {
    creator_username: string;
    smile_count: number;
    message?: string;
    sender_name?: string;
    sender_email: string;
    sender_xhandle?: string;
    is_anonymous?: boolean;
}

export interface InitializeDonationResponse {
    success: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

export interface GetPublicProfileResponse {
    success: boolean;
    data: PublicUserProfile;
    message: string;
}
