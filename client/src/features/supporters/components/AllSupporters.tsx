import DisplaySupporters from "./DisplaySupporters";
import NoSupporters from "./NoSupporters";
import { getRecentDonations } from "@/features/dashboard/api/getRecentDonations";
import { useEffect, useState } from "react";
import type { DonationDetails } from "@/types";

const AllSupporters = () => {
  const [donations, setDonations] = useState<DonationDetails[]>([]);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await getRecentDonations();
        if (response.success) {
          setDonations(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch donations", error);
      }
    };
    fetchDonations();
  }, []);

  return (
    <section
      aria-labelledby="supporters section"
      className="relative w-full flex flex-col gap-4"
    >
      <h2 className="text-2xl">Your Supporters</h2>

      <div className="w-full block p-2 border border-border rounded-xl hide-scrollbar overflow-x-auto overflow-y-visible">
        {donations.length === 0 ? (
          <NoSupporters />
        ) : (
          <DisplaySupporters supporters={donations} />
        )}
      </div>
    </section>
  );
};

export default AllSupporters;
