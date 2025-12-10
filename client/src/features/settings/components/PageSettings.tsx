import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import CoverUploader from "./CoverUploader";
import AvatarUploader from "./AvatarUploader";
import { useAuth } from "@/hooks/useAuth";
import { updateUser, getPresignedUrl } from "../api/updateUser";
import type { PresignedUrlRequest } from "../api/updateUser";
import { toast } from "sonner";

const PageSettings = () => {
  const { user, setUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [about, setAbout] = useState(user?.bio || "");
  const [userLink, setUserLink] = useState(user?.website_link || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const uploadFile = async (file: File): Promise<string | undefined> => {
    if (!file) return undefined;

    const req: PresignedUrlRequest = {
      file_size: file.size,
      content_type: file.type,
    };

    try {
      const { data, success } = await getPresignedUrl(req);
      if (!success) throw new Error("Failed to get presigned URL");

      await fetch(data.presigned_url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      return data.objectKey ?? undefined;
    } catch (err) {
      console.error("File upload failed:", err);
      toast.error("Failed to upload file");
      return undefined;
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      let avatarKey: string | undefined;
      let coverKey: string | undefined;

      if (avatarFile) {
        const result = await uploadFile(avatarFile);
        avatarKey = result ?? undefined;
      }

      if (coverFile) {
        const result = await uploadFile(coverFile);
        coverKey = result ?? undefined;
      }

      const updated = await updateUser({
        id: user.id,
        display_name: displayName,
        bio: about,
        website_link: userLink,
        ...(avatarKey && { avatar: avatarKey }),
        ...(coverKey && { cover_photo: coverKey }),
      });

      if (updated.success) {
        setUser({ ...user, ...updated.data });
        toast.success("Profile updated successfully");
      } else {
        toast.error(updated.message || "Failed to update user");
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error("Something went wrong while updating your profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div aria-labelledby="Page Settings" className="w-full">
      <h2 className="text-2xl">Page Settings</h2>
      <form
        aria-label="account settings form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="w-full flex flex-col gap-10 p-4 border rounded-md mt-4"
      >
        <div className="w-full flex flex-col gap-4">
          <h3 className="text-xl">Avatar</h3>
          <AvatarUploader
            currentUrl={`https://ui-avatars.com/api/?name=${user?.username}&background=random&bold=true&size=128.png`}
            size="large"
            onFileSelect={setAvatarFile}
          />
        </div>

        <div className="w-full flex flex-col gap-4">
          <h3 className="text-xl">Cover Photo</h3>
          <CoverUploader
            currentUrl={`https://ui-avatars.com/api/?name=${user?.username}&background=random&bold=true&size=128.png`}
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
            placeholder="Enter your display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        <div className="w-full flex flex-col gap-4">
          <label htmlFor="about-input">
            <h3 className="text-xl">About</h3>
          </label>
          <textarea
            id="about-input"
            placeholder="Tell us something about yourself"
            autoComplete="off"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
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
            placeholder="Enter your website or social link"
            value={userLink}
            onChange={(e) => setUserLink(e.target.value)}
          />
        </div>

        <Button disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
};

export default PageSettings;
