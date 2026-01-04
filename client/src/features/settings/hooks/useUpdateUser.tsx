import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { updateUser } from "../api/updateUser";
import type { ApiResponse, UserData } from "../types";

interface PrivateInfoUpdate {
  username?: string;
  email?: string;
  password?: string;
}

interface PublicInfoUpdate {
  avatar?: string;
  cover_photo?: string;
  display_name?: string;
  bio?: string;
  website_link?: string;
  is_onboarded?: string;
}

const useUpdateUser = () => {
  const { user, setUser } = useAuth();

  const handleSuccess = (data: ApiResponse<UserData>) => {
    const updatedUser = data.data;
    setUser(prev => (prev ? { ...prev, ...updatedUser } : updatedUser));
  };

  const privateInfoMutation = useMutation<
    ApiResponse<UserData>,
    Error,
    PrivateInfoUpdate
  >({
    mutationKey: ["updateUser", "privateInfo"],
    mutationFn: (payload): Promise<ApiResponse<UserData>> =>
      updateUser({
        id: user!.id,
        ...payload
      }) as Promise<ApiResponse<UserData>>,
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

  const publicInfoMutation = useMutation<
    ApiResponse<UserData>,
    Error,
    PublicInfoUpdate
  >({
    mutationKey: ["updateUser", "publicInfo"],
    mutationFn: (payload): Promise<ApiResponse<UserData>> =>
      updateUser({
        id: user!.id,
        ...payload
      }) as Promise<ApiResponse<UserData>>,
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
