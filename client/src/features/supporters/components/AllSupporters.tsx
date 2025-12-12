import DisplaySupporters from "./DisplaySupporters";
import NoSupporters from "./NoSupporters";
import { useAuth } from "@/hooks/useAuth";

const AllSupporters = () => {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <section
      aria-labelledby="supporters section"
      className="relative w-full flex flex-col gap-4"
    >
      <h2 className="text-2xl">Your Supporters</h2>

      <div className="w-full block p-2 border border-border rounded-xl hide-scrollbar overflow-x-auto overflow-y-visible">
        {user?.recent_donations && user?.recent_donations.length === 0 ? (
          <NoSupporters />
        ) : (
          <DisplaySupporters supporters={user.recent_donations} />
        )}
      </div>
    </section>
  );
};

export default AllSupporters;
