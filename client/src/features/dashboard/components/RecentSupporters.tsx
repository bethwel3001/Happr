import { Link } from "react-router-dom";
import { ChartColumn } from "lucide-react";
import {
  DisplaySupporters,
  NoSupporters,
} from "@/features/supporters/components";
import { getRecentDonations } from "../api/getRecentDonations";
import { useEffect, useState } from "react";
import type { DonationDetails } from "@/types";

const RecentSupporters = () => {
  const [donations, setDonations] = useState<DonationDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await getRecentDonations();
        if (response.success) {
          setDonations(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch recent donations", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  if (loading) {
    return <div className="p-4 border border-border rounded-xl animate-pulse h-40 w-full bg-accent/20"></div>;
  }

  return (
    <section className="relative w-full flex flex-col gap-4 p-4 border border-border rounded-xl">
      <div className="w-full flex items-center justify-between gap-3 mb-4">
        <h2 className="text-2xl">Recent Supporters</h2>
        <Link
          to="/supporters"
          className="flex items-center gap-2 bg-card text-card-foreground capitalize py-2 px-3 whitespace-nowrap rounded-sm"
        >
          <ChartColumn /> View All
        </Link>
      </div>

      <div
        aria-label="recent-supporters"
        className="w-full block hide-scrollbar overflow-x-auto overflow-y-visible"
      >
        {donations.length === 0 ? (
          <NoSupporters />
        ) : (
          <DisplaySupporters supporters={donations} />
        )}
      </div>
    </section>
  );
};

export default RecentSupporters;
