"use client";

import { useState } from "react";
import { UploadCloud, FileCheck2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { disciplines } from "@/lib/mock-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (file: File, meta: { description?: string; phase?: "antes" | "durante" | "depois"; disciplineId?: string }) => Promise<unknown>;
  submitting?: boolean;
}

export function PhotoUploadModal({ open, onOpenChange, onSubmit, submitting }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState<"antes" | "durante" | "depois">("depois");
  const [disciplineId, setDisciplineId] = useState<string>("");

  async function handleSubmit() {
    if (!file) return;
    await onSubmit(file, { description: description || undefined, phase, disciplineId: disciplineId || undefined });
    setFile(null);
    setDescription("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar foto</DialogTitle>
          <DialogDescription>Organize por disciplina, fase e descrição.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <label htmlFor="photo-file" className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-input)] border border-dashed border-border bg-surface py-6 text-center transition-colors hover:border-primary/50">
            {file ? <FileCheck2 className="h-6 w-6 text-success" /> : <UploadCloud className="h-6 w-6 text-text-muted" />}
            <span className="text-sm text-text-secondary">{file ? file.name : "Clique para selecionar uma imagem"}</span>
            {!isSupabaseConfigured && <span className="text-xs text-warning">Modo demonstração: a imagem fica disponível apenas nesta sessão.</span>}
            <input id="photo-file" type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" className="mt-1.5" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Caso de restauração classe II" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fase</Label>
              <Select value={phase} onValueChange={(v) => setPhase(v as typeof phase)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="antes">Antes</SelectItem>
                  <SelectItem value="durante">Durante</SelectItem>
                  <SelectItem value="depois">Depois</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Disciplina</Label>
              <Select value={disciplineId} onValueChange={setDisciplineId}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {disciplines.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="button" onClick={handleSubmit} disabled={!file} loading={submitting}>Adicionar foto</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
