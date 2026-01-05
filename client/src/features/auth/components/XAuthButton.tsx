import { useState } from "react";
import { toast } from "sonner";
import { axios } from "@/lib";

const XAuthButton = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleXAuth = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const response = await axios.get<{ data: { uri: string } }>(
                "/api/v1/auth/x-auth",
            );
            window.location.href = response.data.uri;
        } catch (error) {
            console.error("Failed to initiate X authentication", error);
            toast.error("Failed to initiate X authentication");
            setIsLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleXAuth}
            disabled={isLoading}
            className="cursor-pointer w-full h-14 flex items-center justify-center gap-3 border border-border rounded-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <p>{isLoading ? "Redirecting..." : "Continue with X"}</p>
        </button>
    );
};

export default XAuthButton;
