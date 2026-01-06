import DisplaySupporter from "./DisplaySupporter";
import { useAuth } from "@/hooks/useAuth";
import { getRecentDonations } from "@/features/dashboard/api/getRecentDonations";
import { useEffect, useState } from "react";
import type { DonationDetails } from "@/types";

const RecentSupportersSection = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<DonationDetails[]>([]);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await getRecentDonations();
        if (response.success) {
          setDonations(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch recent donations", error);
      }
    };
    fetchDonations();
  }, []);

  return (
    <section
      aria-label="Recent Supporters"
      className="w-[92%] flex flex-col gap-3 bg-background p-6 rounded-lg shadow-card shadow-md"
    >
      <h3 className="font-bold text-lg mb-2"> Recent Supporters </h3>

      {donations.length > 0 ? (
        <div className="w-full flex flex-col items-center gap-2">
          {donations.map((supporter) => (
            // @ts-ignore - types are compatible
            <DisplaySupporter key={supporter.id} supporter={supporter} />
          ))}
        </div>
      ) : (
        <div className="w-full flex flex-col items-center gap-3 p-4 bg-accent text-primary text-center rounded-md">
          <p> Be the first to support ${user?.username} </p>
        </div>
      )}
    </section>
  );
};
export default RecentSupportersSection;
