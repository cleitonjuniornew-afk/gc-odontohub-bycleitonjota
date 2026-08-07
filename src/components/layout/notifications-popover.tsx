"use client";

import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const notifications = [
  { title: "Nova prova cadastrada", detail: "Semiologia — 10/08", time: "2h" },
  { title: "Sequência mantida", detail: "6 dias consecutivos de estudo", time: "5h" },
  { title: "Tarefa atrasada", detail: "Responder lista de Oclusão", time: "1d" },
];

export function NotificationsPopover() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-[var(--radius-input)] text-text-muted transition-colors hover:bg-card hover:text-text-primary">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Notificações</p>
        <DropdownMenuSeparator />
        {notifications.map((n) => (
          <DropdownMenuItem key={n.title} className="flex-col items-start gap-0.5 py-2.5">
            <div className="flex w-full items-center justify-between">
              <span className="font-medium">{n.title}</span>
              <span className="text-xs text-text-muted">{n.time}</span>
            </div>
            <span className="text-xs text-text-secondary">{n.detail}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
