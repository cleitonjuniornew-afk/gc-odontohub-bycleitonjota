"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, LogOut } from "lucide-react";
import { toast } from "sonner";
import { MAIN_NAV, SECONDARY_NAV } from "@/constants/navigation";
import { Logo } from "./logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function NavLink({ item }: { item: (typeof MAIN_NAV)[number] }) {
  const pathname = usePathname();
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all duration-150",
        active
          ? "bg-primary/10 text-text-primary"
          : "text-text-secondary hover:bg-white/[0.03] hover:text-text-primary"
      )}
    >
      {active && (
        <motion.span
          layoutId="active-nav-bar"
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary glow-primary"
          transition={{ duration: 0.18, ease: "easeOut" }}
        />
      )}
      <Icon
        className={cn(
          "h-4.5 w-4.5 shrink-0 transition-transform duration-150 group-hover:scale-110",
          active ? "text-primary" : "text-text-muted group-hover:text-primary"
        )}
        strokeWidth={1.75}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.future && (
        <span className="rounded-full bg-secondary/15 px-1.5 py-0.5 text-[10px] font-semibold text-secondary">
          soon
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  const router = useRouter();
  const { user } = useCurrentUser();

  const displayName = (user?.user_metadata?.nome as string | undefined) ?? "Junior & Gabriel";
  const displayEmail = user?.email ?? "Conta compartilhada";

  async function handleLogout() {
    if (!isSupabaseConfigured) {
      toast.info("Ambiente de demonstração: conecte o Supabase para ativar o logout real.");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] flex-col border-r border-border bg-surface/60 backdrop-blur-xl lg:flex">
      <div className="flex h-[72px] items-center px-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        <div className="space-y-1">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Principal</p>
          {MAIN_NAV.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
        <div className="space-y-1">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-text-muted">Secundário</p>
          {SECONDARY_NAV.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-[12px] px-2 py-2 transition-colors hover:bg-white/[0.03]">
          <Avatar>
            <AvatarFallback>{initials(displayName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text-primary">{displayName}</p>
            <p className="truncate text-xs text-text-muted">{displayEmail}</p>
          </div>
          <Link href="/configuracoes" className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-card hover:text-text-primary">
            <SettingsIcon className="h-4 w-4" />
          </Link>
          <button onClick={handleLogout} className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-card hover:text-error" title="Sair">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
