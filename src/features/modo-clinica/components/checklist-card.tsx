"use client";
import { CheckSquare } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import type { ChecklistItem } from "@/types";

interface Props {
  checklist: ChecklistItem[];
  onToggle: (id: string) => void;
}

export function ChecklistCard({ checklist, onToggle }: Props) {
  const done = checklist.filter((c) => c.done).length;
  const pct = Math.round((done / checklist.length) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><CheckSquare className="h-4.5 w-4.5 text-primary" /> Checklist Inteligente</CardTitle>
        <span className="text-xs text-text-muted">{done}/{checklist.length}</span>
      </CardHeader>
      <Progress value={pct} className="mb-4" />
      <ul className="space-y-2.5">
        {checklist.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <Checkbox checked={item.done} onCheckedChange={() => onToggle(item.id)} />
            <span className={`text-sm ${item.done ? "text-text-muted line-through" : "text-text-primary"}`}>{item.label}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
