
import { useQuery } from "@tanstack/react-query";
import getPublicProfile from "../api/getPublicProfile";
import type { GetPublicProfileResponse } from "../types";

export const usePublicProfile = (username: string | undefined) => {
    return useQuery<GetPublicProfileResponse, Error>({
        queryKey: ["publicProfile", username],
        queryFn: () => getPublicProfile(username!),
        enabled: !!username,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });
};
