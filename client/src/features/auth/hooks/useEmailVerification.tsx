import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import verifyEmail from "../api/verifyEmail";
import type { EmailVerificationResponse } from "../types";

const useEmailVerification = ({
  verificationToken,
  username
}: {
  verificationToken: string;
  username: string;
}): UseQueryResult<EmailVerificationResponse, Error> => {
  return useQuery({
    queryKey: ["email", "verification", verificationToken, username],
    queryFn: ({ queryKey }) => {
      const [_key, _subKey, token] = queryKey;
      return verifyEmail(token as string);
    },
    enabled: !!verificationToken
  });
};

export default useEmailVerification;
