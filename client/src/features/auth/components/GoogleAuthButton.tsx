import GoogleIcon from "../assets/google-icon.png";
import { getGoogleAuthUri } from "../api/google-auth";

const GoogleAuthButton = () => {
  const handleGoogleAuth = async (): Promise<void> => {
    try {
      const uri = await getGoogleAuthUri();
      console.log(uri);
      window.location.href = uri;
    } catch (error) {
      console.error("Failed to initiate Google authentication", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleAuth}
      className="cursor-pointer w-full h-14 flex items-center justify-center gap-3 border border-border rounded-lg"
    >
      <img src={GoogleIcon} width={22} height={22} alt="Google Icon" />
      <p>Continue with Google</p>
    </button>
  );
};

export default GoogleAuthButton;
