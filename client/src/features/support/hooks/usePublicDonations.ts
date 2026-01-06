
import { useQuery } from "@tanstack/react-query";
import getPublicDonations from "../api/getPublicDonations";
import type { DonationDetails } from "@/types";

interface PublicDonationsResponse {
    success: boolean;
    data: DonationDetails[];
    message: string;
}

export const usePublicDonations = (username: string | undefined) => {
    return useQuery<PublicDonationsResponse, Error>({
        queryKey: ["publicDonations", username],
        queryFn: () => getPublicDonations(username!),
        enabled: !!username,
        staleTime: 1000 * 60 * 1,
    });
};
