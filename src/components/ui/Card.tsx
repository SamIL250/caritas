import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-stone-200/80 bg-white text-[var(--color-text-primary)] p-6 transition-[border-color,box-shadow] duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
