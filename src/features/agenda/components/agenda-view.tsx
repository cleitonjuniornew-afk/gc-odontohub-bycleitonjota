"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, fadeInUp } from "@/animations/variants";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { CalendarDays } from "lucide-react";
import { events } from "@/lib/mock-data";
import type { AgendaEvent } from "@/types";

const typeLabel: Record<AgendaEvent["type"], string> = {
  prova: "Prova",
  clinica: "Clínica",
  aula: "Aula",
  evento: "Evento",
};

function groupByRelative() {
  const now = new Date("2026-08-04T12:00:00");

  const sorted = [...events].sort(
    (a, b) =>
      new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  const today = sorted.filter(
    (event) =>
      new Date(event.start).toDateString() === now.toDateString()
  );

  const tomorrow = sorted.filter((event) => {
    const date = new Date(event.start);
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);

    return date.toDateString() === tomorrowDate.toDateString();
  });

  const week = sorted.filter((event) => {
    const date = new Date(event.start);
    const diff =
      (date.getTime() - now.getTime()) / 86_400_000;

    return diff > 1 && diff <= 7;
  });

  return { today, tomorrow, week };
}

function EventCard({ event }: { event: AgendaEvent }) {
  const date = new Date(event.start);

  return (
    <motion.div variants={fadeInUp}>
      <Card className="flex items-center gap-4 p-4">
        <div
          className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-[12px] text-xs font-bold"
          style={{
            backgroundColor: `${event.color}1A`,
            color: event.color,
          }}
        >
          {date.getDate()}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-medium">{event.title}</p>

          <p className="text-sm text-text-muted">
            {date.toLocaleDateString("pt-BR", {
              weekday: "long",
            })}{" "}
            ·{" "}
            {date.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <Badge
          style={{
            borderColor: `${event.color}4D`,
            color: event.color,
            backgroundColor: `${event.color}1A`,
          }}
        >
          {typeLabel[event.type]}
        </Badge>
      </Card>
    </motion.div>
  );
}

export function AgendaView() {
  const { today, tomorrow, week } = groupByRelative();

  const [tab, setTab] = useState<"hoje" | "amanha" | "semana">(
    "hoje"
  );

  const groups = {
    hoje: today,
    amanha: tomorrow,
    semana: week,
  };

  const active = groups[tab];

  return (
    <div className="space-y-4">
      <Tabs
        value={tab}
        onValueChange={(value) =>
          setTab(value as "hoje" | "amanha" | "semana")
        }
      >
        <TabsList>
          <TabsTrigger value="hoje">Hoje</TabsTrigger>
          <TabsTrigger value="amanha">Amanhã</TabsTrigger>
          <TabsTrigger value="semana">Essa semana</TabsTrigger>
        </TabsList>
      </Tabs>

      {active.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nada por aqui ainda"
          description="Cadastre provas, clínicas e aulas para nunca perder um compromisso."
          actionLabel="Adicionar evento"
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {active.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
