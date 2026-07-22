"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Props = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
};

export function DashboardPaginationBar({
  page,
  totalPages,
  totalItems,
  pageSize,
  itemLabel = "items",
  onPageChange,
}: Props) {
  if (totalItems <= pageSize) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-stone-500">
        Showing {start}–{end} of {totalItems} {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          className="h-9 gap-1 px-3"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} aria-hidden />
          Previous
        </Button>
        <span className="min-w-[7rem] text-center text-sm font-medium text-stone-600">
          Page {page} of {totalPages}
        </span>
        <Button
          type="button"
          variant="secondary"
          className="h-9 gap-1 px-3"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight size={16} aria-hidden />
        </Button>
      </div>
    </div>
  );
}

export const DASHBOARD_LIST_PAGE_SIZE = 10;
