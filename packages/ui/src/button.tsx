"use client";

import { ReactNode } from "react";

interface ButtonProps {
  variant: "primary" | "outline" | "secondary";
  children: ReactNode;
  className?: string;
  size: "lg" | "sm";
  onClick?: () => void
}

export const Button = ({size, variant, children, className, onClick }: ButtonProps) => {
  return (
    <button
      className={`${className}
      ${variant === "primary" ? "bg-primary": variant === "secondary" ? "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80" : "border border-input bg-backround shadow-sm hover:bg-accent hover:text-accent-foreground"}
      ${size === "lg" ? "px-4 py-2" : "px-2 py-1"}
      `}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
