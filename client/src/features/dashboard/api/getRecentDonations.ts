import { axios } from "@/lib";
import type { DonationDetails } from "@/types";
import { isAxiosError } from "axios";

interface ApiResponse {
    success: boolean;
    data: DonationDetails[];
    message: string;
}

interface GetRecentDonationsResponse {
    success: boolean;
    data: DonationDetails[];
    message: string;
}

export const getRecentDonations = async (
    page: number = 1,
    limit: number = 10
): Promise<GetRecentDonationsResponse> => {
    try {
        const response = await axios.get<ApiResponse>(
            `/api/v1/user/donations?page=${page}&limit=${limit}`
        );

        return {
            success: response.success,
            data: response.data,
            message: response.message,
        };
    } catch (err: unknown) {
        if (isAxiosError(err)) {
            return {
                success: false,
                data: [],
                message: err.response?.data?.message || "Failed to fetch recent donations",
            };
        }
        return {
            success: false,
            data: [],
            message: "An unexpected error occurred",
        }
    }
};
