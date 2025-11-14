import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import signout from "../api/signout";

interface FuncResponse {
  success: boolean;
  message: string;
}

const useSignout = () => {
  const loadingToastId = useRef<string | number | null>(null);

  return useMutation<FuncResponse, Error, void>({
    mutationKey: ["logout"],
    mutationFn: () => signout(),
    onMutate: () => {
      loadingToastId.current = toast.loading("Signing out..");
    },
    onSuccess: data => {
      if (loadingToastId.current) {
        toast.dismiss(loadingToastId.current);
      }
      toast.success(data?.message || "Signed out successfully");
    },
    onError: (error: unknown) => {
      if (loadingToastId.current) {
        toast.dismiss(loadingToastId.current);
      }

      if (error instanceof Error) toast.error("Signout failed");
    }
  });
};

export default useSignout;
