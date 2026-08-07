"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, GraduationCap, Users, Layers } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { disciplines, tasks, patients, libraryItems } from "@/lib/mock-data";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchModal({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return [
      ...disciplines.filter((d) => d.name.toLowerCase().includes(q)).map((d) => ({ label: d.name, sub: "Disciplina", icon: GraduationCap, href: `/disciplinas/${d.slug}` })),
      ...tasks.filter((t) => t.title.toLowerCase().includes(q)).map((t) => ({ label: t.title, sub: "Tarefa", icon: Layers, href: "/planejamento" })),
      ...patients.filter((p) => p.name.toLowerCase().includes(q)).map((p) => ({ label: p.name, sub: "Paciente", icon: Users, href: "/pacientes" })),
      ...libraryItems.filter((l) => l.title.toLowerCase().includes(q)).map((l) => ({ label: l.title, sub: "Biblioteca", icon: FileText, href: "/biblioteca" })),
    ].slice(0, 8);
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[20%] max-w-xl translate-y-0 p-0">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <Search className="h-4.5 w-4.5 text-text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar disciplinas, tarefas, pacientes, PDFs, fotos..."
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim() && results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-text-muted">Nada encontrado para &quot;{query}&quot;.</p>
          )}
          {results.map((r, i) => {
            const Icon = r.icon;
            return (
              <button
                key={i}
                onClick={() => {
                  router.push(r.href);
                  onOpenChange(false);
                  setQuery("");
                }}
                className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm transition-colors hover:bg-card"
              >
                <Icon className="h-4 w-4 text-primary" />
                <span className="flex-1 truncate text-text-primary">{r.label}</span>
                <span className="text-xs text-text-muted">{r.sub}</span>
              </button>
            );
          })}
          {!query.trim() && (
            <p className="px-3 py-6 text-center text-sm text-text-muted">
              Comece a digitar para pesquisar em todo o GC OdontoHub.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
