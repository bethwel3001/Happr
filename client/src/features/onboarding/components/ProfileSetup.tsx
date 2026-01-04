import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateUser } from "@/features/settings";
import { AvatarUploader } from "@/features/settings";
import { getSignature } from "@/features/settings/api/updateUser";
import type {
  SignatureRequest,
  SignatureData
} from "@/features/settings/api/updateUser";
import Input from "@/components/ui/Input";

type PageProps = {
  submitCount: number;
  onSubmitComplete: () => void;
  onLoadingChange: (loading: boolean) => void;
};

const ProfileSetup = ({
  submitCount,
  onSubmitComplete,
  onLoadingChange
}: PageProps) => {
  const { user } = useAuth();
  const { updatePublicInfo } = useUpdateUser();

  const [name, setName] = useState<string>(user?.display_name || "");
  const [about, setAbout] = useState<string>(user?.bio || "");
  const [userLink, setUserLink] = useState<string>(user?.website_link || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.display_name || "");
      setAbout(user.bio || "");
      setUserLink(user.website_link || "");
    }
  }, [user]);

  const uploadFile = async (file: File): Promise<string | undefined> => {
    if (!file) return undefined;

    const req: SignatureRequest = {
      file_size: file.size,
      content_type: file.type
    };

    try {
      const response = await getSignature(req);

      if (!response.success) {
        throw new Error(response.message || "Failed to get signature");
      }

      const signatureData = response.data as SignatureData;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("signature", signatureData.signature);
      formData.append("timestamp", signatureData.timestamp.toString());
      formData.append("folder", signatureData.folder);
      formData.append("public_id", signatureData.public_id);
      formData.append("api_key", signatureData.api_key);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/image/upload`,
        {
          method: "POST",
          body: formData
        }
      );

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload to Cloudinary");
      }

      const uploadResult = await uploadResponse.json();
      return uploadResult.secure_url;
    } catch (err) {
      console.error("File upload failed:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload file";
      toast.error(errorMessage);
      return undefined;
    }
  };

  const handleSubmit = async () => {
    onLoadingChange(true);

    try {
      if (!name) {
        toast.error("Display name can't be empty");
        return;
      }

      let avatarUrl: string | undefined;
      if (avatarFile) {
        avatarUrl = await uploadFile(avatarFile);
      }

      await updatePublicInfo({
        avatar: avatarUrl,
        display_name: name,
        bio: about,
        website_link: userLink,
        is_onboarded: true
      });

      onSubmitComplete();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      onLoadingChange(false);
    }
  };

  useEffect(() => {
    if (submitCount > 0) {
      handleSubmit();
    }
  }, [submitCount]);

  return (
    <form
      aria-label="onboarding profile setup page"
      className="w-full flex flex-col gap-6 [&_label]:font-bold"
    >
      <h3 className="text-2xl text-center">Setup your page</h3>

      <div className="w-full flex items-center justify-center">
        <AvatarUploader
          currentUrl={user?.avatar}
          size="large"
          onFileSelect={file => setAvatarFile(file)}
        />
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="name-input">Name</label>
        <Input
          id="name-input"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="about-input">About</label>
        <textarea
          id="about-input"
          autoComplete="off"
          value={about}
          onChange={e => setAbout(e.target.value)}
          className="w-full h-[10rem] p-3 text-sm bg-input border border-input rounded-lg"
        />
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="link-input">Website or social link</label>
        <Input
          id="link-input"
          type="url"
          value={userLink}
          onChange={e => setUserLink(e.target.value)}
        />
      </div>
    </form>
  );
};

export default ProfileSetup;
