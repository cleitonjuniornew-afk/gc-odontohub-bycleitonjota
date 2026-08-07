"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, FileText, LayoutGrid, List as ListIcon, FileVideo, Presentation, Plus, Download, Trash2 } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/animations/variants";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { LibraryUploadModal } from "./library-upload-modal";
import { useLibrary } from "../hooks/use-library";
import { disciplines } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const typeIcon = { PDF: FileText, SLIDE: Presentation, VIDEO: FileVideo, DOCUMENTO: FileText };

export function LibraryBrowser() {
  const { items, isLoading, createItem, isCreating, deleteItem } = useLibrary();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [uploadOpen, setUploadOpen] = useState(false);

  const filtered = useMemo(
    () => items.filter((l) => l.title.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input icon={<Search className="h-4 w-4" />} placeholder="Pesquisar por título, disciplina, professor..." value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-sm" />
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-[var(--radius-button)] border border-border bg-surface p-1">
            <button onClick={() => setView("grid")} className={cn("rounded-md p-1.5", view === "grid" ? "bg-primary text-primary-foreground" : "text-text-muted")}><LayoutGrid className="h-4 w-4" /></button>
            <button onClick={() => setView("list")} className={cn("rounded-md p-1.5", view === "list" ? "bg-primary text-primary-foreground" : "text-text-muted")}><ListIcon className="h-4 w-4" /></button>
          </div>
          <Button onClick={() => setUploadOpen(true)}><Plus className="h-4 w-4" /> Adicionar material</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="Vamos começar?" description="Adicione seu primeiro PDF, slide ou vídeo à biblioteca." actionLabel="Adicionar material" onAction={() => setUploadOpen(true)} />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className={view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
          {filtered.map((item) => {
            const Icon = typeIcon[item.type];
            const discipline = disciplines.find((d) => d.id === item.disciplineId);
            return (
              <motion.div key={item.id} variants={fadeInUp}>
                <Card className="group flex items-center gap-4 hover:-translate-y-0.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-text-primary">{item.title}</p>
                    <p className="truncate text-xs text-text-muted">{discipline?.name}{item.professor ? ` · ${item.professor}` : ""}</p>
                  </div>
                  <Badge>{item.type}</Badge>
                  <div className="hidden items-center gap-1 group-hover:flex">
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noreferrer" className="rounded-md p-1.5 text-text-muted hover:bg-card hover:text-secondary"><Download className="h-3.5 w-3.5" /></a>
                    )}
                    <button onClick={() => deleteItem({ id: item.id, storagePath: item.storagePath })} className="rounded-md p-1.5 text-text-muted hover:bg-card hover:text-error"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <LibraryUploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        submitting={isCreating}
        onSubmit={(data, file) => createItem({ input: data, file })}
      />
    </div>
  );
}
