import { axios } from "@/lib";
import type { UserStats } from "@/types";
import { isAxiosError } from "axios";

interface ApiResponse {
    success: boolean;
    data: UserStats;
    message: string;
}

interface GetUserStatsResponse {
    success: boolean;
    data: UserStats | null;
    message: string;
}

export const getUserStats = async (): Promise<GetUserStatsResponse> => {
    try {
        const response = await axios.get<ApiResponse>("/api/v1/user/stats");

        return {
            success: response.success,
            data: response.data,
            message: response.message,
        };
    } catch (err: unknown) {
        if (isAxiosError(err)) {
            return {
                success: false,
                data: null,
                message: err.response?.data?.message || "Failed to fetch user stats",
            };
        }
        return {
            success: false,
            data: null,
            message: "An unexpected error occurred",
        }
    }
};
