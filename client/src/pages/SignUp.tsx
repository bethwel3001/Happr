import { useSearchParams } from "react-router-dom";
import { SignupForm } from "@/features/auth";

const SignUp = () => {
  const [searchParams] = useSearchParams();
  const usernameParam = searchParams.get("username") || "";

  const confirmedUsername = sessionStorage.getItem("usernameConfirmed");

  const validUsername =
    confirmedUsername === usernameParam ? usernameParam : "";

  return (
    <section
      aria-label="signup page"
      className="w-full flex items-center justify-center"
    >
      <SignupForm initialUsername={validUsername} />
    </section>
  );
};

export default SignUp;
