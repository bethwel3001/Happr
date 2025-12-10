import { MailRed } from "@/features/auth";

const InvalidEmailVerification = ({
  countdown,
  errorMsg,
}: {
  countdown: number;
  errorMsg: string;
}) => (
  <section
    aria-label="Invalid Email Verification"
    className="w-full min-h-[80vh] flex flex-col items-center justify-center gap-4 -mt-8"
  >
    <img src={MailRed} alt="Invalid Verification Link Illustration" />
    <h1 id="invalid-verification-heading" className="text-lg text-center">
      {errorMsg}
    </h1>
    <p>
      Redirecting to signup in <strong>{countdown}s</strong>
    </p>
  </section>
);

export default InvalidEmailVerification;
