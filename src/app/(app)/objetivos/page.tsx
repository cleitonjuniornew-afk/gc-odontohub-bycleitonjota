"use client";

import { useState } from "react";
import { Target, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { staggerContainer, fadeInUp } from "@/animations/variants";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useObjectives } from "@/features/objetivos/hooks/use-objectives";
import type { Objective } from "@/repositories/objectives.repository";

const schema = z.object({
  title: z.string().min(2, "Dê um nome ao objetivo"),
  type: z.enum(["diario", "semanal", "mensal", "semestral"]),
  target: z.coerce.number().min(1),
});
type FormInput = z.infer<typeof schema>;

function ObjectiveForm({ open, onOpenChange, defaultType, onSubmit, submitting }: {
  open: boolean; onOpenChange: (o: boolean) => void; defaultType: FormInput["type"];
  onSubmit: (d: FormInput) => Promise<unknown>; submitting?: boolean;
}) {
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { type: defaultType, target: 1 },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo objetivo</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(async (d) => { await onSubmit(d); reset(); onOpenChange(false); })} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" className="mt-1.5" placeholder="Ex: Estudar 12 horas" {...register("title")} />
            {errors.title && <p className="mt-1 text-xs text-error">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Período</Label>
              <Controller control={control} name="type" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diario">Diário</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="semestral">Semestral</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div>
              <Label htmlFor="target">Meta</Label>
              <Input id="target" type="number" className="mt-1.5" {...register("target")} />
            </div>
          </div>
          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" loading={submitting}>Criar objetivo</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ObjectiveTab({ type }: { type: Objective["type"] }) {
  const { objectives, isLoading, createObjective, isCreating, updateObjective, deleteObjective } = useObjectives(type);
  const [formOpen, setFormOpen] = useState(false);

  if (isLoading) return <Skeleton className="h-32 w-full" />;

  if (objectives.length === 0) {
    return (
      <>
        <EmptyState icon={Target} title="Vamos começar?" description="Defina o que você quer conquistar neste período." actionLabel="Criar objetivo" onAction={() => setFormOpen(true)} />
        <ObjectiveForm open={formOpen} onOpenChange={setFormOpen} defaultType={type} submitting={isCreating} onSubmit={(d) => createObjective({ title: d.title, type: d.type, target: d.target, progress: 0 })} />
      </>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setFormOpen(true)}><Plus className="h-3.5 w-3.5" /> Novo objetivo</Button>
      </div>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {objectives.map((o) => {
          const pct = Math.min(100, Math.round((o.progress / o.target) * 100));
          return (
            <motion.div key={o.id} variants={fadeInUp}>
              <Card className="group relative">
                <button onClick={() => deleteObjective(o.id)} className="absolute right-4 top-4 hidden text-text-muted hover:text-error group-hover:block"><Trash2 className="h-3.5 w-3.5" /></button>
                <CardHeader><CardTitle className="text-base">{o.title}</CardTitle></CardHeader>
                <Progress value={pct} />
                <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
                  <span>{o.progress} de {o.target}</span>
                  <button
                    className="text-secondary hover:underline"
                    onClick={() => updateObjective({ id: o.id, input: { progress: Math.min(o.target, o.progress + 1) } })}
                  >
                    + progresso
                  </button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
      <ObjectiveForm open={formOpen} onOpenChange={setFormOpen} defaultType={type} submitting={isCreating} onSubmit={(d) => createObjective({ title: d.title, type: d.type, target: d.target, progress: 0 })} />
    </>
  );
}

export default function ObjetivosPage() {
  return (
    <div>
      <PageHeader title="Objetivos" description="Metas diárias, semanais, mensais e semestrais." />
      <Tabs defaultValue="semanal">
        <TabsList>
          <TabsTrigger value="diario">Diário</TabsTrigger>
          <TabsTrigger value="semanal">Semanal</TabsTrigger>
          <TabsTrigger value="mensal">Mensal</TabsTrigger>
          <TabsTrigger value="semestral">Semestral</TabsTrigger>
        </TabsList>
        <TabsContent value="diario"><ObjectiveTab type="diario" /></TabsContent>
        <TabsContent value="semanal"><ObjectiveTab type="semanal" /></TabsContent>
        <TabsContent value="mensal"><ObjectiveTab type="mensal" /></TabsContent>
        <TabsContent value="semestral"><ObjectiveTab type="semestral" /></TabsContent>
      </Tabs>
    </div>
  );
}
