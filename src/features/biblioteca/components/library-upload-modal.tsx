"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadCloud, FileCheck2 } from "lucide-react";
import { libraryItemSchema, type LibraryItemFormInput } from "../schemas/library-schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { disciplines } from "@/lib/mock-data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { LibraryItem } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<LibraryItem, "id" | "date">, file?: File) => Promise<LibraryItem> | void;
  submitting?: boolean;
}

export function LibraryUploadModal({ open, onOpenChange, onSubmit, submitting }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<LibraryItemFormInput>({
    resolver: zodResolver(libraryItemSchema),
    defaultValues: { type: "PDF" },
  });

  async function submit(data: LibraryItemFormInput) {
    await onSubmit(data, file ?? undefined);
    reset({ title: "", type: "PDF", disciplineId: "", professor: "", subject: "" });
    setFile(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar material</DialogTitle>
          <DialogDescription>PDFs, slides e vídeos ficam disponíveis para toda a dupla.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <label
            htmlFor="file"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-input)] border border-dashed border-border bg-surface py-6 text-center transition-colors hover:border-primary/50"
          >
            {file ? <FileCheck2 className="h-6 w-6 text-success" /> : <UploadCloud className="h-6 w-6 text-text-muted" />}
            <span className="text-sm text-text-secondary">{file ? file.name : "Clique para selecionar um arquivo"}</span>
            {!isSupabaseConfigured && <span className="text-xs text-warning">Modo demonstração: o arquivo não será enviado a um servidor real.</span>}
            <input id="file" type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>

          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" placeholder="Ex: Slides — Anatomia Dentária" className="mt-1.5" {...register("title")} />
            {errors.title && <p className="mt-1 text-xs text-error">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo</Label>
              <Controller control={control} name="type" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="SLIDE">Slide</SelectItem>
                    <SelectItem value="VIDEO">Vídeo</SelectItem>
                    <SelectItem value="DOCUMENTO">Documento</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div>
              <Label>Disciplina</Label>
              <Controller control={control} name="disciplineId" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {disciplines.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="professor">Professor</Label>
              <Input id="professor" className="mt-1.5" {...register("professor")} />
            </div>
            <div>
              <Label htmlFor="subject">Assunto</Label>
              <Input id="subject" className="mt-1.5" {...register("subject")} />
            </div>
          </div>

          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" loading={submitting}>Adicionar material</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
