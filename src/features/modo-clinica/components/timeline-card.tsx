"use client";
import { History } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimelineEntry } from "@/types";

export function TimelineCard({ timeline }: { timeline: TimelineEntry[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><History className="h-4.5 w-4.5 text-primary" /> Timeline</CardTitle></CardHeader>
      <ol className="space-y-3 border-l border-border pl-4">
        {timeline.map((t) => (
          <li key={t.id} className="relative text-sm">
            <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary" />
            <span className="text-text-muted">{t.time}</span>{" "}
            <span className="text-text-secondary">— {t.description}</span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
