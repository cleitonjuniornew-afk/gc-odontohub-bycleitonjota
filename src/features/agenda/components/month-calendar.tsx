"use client";

import { useMemo, useState } from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameMonth, isSameDay, isToday, addMonths, subMonths, format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { CalendarDays } from "lucide-react";
import { EventFormModal } from "./event-form-modal";
import { useEvents } from "../hooks/use-events";
import type { AgendaEvent } from "@/types";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function MonthCalendar() {
  const { events, isLoading, createEvent, isCreating, updateEvent, isUpdating, deleteEvent } = useEvents();
  const [cursor, setCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AgendaEvent | null>(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { locale: ptBR });
    const end = endOfWeek(endOfMonth(cursor), { locale: ptBR });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, AgendaEvent[]>();
    for (const e of events) {
      const key = format(new Date(e.start), "yyyy-MM-dd");
      map.set(key, [...(map.get(key) ?? []), e]);
    }
    return map;
  }, [events]);

  const selectedKey = format(selectedDay, "yyyy-MM-dd");
  const dayEvents = (eventsByDay.get(selectedKey) ?? []).sort((a, b) => a.start.localeCompare(b.start));

  async function handleSubmit(data: Omit<AgendaEvent, "id">) {
    if (editing) await updateEvent({ id: editing.id, input: data });
    else await createEvent(data);
    setEditing(null);
  }

  if (isLoading) return <Skeleton className="h-[560px] w-full" />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-base font-semibold capitalize text-text-primary">{format(cursor, "MMMM yyyy", { locale: ptBR })}</h3>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setCursor((c) => subMonths(c, 1))}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={() => { setCursor(new Date()); setSelectedDay(new Date()); }}>Hoje</Button>
            <Button variant="ghost" size="icon" onClick={() => setCursor((c) => addMonths(c, 1))}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAYS.map((w) => (
            <div key={w} className="px-2 py-2 text-center text-xs font-medium text-text-muted">{w}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayEv = eventsByDay.get(key) ?? [];
            const inMonth = isSameMonth(day, cursor);
            const selected = isSameDay(day, selectedDay);

            return (
              <button
                key={key}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "flex min-h-[86px] flex-col items-start gap-1 border-b border-r border-border/60 p-2 text-left transition-colors hover:bg-white/[0.03]",
                  !inMonth && "opacity-35",
                  selected && "bg-primary/[0.06]"
                )}
              >
                <span className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                  isToday(day) ? "bg-primary text-primary-foreground font-semibold" : "text-text-secondary"
                )}>
                  {format(day, "d")}
                </span>
                <div className="flex w-full flex-col gap-0.5">
                  {dayEv.slice(0, 2).map((e) => (
                    <span key={e.id} className="truncate rounded px-1.5 py-0.5 text-[10px] text-white" style={{ backgroundColor: `${e.color}CC` }}>
                      {e.title}
                    </span>
                  ))}
                  {dayEv.length > 2 && <span className="text-[10px] text-text-muted">+{dayEv.length - 2} mais</span>}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold capitalize text-text-primary">{format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })}</h4>
          <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="h-3.5 w-3.5" /> Evento
          </Button>
        </div>

        {dayEvents.length === 0 ? (
          <EmptyState icon={CalendarDays} title="Nada por aqui" description="Nenhum evento neste dia." actionLabel="Adicionar evento" onAction={() => { setEditing(null); setFormOpen(true); }} />
        ) : (
          <motion.div className="space-y-2.5">
            {dayEvents.map((e) => (
              <Card key={e.id} className="group flex items-center gap-3 py-3">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: e.color }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text-primary">{e.title}</p>
                  <p className="text-xs text-text-muted">{new Date(e.start).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <div className="hidden gap-1 group-hover:flex">
                  <button onClick={() => { setEditing(e); setFormOpen(true); }} className="rounded p-1 text-text-muted hover:text-text-primary"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => deleteEvent(e.id)} className="rounded p-1 text-text-muted hover:text-error"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </Card>
            ))}
          </motion.div>
        )}
      </div>

      <EventFormModal
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditing(null); }}
        onSubmit={handleSubmit}
        submitting={isCreating || isUpdating}
        initialData={editing}
        defaultDate={format(selectedDay, "yyyy-MM-dd")}
      />
    </div>
  );
}
