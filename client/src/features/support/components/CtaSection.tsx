import { Link } from "react-router-dom";

const CtaSection = () => {
  return (
    <section
      aria-label="Recent Supporters"
      className="w-[92%] flex flex-col items-center text-center gap-2 bg-background p-6 rounded-lg shadow-card shadow-md"
    >
      <div className="h-auto flex items-center justify-evenly gap-2">
        <img
          src="/icons/happr-icon.jpg"
          width="30"
          height="30"
          className="rounded-full"
          alt="Happr Logo"
        />
        <h1 className="font-fredoka font-extrabold text-2xl"> Happr </h1>
      </div>

      <p> Turn your creativity into smiles </p>

      <Link to="/signup" className="text-primary underline">
        Create your Happr page
      </Link>
    </section>
  );
};
export default CtaSection;
