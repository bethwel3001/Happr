import DisplaySupporter from "./DisplaySupporter";
import { usePublicDonations } from "../hooks/usePublicDonations";
import type { PublicUserProfile } from "../types";

const RecentSupportersSection = ({ user }: { user: PublicUserProfile }) => {
  const { data: response } = usePublicDonations(user.username);
  const donations = response?.data || [];


  return (
    <section
      aria-label="Recent Supporters"
      className="w-[92%] flex flex-col gap-3 bg-background p-6 rounded-lg shadow-card shadow-md"
    >
      <h3 className="font-bold text-lg mb-2"> Recent Supporters </h3>

      {donations.length > 0 ? (
        <div className="w-full flex flex-col items-center gap-2">
          {donations.map((supporter) => (
            <DisplaySupporter key={supporter.id} supporter={supporter} />
          ))}
        </div>
      ) : (
        <div className="w-full flex flex-col items-center gap-3 p-4 bg-accent text-primary text-center rounded-md">
          <p> Be the first to support {user.display_name} </p>
        </div>
      )}
    </section>
  );
};
export default RecentSupportersSection;

