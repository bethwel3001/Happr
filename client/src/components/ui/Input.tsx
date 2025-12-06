import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

const Input: React.FC<InputProps> = ({ className = "", type, ...props }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative w-full">
      <input
        type={isPassword ? (show ? "text" : "password") : type}
        className={`h-14 w-full flex items-center p-3 pr-10 text-sm bg-input
        text-input-foreground border border-input rounded-lg disabled:bg-muted
        disabled:text-muted-foreground ${className}`}
        {...props}
      />

      {isPassword && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
};

export default Input;
