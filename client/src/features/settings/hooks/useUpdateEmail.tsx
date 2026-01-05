import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";
import updateEmail from "../api/updateEmail";
import { useAuth } from "@/hooks/useAuth";

type ReturnResponse = {
  success: boolean;
  message: string;
};

const useUpdateEmail = (): UseMutationResult<
  ReturnResponse,
  Error,
  { email: string }
> => {
  const { signout } = useAuth();

  return useMutation({
    mutationKey: ["update", "email"],
    mutationFn: ({ email }) => updateEmail({ email }),
    onSuccess: ({ message }) => {
      toast.success(message);

      setTimeout(() => {
        signout();
      }, 500);
    },
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  });
};

export default useUpdateEmail;
