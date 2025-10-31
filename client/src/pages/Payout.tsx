import { useState, lazy, Suspense } from "react";
import { ChartBar, ChevronLeft } from "lucide-react";
import { PayoutSettings } from "@/features/payouts";
const PayoutLogs = lazy(() =>
  import("@/features/payouts").then(module => ({ default: module.PayoutLogs }))
);

const Payout = () => {
  const [showLogs, setShowLogs] = useState<boolean>(false);

  return (
    <section
      aria-label="Payout Settings"
      className="w-full flex flex-col gap-8"
    >
      <div className="w-full flex items-center justify-between gap-3">
        <h2 className="text-2xl">Payout Settings</h2>

        <button
          onClick={() => setShowLogs(prev => !prev)}
          className="flex items-center gap-1 bg-card text-card-foreground py-2 px-3 whitespace-nowrap rounded-sm"
        >
          {showLogs ? (
            <>
              <ChevronLeft /> Back
            </>
          ) : (
            <>
              <ChartBar /> Payout Logs
            </>
          )}
        </button>
      </div>

      {showLogs ? (
        <Suspense fallback={<h1> Loading </h1>}>
          <PayoutLogs />
        </Suspense>
      ) : (
        <PayoutSettings />
      )}
    </section>
  );
};
export default Payout;
