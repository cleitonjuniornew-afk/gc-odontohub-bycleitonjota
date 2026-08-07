"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Search, Sun, CalendarClock } from "lucide-react";
import { MAIN_NAV, SECONDARY_NAV } from "@/constants/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GlobalSearchModal } from "./global-search-modal";
import { NotificationsPopover } from "./notifications-popover";

function usePageTitle() {
  const pathname = usePathname();
  const all = [...MAIN_NAV, ...SECONDARY_NAV];
  const match = all.find((i) => pathname === i.href || pathname.startsWith(i.href + "/"));
  return match?.label ?? "GC OdontoHub";
}

export function Topbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const title = usePageTitle();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl lg:px-8">
        <div>
          <p className="text-[11px] text-text-muted">GC OdontoHub</p>
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex h-10 items-center gap-2 rounded-[var(--radius-input)] border border-border bg-surface px-3.5 text-sm text-text-muted transition-colors hover:border-text-muted/60 hover:text-text-secondary"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Pesquisar...</span>
            <kbd className="hidden rounded border border-border bg-card px-1.5 py-0.5 text-[10px] sm:inline">⌘K</kbd>
          </button>

          <button className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-input)] text-text-muted transition-colors hover:bg-card hover:text-text-primary">
            <CalendarClock className="h-4.5 w-4.5" />
          </button>

          <NotificationsPopover />

          <button className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-input)] text-text-muted transition-colors hover:bg-card hover:text-text-primary">
            <Sun className="h-4.5 w-4.5" />
          </button>

          <Avatar className="ml-1">
            <AvatarFallback>JG</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <GlobalSearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
