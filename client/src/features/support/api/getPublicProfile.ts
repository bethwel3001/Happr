
import { axios } from "@/lib";
import type { GetPublicProfileResponse } from "../types";
import { isAxiosError } from "axios";

const getPublicProfile = async (
    username: string
): Promise<GetPublicProfileResponse> => {
    try {
        const response = await axios.get<GetPublicProfileResponse>(
            `/api/v1/user/${username}`
        );

        return response;
    } catch (err: unknown) {
        if (isAxiosError(err)) {
            throw new Error(
                err.response?.data?.message ||
                "Failed to fetch public profile. Please try again."
            );
        }
        throw new Error("An unexpected error occurred");
    }
};

export default getPublicProfile;
