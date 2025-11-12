import { useQuery } from "@tanstack/react-query";
import checkUsernameAvailability from "../api/checkUsernameAvailability";
import type { UsernameAvailability } from "../types";

const useUsernameAvailability = (username: string) => {
  const query = useQuery<UsernameAvailability>({
    queryKey: ["username", "availability", username],
    queryFn: () => checkUsernameAvailability(username),
    enabled: false,
    retry: false
  });

  return query;
};

export default useUsernameAvailability;
