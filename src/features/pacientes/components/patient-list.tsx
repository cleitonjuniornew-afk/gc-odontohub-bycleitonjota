"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, CalendarClock, Search, Plus, Pencil, Trash2, ArrowUpDown } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/animations/variants";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { PatientFormModal } from "./patient-form-modal";
import { usePatients } from "../hooks/use-patients";
import type { Patient } from "@/types";

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

type SortKey = "name" | "nextReturn";

export function PatientList() {
  const { patients, isLoading, createPatient, isCreating, updatePatient, isUpdating, deletePatient } = usePatients();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);

  const filtered = useMemo(() => {
    const list = patients.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    return [...list].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      return (a.nextReturn ?? "9999").localeCompare(b.nextReturn ?? "9999");
    });
  }, [patients, query, sortKey]);

  async function handleSubmit(data: Omit<Patient, "id">) {
    if (editing) await updatePatient({ id: editing.id, input: data });
    else await createPatient(data);
    setEditing(null);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3">
          <Input icon={<Search className="h-4 w-4" />} placeholder="Pesquisar paciente..." value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-xs" />
          <Button variant="ghost" size="sm" onClick={() => setSortKey(sortKey === "name" ? "nextReturn" : "name")}>
            <ArrowUpDown className="h-3.5 w-3.5" /> {sortKey === "name" ? "Nome" : "Retorno"}
          </Button>
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" /> Adicionar paciente
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="Vamos começar?" description="Cadastre seu primeiro paciente." actionLabel="Adicionar paciente" onAction={() => setFormOpen(true)} />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <motion.div key={p.id} variants={fadeInUp}>
              <Card className="group relative hover:-translate-y-0.5">
                <div className="absolute right-4 top-4 hidden gap-1 group-hover:flex">
                  <button onClick={() => { setEditing(p); setFormOpen(true); }} className="rounded-md p-1.5 text-text-muted hover:bg-card hover:text-text-primary"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => deletePatient(p.id)} className="rounded-md p-1.5 text-text-muted hover:bg-card hover:text-error"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11"><AvatarFallback>{initials(p.name)}</AvatarFallback></Avatar>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{p.name}</p>
                    <p className="text-xs text-text-muted">{p.age !== undefined ? `${p.age} anos` : ""} {p.professor ? `· ${p.professor}` : ""}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.procedures.map((proc) => <Badge key={proc}>{proc}</Badge>)}
                </div>
                {p.nextReturn && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-text-secondary">
                    <CalendarClock className="h-3.5 w-3.5 text-secondary" /> Retorno em {new Date(p.nextReturn).toLocaleDateString("pt-BR")}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <PatientFormModal
        open={formOpen}
        onOpenChange={(open) => { setFormOpen(open); if (!open) setEditing(null); }}
        onSubmit={handleSubmit}
        submitting={isCreating || isUpdating}
        initialData={editing}
      />
    </div>
  );
}
