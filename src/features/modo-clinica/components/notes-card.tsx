"use client";
import { StickyNote } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function NotesCard({ value, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><StickyNote className="h-4.5 w-4.5 text-primary" /> Anotações Clínicas</CardTitle>
        <span className="text-xs text-text-muted">salvo automaticamente</span>
      </CardHeader>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Registre observações do atendimento em andamento..."
        className="min-h-32"
      />
    </Card>
  );
}
