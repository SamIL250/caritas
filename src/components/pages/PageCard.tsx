import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface PageCardProps {
  id: string;
  title: string;
  slug: string;
  status: "published" | "draft";
  lastUpdated: string;
}

export function PageCard({ id, title, slug, status, lastUpdated }: PageCardProps) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h3>
          <p className="text-sm text-[var(--color-text-muted)]">{slug === 'home' ? '/' : `/${slug}`}</p>
        </div>
        <Badge variant={status === "published" ? "success" : "warning"}>
          {status === "published" ? "Published" : "Draft"}
        </Badge>
      </div>
      <div className="mt-auto pt-4 flex items-center justify-between border-t border-[var(--color-border-default)]">
        <span className="text-xs text-[var(--color-text-muted)]">Updated {lastUpdated}</span>
        <Link href={`/dashboard/pages/${id}`}>
          <Button variant="secondary" className="h-8 text-xs px-3">
            Edit
          </Button>
        </Link>
      </div>
    </Card>
  );
}
