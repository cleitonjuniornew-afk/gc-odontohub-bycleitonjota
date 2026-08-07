"use client";

import Link from "next/link";
import { X, Loader2, Cloud } from "lucide-react";
import { ElapsedTimer } from "./elapsed-timer";
import { Button } from "@/components/ui/button";

interface Props {
  startedAt: string;
  saving?: boolean;
  onFinish: () => void;
}

export function ClinicalHeader({ startedAt, saving, onFinish }: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/80 px-5 backdrop-blur-xl sm:px-8">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-sm font-medium text-success">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" /> Atendimento em andamento
        </span>
        <span className="hidden text-text-muted sm:inline">·</span>
        <ElapsedTimer startedAt={startedAt} />
        <span className="hidden items-center gap-1 text-xs text-text-muted sm:flex">
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Cloud className="h-3 w-3" />}
          {saving ? "Salvando..." : "Salvo"}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="danger" size="sm" onClick={onFinish}>
          Finalizar Atendimento
        </Button>
        <Link href="/casos-clinicos" className="text-text-muted transition-colors hover:text-text-primary">
          <X className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}
