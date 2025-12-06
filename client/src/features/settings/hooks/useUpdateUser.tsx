import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/features/auth";
import updateUser from "../api/updateUser";
import type { ApiResponse } from "../types";

interface PrivateInfoUpdate {
  username?: string;
  email?: string;
  password?: string;
}

interface PublicInfoUpdate {
  avatar?: File | null;
  cover_photo?: File | null;
  display_name?: string;
  bio?: string;
  website_link?: string;
}

const useUpdateUser = () => {
  const { user, setUser } = useAuth();

  const handleSuccess = (data: ApiResponse) => {
    const updatedUser = data.data;
    setUser(prev => (prev ? { ...prev, ...updatedUser } : updatedUser));
  };

  const privateInfoMutation = useMutation<
    ApiResponse,
    Error,
    PrivateInfoUpdate
  >({
    mutationKey: ["updateUser", "privateInfo"],

    mutationFn: payload =>
      updateUser({
        id: user!.id,
        ...payload
      }),

    onSettled: (data, error) => {
      if (error) {
        toast.error("Failed to update private info");
        console.error(error);
        return;
      }

      handleSuccess(data!);
      toast.success("Private info updated successfully");
    }
  });

  const publicInfoMutation = useMutation<ApiResponse, Error, PublicInfoUpdate>({
    mutationKey: ["updateUser", "publicInfo"],

    mutationFn: payload =>
      updateUser({
        id: user!.id,
        ...payload
      }),

    onSettled: (data, error) => {
      if (error) {
        toast.error("Failed to update public info");
        return;
      }

      handleSuccess(data!);
      toast.success("Public info updated successfully");
    }
  });

  return {
    updatePrivateInfo: privateInfoMutation.mutateAsync,
    updatePublicInfo: publicInfoMutation.mutateAsync,
    isUpdating: privateInfoMutation.isPending || publicInfoMutation.isPending
  };
};

export default useUpdateUser;
