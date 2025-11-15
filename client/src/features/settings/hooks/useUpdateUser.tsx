import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/features/auth";
import updateUser from "../api/updateUser";
import type { ApiResponse } from "../types";

interface PrivateInfoUpdate {
  id: string;
  username?: string;
  email?: string;
  password?: string;
}

interface PublicInfoUpdate {
  id: string;
  avatar?: File | null;
  cover_photo?: File | null;
  display_name?: string;
  bio?: string;
  website_link?: string;
}

const useUpdateUser = () => {
  const { setUser } = useAuth();

  const privateInfoMutation = useMutation<
    ApiResponse,
    Error,
    PrivateInfoUpdate
  >({
    mutationKey: ["updateUser", "privateInfo"],
    mutationFn: data => updateUser(data),
    onSuccess: data => {
      const updatedUser = data.data;
      setUser(prev => (prev ? { ...prev, ...updatedUser } : updatedUser));

      toast.success("Private info updated successfully");
    },
    onError: (error: unknown) => {
      toast.error("Failed to update private info");

      if (error instanceof Error) {
        console.error("Updating private info failed:", error);
      }
    }
  });

  const publicInfoMutation = useMutation<ApiResponse, Error, PublicInfoUpdate>({
    mutationKey: ["updateUser", "publicInfo"],
    mutationFn: data => updateUser(data),
    onSuccess: data => {
      const updatedUser = data.data;
      setUser(prev => (prev ? { ...prev, ...updatedUser } : updatedUser));

      toast.success("Public info updated successfully");
    },
    onError: (error: unknown) => {
      toast.error("Failed to update public info");

      if (error instanceof Error) {
        console.error("Updating public info failed:", error);
      }
    }
  });

  return {
    updatePrivateInfo: privateInfoMutation.mutateAsync,
    updatePublicInfo: publicInfoMutation.mutateAsync,
    isUpdating: privateInfoMutation.isPending || publicInfoMutation.isPending
  };
};

export default useUpdateUser;
