import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-[var(--color-card-bg)] rounded-lg border border-[var(--color-border-default)] border-dashed ${className}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-page-bg)] text-[var(--color-text-muted)] mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] mt-1 mb-4 max-w-sm">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
