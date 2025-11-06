import DisplaySupporter from "./DisplaySupporter";
import ErrorBox from "@/components/ui/ErrorBox";
import { useQuery } from "@tanstack/react-query";
import { getSupporters } from "@/features/supporters";
import type { Supporter } from "@/features/supporters";

const RecentSupportersSection = () => {
  const creatorId = "creator_001";

  const {
    data: supporters = [],
    isLoading,
    isError,
    error
  } = useQuery<Supporter[]>({
    queryFn: () => getSupporters(creatorId, 5),
    queryKey: ["recent", "supporters", creatorId, "creator page"],
    enabled: !!creatorId
  });

  return (
    <section
      aria-label="Recent Supporters"
      className="w-[92%] flex flex-col gap-3 bg-background p-6 rounded-lg shadow-card shadow-md"
    >
      <h3 className="font-bold text-lg mb-2"> Recent Supporters </h3>

      {isLoading ? (
        <div className="w-full flex flex-col gap-5 items-center text-center bg-card p-4 rounded-md">
          <div className="w-10 h-10 p-4 border-4 border border-b-transparent rounded-full mb-2 animate-spin"></div>
          Getting recent supporters...
        </div>
      ) : isError ? (
        <ErrorBox
          title="Error loading recent supporters"
          message={`${
            error instanceof Error
              ? error.message
              : "Soemthing went wrong. Please try again"
          }`}
        />
      ) : supporters.length > 0 ? (
        <div className="w-full flex flex-col items-center gap-2">
          {supporters.map(supporter => (
            <DisplaySupporter key={supporter.id} supporter={supporter} />
          ))}
        </div>
      ) : (
        <div className="w-full flex flex-col items-center gap-3 p-4 bg-accent text-primary text-center rounded-md">
          <p> Be the first to support Charmingdc </p>
        </div>
      )}
    </section>
  );
};
export default RecentSupportersSection;
