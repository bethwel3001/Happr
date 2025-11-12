type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const CtaButton = ({ className = "", children, ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className={`bg-primary text-primary-foreground px-6 py-3 border
      border-primary rounded-full
      transition-all duration-300 hover:bg-transparent disabled:bg-muted
      disabled:text-muted-foreground disabled:border-border hover:text-primary ${className}`}
    >
      {children}
    </button>
  );
};

export default CtaButton;
