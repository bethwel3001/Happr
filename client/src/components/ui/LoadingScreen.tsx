const LoadingScreen = () => {
  return (
    <div
      aria-label="Page Loading"
      className="w-full h-full fixed top-0 bottom-0 w-screen h-screen flex items-center justify-center bg-background p-0 m-0 outline-none z-50"
    >
      <div className="w-full h-full flex flex-col items-center justify-center -mt-[15%] -ml-[4%]">
        <img
          src="/icons/happr-icon.jpg"
          width="80"
          height="80"
          className="object-cover rounded-full"
          alt="Happr's Logo"
        />
      </div>
    </div>
  );
};
export default LoadingScreen;
