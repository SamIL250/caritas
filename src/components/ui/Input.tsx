import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`flex h-9 w-full rounded-md border border-[var(--color-border-default)] bg-transparent px-3 py-1 text-sm transition-[border-color,box-shadow] duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--color-text-muted)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}
