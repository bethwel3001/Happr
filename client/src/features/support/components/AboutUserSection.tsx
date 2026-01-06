import { Link } from "lucide-react";
import type { PublicUserProfile } from "../types";

const AboutUserSection = ({ user }: { user: PublicUserProfile }) => {
  return (
    <section
      aria-label={`About ${user.display_name}`}
      className="w-[92%] flex flex-col gap-3 bg-background p-6 rounded-lg shadow-card shadow-md mt-2"
    >
      <h3 className="font-bold">About {user.display_name}</h3>

      <p>{user.bio || "No bio yet."}</p>

      {user.website_link && (
        <div className="w-full flex items-center gap-2 font-bold text-muted-foreground overflow-hidden">
          <Link size={18} className="mt-[.2rem] flex-shrink-0" />

          <a
            href={user.website_link}
            target="_blank"
            rel="noopener noreferrer"
            className="underline truncate"
          >
            {user.website_link}
          </a>
        </div>
      )}
    </section>
  );
};
export default AboutUserSection;

