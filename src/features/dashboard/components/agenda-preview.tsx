"use client";

import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { fadeInUp } from "@/animations/variants";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvents } from "@/features/agenda/hooks/use-events";

export function AgendaPreview() {
  const { events, isLoading } = useEvents();
  const sorted = [...events]
    .filter((e) => new Date(e.start).getTime() >= Date.now() - 86_400_000)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 4);

  return (
    <motion.div variants={fadeInUp}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-4.5 w-4.5 text-primary" /> Agenda rápida
          </CardTitle>
          <Link href="/agenda" className="text-xs font-medium text-secondary hover:underline">Ver tudo</Link>
        </CardHeader>
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
        ) : (
          <ul className="space-y-3">
            {sorted.map((e) => {
              const date = new Date(e.start);
              return (
                <li key={e.id} className="flex items-center gap-3">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: e.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-text-primary">{e.title}</p>
                    <p className="text-xs text-text-muted">
                      {date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} · {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </motion.div>
  );
}
