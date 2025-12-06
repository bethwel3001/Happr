import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import {
  StepAnimator,
  Welcome,
  ProfileSetup,
  AllDone
} from "@/features/onboarding";

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitCount, setSubmitCount] = useState(0); // <- changed
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 3;

  return (
    <section
      aria-label="onboarding section"
      className="w-full flex flex-col gap-8 mb-6"
    >
      <StepAnimator currentStep={currentStep} totalSteps={totalSteps} />

      {currentStep === 1 && <Welcome />}

      {currentStep === 2 && (
        <ProfileSetup
          submitCount={submitCount} // <- use counter
          onSubmitComplete={() => {
            setCurrentStep(prev => prev + 1);
          }}
          onLoadingChange={setIsLoading}
        />
      )}

      {currentStep === 3 && <AllDone />}

      <Button
        disabled={isLoading}
        onClick={() => {
          if (currentStep === 2) {
            setSubmitCount(prev => prev + 1);
          } else if (currentStep === totalSteps) {
            navigate("/dashboard");
          } else {
            setCurrentStep(prev => prev + 1);
          }
        }}
      >
        {isLoading
          ? "Updating info..."
          : currentStep === totalSteps
          ? "Goto Dashboard"
          : "Next Step"}
      </Button>
    </section>
  );
};

export default Onboarding;
