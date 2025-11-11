import { Link } from "lucide-react";

const AboutUserSection = () => {
  return (
    <section
      aria-label="About Charmingdc"
      className="w-[92%] flex flex-col gap-3 bg-background p-6 rounded-lg shadow-card shadow-md mt-2"
    >
      <h3 className="font-bold">About Charmingdc</h3>

      <p>HIM. Cracked swe. (allegedly) / Solving problems through code.</p>

      <div className="w-full flex items-center gap-2 font-bold text-muted-foreground">
        <Link size={18} className="mt-[.2rem]" />

        <span className="underline">https://x.com/Charmingdc01</span>
      </div>
    </section>
  );
};
export default AboutUserSection;
