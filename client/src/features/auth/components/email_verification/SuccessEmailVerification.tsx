import { CircleCheck } from "lucide-react";

const SuccessEmailVerification = ({ countdown }: { countdown: number }) => (
  <section
    aria-label="Email Verification Success"
    className="w-full min-h-[80vh] flex flex-col items-center justify-center gap-3 -mt-10"
  >
    <CircleCheck size={86} className="text-primary" />
    <h1 className="w-[80%] text-lg text-center">
      Your email has been successfully verified!
    </h1>
    <p className="text-center">
      Redirecting you in <strong>{countdown}s</strong>...
    </p>
  </section>
);

export default SuccessEmailVerification;
