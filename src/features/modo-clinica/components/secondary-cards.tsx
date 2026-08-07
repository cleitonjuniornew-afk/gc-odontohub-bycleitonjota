"use client";
import { AlertTriangle, MessageSquare, ListTodo, CalendarClock } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { Appointment } from "@/types";

interface Props {
  appointment: Appointment;
  onChange: <K extends keyof Appointment>(field: K, value: Appointment[K]) => void;
}

export function ComplicationsCard({ appointment, onChange }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4.5 w-4.5 text-warning" /> Complicações</CardTitle></CardHeader>
      <Textarea
        value={appointment.complications ?? ""}
        onChange={(e) => onChange("complications", e.target.value)}
        placeholder="Campo opcional — registre intercorrências, se houver."
        className="min-h-20"
      />
    </Card>
  );
}

export function ProfessorObservationsCard({ appointment, onChange }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="h-4.5 w-4.5 text-secondary" /> Observações do Professor</CardTitle></CardHeader>
      <Textarea
        value={appointment.professorObservations ?? ""}
        onChange={(e) => onChange("professorObservations", e.target.value)}
        placeholder="Feedback e orientações do professor avaliador."
        className="min-h-20"
      />
    </Card>
  );
}

export function PendenciesCard({ appointment, onChange }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><ListTodo className="h-4.5 w-4.5 text-primary" /> Pendências</CardTitle></CardHeader>
      <Textarea
        value={appointment.pendencies ?? ""}
        onChange={(e) => onChange("pendencies", e.target.value)}
        placeholder="O que ficou para a próxima clínica?"
        className="min-h-20"
      />
    </Card>
  );
}

export function ReturnCard({ appointment, onChange }: Props) {
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="h-4.5 w-4.5 text-primary" /> Retorno</CardTitle></CardHeader>
      <div className="space-y-3">
        <Input type="date" value={appointment.returnDate ?? ""} onChange={(e) => onChange("returnDate", e.target.value)} />
        <Textarea
          value={appointment.returnNotes ?? ""}
          onChange={(e) => onChange("returnNotes", e.target.value)}
          placeholder="Observações sobre o retorno."
          className="min-h-16"
        />
      </div>
    </Card>
  );
}
