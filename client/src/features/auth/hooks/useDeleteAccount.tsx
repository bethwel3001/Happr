import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import deleteAccount from "../api/deleteAccount";

interface FuncResponse {
  success: boolean;
  message: string;
}

const useDeleteAccount = () => {
  const loadingToastId = useRef<string | number | null>(null);

  return useMutation<FuncResponse, Error, string>({
    mutationKey: ["delete", "account"],
    mutationFn: (id: string) => deleteAccount(id),
    onMutate: () => {
      loadingToastId.current = toast.loading("Deleting Account..");
    },
    onSuccess: () => {
      if (loadingToastId.current) toast.dismiss(loadingToastId.current);
    },
    onError: () => {
      if (loadingToastId.current) toast.dismiss(loadingToastId.current);
      toast.error("Account deletion failed");
    }
  });
};

export default useDeleteAccount;
