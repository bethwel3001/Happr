import DisplaySupporter from "./DisplaySupporter";
import { useAuth } from "@/hooks/useAuth";

const RecentSupportersSection = () => {
  const { user } = useAuth();
  return (
    <section
      aria-label="Recent Supporters"
      className="w-[92%] flex flex-col gap-3 bg-background p-6 rounded-lg shadow-card shadow-md"
    >
      <h3 className="font-bold text-lg mb-2"> Recent Supporters </h3>

      {user?.recent_donations && user.recent_donations.length > 0 ? (
        <div className="w-full flex flex-col items-center gap-2">
          {user?.recent_donations.map((supporter) => (
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
