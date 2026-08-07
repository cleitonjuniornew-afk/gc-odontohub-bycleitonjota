"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: { resumoComoFoi: string; resumoAprendizado: string; resumoFariaDiferente: string; resumoDificuldade: string }) => void;
}

export function FinishAppointmentModal({ open, onOpenChange, onConfirm }: Props) {
  const [form, setForm] = useState({ resumoComoFoi: "", resumoAprendizado: "", resumoFariaDiferente: "", resumoDificuldade: "" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Resumo do Atendimento</DialogTitle>
          <DialogDescription>Deseja realmente finalizar? Registre um breve resumo antes de encerrar.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[50vh] space-y-4 overflow-y-auto pr-1">
          <div>
            <Label>Como foi o atendimento?</Label>
            <Textarea className="mt-1.5 min-h-16" value={form.resumoComoFoi} onChange={(e) => setForm({ ...form, resumoComoFoi: e.target.value })} />
          </div>
          <div>
            <Label>O que você aprendeu hoje?</Label>
            <Textarea className="mt-1.5 min-h-16" value={form.resumoAprendizado} onChange={(e) => setForm({ ...form, resumoAprendizado: e.target.value })} />
          </div>
          <div>
            <Label>O que faria diferente?</Label>
            <Textarea className="mt-1.5 min-h-16" value={form.resumoFariaDiferente} onChange={(e) => setForm({ ...form, resumoFariaDiferente: e.target.value })} />
          </div>
          <div>
            <Label>Qual foi a maior dificuldade?</Label>
            <Textarea className="mt-1.5 min-h-16" value={form.resumoDificuldade} onChange={(e) => setForm({ ...form, resumoDificuldade: e.target.value })} />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button variant="danger" onClick={() => onConfirm(form)}>Finalizar Atendimento</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
