const LoadingEmailVerification = () => (
  <section
    aria-label="Email Verification Loading"
    className="w-full min-h-[80vh] flex flex-col items-center justify-center gap-4 -mt-10"
  >
    <div className="w-20 h-20 flex items-center justify-center border-4 border-border border-t-primary rounded-full animate-spin mb-4"></div>
    <h1 className="text-lg text-center">Verifying your email...</h1>
  </section>
);

export default LoadingEmailVerification;
