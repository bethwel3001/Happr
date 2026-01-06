
import { useState, useMemo } from "react";
import { X, Loader2 } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { formatNaira } from "@/utils/formatters";
import type { PublicUserProfile } from "../types";
import initializeDonation from "../api/initializeDonation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const TipUserSection = ({ user }: { user: PublicUserProfile }) => {
  const { user: authUser } = useAuth();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [xHandle, setXHandle] = useState<string | null>("");
  const [message, setMessage] = useState<string>("");
  const [smilesCount, setSmilesCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);


  const pricePerSmile = user.smile_price || 200;
  const totalAmt = useMemo(
    () => pricePerSmile * smilesCount,
    [pricePerSmile, smilesCount]
  );

  const defaultSmiles: number[] = [1, 3, 5];

  const handleSupport = async () => {
    if (smilesCount < 1) {
      toast.error("Please enter a valid smile count");
      return;
    }

    const senderEmail = authUser?.email || email;

    if (!senderEmail) {
      toast.error("Email is required for receipt");
      return;
    }

    setIsLoading(true);

    try {
      const response = await initializeDonation({
        creator_username: user.username,
        smile_count: smilesCount,
        message,
        sender_name: name || authUser?.display_name || undefined,
        sender_email: senderEmail,
        sender_xhandle: xHandle || undefined,
        is_anonymous: false
      });

      if (response.success && response.data?.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        toast.error(response.message || "Failed to initialize payment");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      aria-label={`Send ${user.display_name} Smiles`}
      className="w-[92%] flex flex-col gap-3 bg-background p-6 rounded-lg shadow-card shadow-md"
    >
      <h3 className="font-bold text-lg mb-2"> Send {user.display_name} Smiles </h3>

      <div className="w-full flex flex-col gap-3 items-center">
        <div className="w-full h-16 flex items-center gap-2 bg-accent px-3 rounded-md">
          <div className="h-full flex items-center gap-2">
            <span className="text-xl"> 😊 </span>
            <X size={16} className="text-muted-foreground" />
          </div>

          {defaultSmiles.map(smile => (
            <div
              key={smile}
              onClick={() => setSmilesCount(smile)}
              className={`w-14 h-10 flex items-center justify-center bg-background font-bold text-muted-foreground text-lg border rounded-sm transition-all duration-300 cursor-pointer ${smile === smilesCount ? "border-primary" : "border-border"
                }`}
            >
              {smile}
            </div>
          ))}

          <input
            type="number"
            min="1"
            name="smile_count"
            value={smilesCount}
            onChange={e => setSmilesCount(Number(e.target.value))}
            className="w-14 h-10 flex items-center justify-center bg-background p-2 font-bold text-center text-input-foreground text-lg border-2 rounded-sm transition-all duration-300 focus:border-primary"
          />
        </div>

        <Input
          type="text"
          name="name"
          value={name}
          placeholder="Name (Optional)"
          onChange={e => setName(e.target.value)}
        />

        {!authUser && (
          <Input
            type="email"
            name="email"
            value={email}
            placeholder="Email (Required)"
            onChange={e => setEmail(e.target.value)}
          />
        )}

        <Input
          type="text"
          name="x_handle"
          value={xHandle ?? ""}
          placeholder="Your X (twitter) handle - optional"
          onChange={e => setXHandle(e.target.value || null)}
        />

        <textarea
          name="message"
          value={message}
          placeholder="Say something nice..."
          onChange={e => setMessage(e.target.value)}
          className="w-full h-[10rem] p-3 text-sm bg-input text-input-foreground
          border border-input rounded-lg resize-none"
        ></textarea>

        <Button
          className="w-full font-bold mt-3"
          onClick={handleSupport}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            `Support ${smilesCount < 1 ? "" : formatNaira(totalAmt)}`
          )}
        </Button>
      </div>
    </section>
  );
};

export default TipUserSection;
