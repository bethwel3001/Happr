import { PayoutSettings } from "@/features/payouts";

const Payout = () => {
  return (
    <section
      aria-label="Payout Settings"
      className="w-full flex flex-col gap-8"
    >
      <h2 className="text-2xl">Payout Settings</h2>

      <PayoutSettings />
    </section>
  );
};
export default Payout;
