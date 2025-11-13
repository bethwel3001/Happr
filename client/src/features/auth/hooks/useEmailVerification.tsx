import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import verifyEmail from "../api/verifyEmail";
import type { EmailVerificationResponse } from "../types";

const useEmailVerification = ({
  verificationToken
}: {
  verificationToken: string;
}): UseQueryResult<EmailVerificationResponse, Error> => {
  return useQuery({
    queryKey: ["email", "verification", verificationToken],
    queryFn: ({ queryKey }) => {
      const [_key, _subKey, token] = queryKey;
      return verifyEmail(token as string);
    },
    enabled: !!verificationToken
  });
};

export default useEmailVerification;
