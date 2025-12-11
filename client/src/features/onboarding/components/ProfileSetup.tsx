import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateUser } from "@/features/settings";
import { AvatarUploader } from "@/features/settings";
import Input from "@/components/ui/Input";

type PageProps = {
  submitCount: number;
  onSubmitComplete: () => void;
  onLoadingChange: (loading: boolean) => void;
};

const ProfileSetup = ({
  submitCount,
  onSubmitComplete,
  onLoadingChange,
}: PageProps) => {
  const { user } = useAuth();
  const { updatePublicInfo } = useUpdateUser();

  const [name, setName] = useState<string>(user?.display_name || "");
  const [about, setAbout] = useState<string>(user?.bio || "");
  const [userLink, setUserLink] = useState<string>(user?.website_link || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    onLoadingChange(true);

    try {
      if (!name) {
        toast.error("Display name can't be empty");
        return;
      }

      console.log("SUBMITTING:", { name, about, userLink, avatarFile });

      await updatePublicInfo({
        avatar: avatarFile,
        display_name: name,
        bio: about,
        website_link: userLink,
      });

      // Only on success
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
          onFileSelect={(file) => setAvatarFile(file)}
        />
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="name-input">Name</label>
        <Input
          id="name-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="about-input">About</label>
        <textarea
          id="about-input"
          autoComplete="off"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          className="w-full h-[10rem] p-3 text-sm bg-input border border-input rounded-lg"
        />
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="link-input">Website or social link</label>
        <Input
          id="link-input"
          type="url"
          value={userLink}
          onChange={(e) => setUserLink(e.target.value)}
        />
      </div>
    </form>
  );
};

export default ProfileSetup;
