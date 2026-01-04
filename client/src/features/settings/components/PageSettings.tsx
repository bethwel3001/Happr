import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import CoverUploader from "./CoverUploader";
import AvatarUploader from "./AvatarUploader";
import { useAuth } from "@/hooks/useAuth";
import { updateUser, getSignature } from "../api/updateUser";
import type { SignatureRequest, SignatureData } from "../api/updateUser";
import { toast } from "sonner";

const PageSettings = () => {
  const { user, setUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [about, setAbout] = useState(user?.bio || "");
  const [userLink, setUserLink] = useState(user?.website_link || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${user?.username}&bold=true&size=128.png`;
  const fallbackCover = "/icons/happr-banner.jpg";

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

  const handleSave = async () => {
    if (!user) {
      toast.error("No user found");
      return;
    }

    setIsSaving(true);

    try {
      let avatarUrl: string | undefined;
      let coverUrl: string | undefined;

      if (avatarFile) {
        avatarUrl = await uploadFile(avatarFile);
      }

      if (coverFile) {
        coverUrl = await uploadFile(coverFile);
      }

      const response = await updateUser({
        id: user.id,
        display_name: displayName,
        bio: about,
        website_link: userLink,
        ...(avatarUrl && { avatar: avatarUrl }),
        ...(coverUrl && { cover_photo: coverUrl })
      });

      if (response.success && response.data) {
        setUser(response.data);
        toast.success("Profile updated successfully");
        setAvatarFile(null);
        setCoverFile(null);
      } else {
        toast.error(response.message || "Failed to update user");
      }
    } catch (err) {
      console.error(err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong while updating your profile";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div aria-labelledby="Page Settings" className="w-full">
      <h2 className="text-2xl">Page Settings</h2>

      <form
        onSubmit={e => {
          e.preventDefault();
          handleSave();
        }}
        className="w-full flex flex-col gap-10 p-4 border rounded-md mt-4"
      >
        <div className="w-full flex flex-col gap-4">
          <h3 className="text-xl">Avatar</h3>
          <AvatarUploader
            currentUrl={user?.avatar ? `${user.avatar}` : fallbackAvatar}
            size="large"
            onFileSelect={setAvatarFile}
          />
        </div>

        <div className="w-full flex flex-col gap-4">
          <h3 className="text-xl">Cover Photo</h3>
          <CoverUploader
            currentUrl={
              user?.cover_photo ? `${user.cover_photo}` : fallbackCover
            }
            onFileSelect={setCoverFile}
          />
        </div>

        <div className="w-full flex flex-col gap-4">
          <label htmlFor="display-name-input">
            <h3 className="text-xl">Display Name</h3>
          </label>
          <Input
            type="text"
            id="display-name-input"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
          />
        </div>

        <div className="w-full flex flex-col gap-4">
          <label htmlFor="about-input">
            <h3 className="text-xl">About</h3>
          </label>
          <textarea
            id="about-input"
            value={about}
            onChange={e => setAbout(e.target.value)}
            className="w-full h-[10rem] p-3 text-sm bg-input text-input-foreground border border-input rounded-lg"
          />
        </div>

        <div className="w-full flex flex-col gap-4">
          <label htmlFor="user-link-input">
            <h3 className="text-xl">Website or Social Link</h3>
          </label>
          <Input
            type="url"
            id="user-link-input"
            value={userLink}
            onChange={e => setUserLink(e.target.value)}
          />
        </div>

        <Button disabled={isSaving} type="submit">
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
};

export default PageSettings;
