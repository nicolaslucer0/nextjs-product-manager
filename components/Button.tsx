import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      fullWidth = false,
      ...props
    },
    ref,
  ) => {
    const baseClasses = "btn";
    const variantClasses = variant === "primary" ? "btn-primary" : "";
    const widthClasses = fullWidth ? "w-full" : "";

    const combinedClasses = [
      baseClasses,
      variantClasses,
      widthClasses,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <button ref={ref} className={combinedClasses} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

interface ButtonLinkProps {
  readonly href: string;
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly variant?: "primary" | "secondary";
  readonly fullWidth?: boolean;
}

export function ButtonLink({
  href,
  children,
  className = "",
  variant = "primary",
  fullWidth = false,
}: ButtonLinkProps) {
  const baseClasses = "btn";
  const variantClasses = variant === "primary" ? "btn-primary" : "";
  const widthClasses = fullWidth ? "w-full" : "";

  const combinedClasses = [baseClasses, variantClasses, widthClasses, className]
    .filter(Boolean)
    .join(" ");

  return (
    <Link href={href} className={combinedClasses}>
      {children}
    </Link>
  );
}

export default Button;
