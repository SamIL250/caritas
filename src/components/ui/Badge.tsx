import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "default";
}

export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  const baseStyle = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2";
  
  const variants = {
    success: "border-transparent bg-green-100 text-green-800",
    warning: "border-transparent bg-amber-100 text-amber-800",
    danger: "border-transparent bg-red-100 text-red-800",
    default: "border-transparent bg-gray-100 text-gray-800",
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
