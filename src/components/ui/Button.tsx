import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
}

export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-[transform,background-color,border-color,color] duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none h-9 px-4 py-2 active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none";
  
  const variants = {
    primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]",
    secondary: "border border-[var(--color-border-default)] bg-white hover:bg-stone-50 text-[var(--color-text-primary)]",
    ghost: "bg-transparent hover:bg-stone-100 text-[var(--color-text-primary)]",
    destructive: "border border-red-200 text-red-600 hover:bg-red-50",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
