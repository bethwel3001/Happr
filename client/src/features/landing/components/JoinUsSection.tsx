import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, MotionConfig } from "motion/react";
import { toast } from "sonner";
import { useUsernameAvailability } from "@/features/auth";
import CtaButton from "./CtaButton";

const JoinUsSection = () => {
  const [username, setUsername] = useState<string>("");
  const [isAvailable, setIsAvailable] = useState(false);
  const navigate = useNavigate();
  const { refetch, isFetching } = useUsernameAvailability(username);

  const handleCheck = async () => {
    const trimmed = username.trim();
    if (!trimmed || trimmed.length < 3) {
      toast.error("Username cannot be less than 3 characters");
      setIsAvailable(false);
      return;
    }

    const result = await refetch();

    if (result.isError) {
      toast.error("Failed to check username");
      setIsAvailable(false);
      return;
    }

    if (result.data) {
      if (result.data.success) {
        setIsAvailable(true);
        toast.success(result.data.message);
      } else {
        setIsAvailable(false);
        toast.error(result.data.message);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isAvailable) {
      handleCheck();
      return;
    }

    sessionStorage.setItem("usernameConfirmed", username.trim());
    navigate(`/signup?username=${username.trim()}`);
  };

  return (
    <section
      id="join-us"
      className="w-full flex flex-col items-center gap-4 py-8"
    >
      <MotionConfig>
        <motion.h2
          className="text-primary text-3xl font-semibold text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
          }}
          viewport={{ once: true }}
        >
          Join the Happr Community
        </motion.h2>

        <motion.div
          className="w-full flex flex-col items-center justify-center gap-6 bg-card p-4 rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, ease: "easeOut" }
          }}
          viewport={{ once: true }}
        >
          <motion.p
            className="text-center text-card-foreground"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: "easeOut" }
            }}
          >
            Musicians, artists, writers, gamers — anyone can receive Smiles from
            fans. Start your Happr page today and make your passion pay — one
            smile at a time.
          </motion.p>

          <motion.div
            className={`w-full flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-4 px-3 py-2 text-sm text-muted-foreground mt-4 rounded-lg md:rounded-full ${
              isAvailable ? "border border-green-500" : "border border-border"
            }`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.6, ease: "easeOut" }
            }}
            viewport={{ once: true }}
          >
            <form
              onSubmit={handleSubmit}
              id="join-us-form"
              className="flex items-center w-full sm:w-auto flex-grow overflow-hidden"
            >
              <p className="whitespace-nowrap text-xs sm:text-sm text-muted-foreground">
                https://happr.me/
              </p>
              <input
                type="text"
                value={username}
                onChange={e => {
                  setUsername(e.target.value);
                  setIsAvailable(false);
                }}
                placeholder="username"
                disabled={isFetching}
                className="flex-grow bg-input rounded-full px-2 py-1 focus:outline-none text-xs sm:text-sm disabled:bg-muted"
              />
            </form>

            <motion.div
              className="w-full sm:w-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              <CtaButton
                type="submit"
                form="join-us-form"
                disabled={!username || username.length < 3 || isFetching}
                className="text-sm py-2 px-4 w-full whitespace-nowrap rounded-lg sm:w-auto md:rounded-full"
              >
                {isAvailable
                  ? "Claim Page"
                  : isFetching
                  ? "Checking..."
                  : "Check Availability"}
              </CtaButton>
            </motion.div>
          </motion.div>
        </motion.div>
      </MotionConfig>
    </section>
  );
};

export default JoinUsSection;
