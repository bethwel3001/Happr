
import { axios } from "@/lib";
import { isAxiosError } from "axios";
import type { DonationDetails } from "@/types";

interface GetPublicDonationsResponse {
    success: boolean;
    data: DonationDetails[];
    message: string;
}

const getPublicDonations = async (
    username: string,
    page = 1,
    limit = 10
): Promise<GetPublicDonationsResponse> => {
    try {
        const response = await axios.get<GetPublicDonationsResponse>(
            `/api/v1/user/${username}/donations`,
            { params: { page, limit } }
        );
        return response;
    } catch (err: unknown) {
        if (isAxiosError(err)) {
            throw new Error(
                err.response?.data?.message || "Failed to fetch donations"
            );
        }
        throw new Error("An unexpected error occurred");
    }
};

export default getPublicDonations;
