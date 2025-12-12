import { Link } from "react-router-dom";
import { ChartColumn } from "lucide-react";
import {
  DisplaySupporters,
  NoSupporters,
} from "@/features/supporters/components";
import { useAuth } from "@/hooks/useAuth";

const RecentSupporters = () => {
  const { user } = useAuth();
  if (!user) return null;
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
        {user?.recent_donations && user.recent_donations.length === 0 ? (
          <NoSupporters />
        ) : (
          <DisplaySupporters supporters={user.recent_donations} />
        )}
      </div>
    </section>
  );
};

export default RecentSupporters;
