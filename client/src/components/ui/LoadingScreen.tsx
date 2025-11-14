const LoadingScreen = () => {
  return (
    <div
      aria-label="Page Loading"
      className="fixed top-0 bottom-0 w-screen h-screen flex items-center justify-center bg-background p-0 m-0 outline-none z-50"
    >
      <div className="w-full flex flex-col items-center justify-center -mt-[15%] -ml-[4%]">
        <img
          src="/icons/happr-icon.jpg"
          width="90"
          height="90"
          className="object-cover rounded-full"
          alt="Happr's Logo"
        />
      </div>
    </div>
  );
};
export default LoadingScreen;
