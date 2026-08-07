"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  taskTitle: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (learned: string) => void;
}

export function TaskCompleteModal({ open, taskTitle, onOpenChange, onConfirm }: Props) {
  const [learned, setLearned] = useState("");

  function handleConfirm() {
    onConfirm(learned);
    toast.success("Excelente! Continue assim.");
    setLearned("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>O que você aprendeu?</DialogTitle>
          <DialogDescription>
            Tarefa concluída: <span className="text-text-primary">{taskTitle}</span>. Registrar o aprendizado
            ajuda a IA a organizar suas revisões no futuro.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          autoFocus
          value={learned}
          onChange={(e) => setLearned(e.target.value)}
          placeholder="Ex: Revisei os passos da isolação absoluta e entendi melhor a sequência..."
        />
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Pular
          </Button>
          <Button onClick={handleConfirm}>Salvar e concluir</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
