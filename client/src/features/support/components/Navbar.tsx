import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [userState] = useState<"authenticated" | "unauthenticated" | "owner">(
    "owner"
  );
  const [currentUserName] = useState<string>("Muis");

  const renderLink = () => {
    switch (userState) {
      case "owner":
        return <Link to="/dashbord"> Dashboard </Link>;
      case "authenticated":
        return <Link to={`/${currentUserName}`}>My Page</Link>;
      case "unauthenticated":
        return <Link to="/signup"> Signup </Link>;
      default:
        return null;
    }
  };

  return (
    <nav
      aria-label="support page navbar"
      className="fixed top-0 left-1/2 -translate-x-1/2 w-full flex items-center justify-between bg-background p-4 border-b border-border z-50"
    >
      <div className="flex items-center juatify-center gap-2">
        <img
          src="/icons/happr-icon.jpg"
          width="36"
          height="36"
          className="object-cover rounded-full"
          alt="Happr's Logo"
        />

        <h1 className="font-extrabold text-xl text-primary"> Happr </h1>
      </div>

      {renderLink()}
    </nav>
  );
};

export default Navbar;
