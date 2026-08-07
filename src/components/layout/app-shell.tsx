import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-[280px]">
        <Topbar />
        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        <footer className="flex items-center justify-between px-4 py-4 text-xs text-text-muted sm:px-6 lg:px-8">
          <span>GC OdontoHub v1.0 · MVP</span>
          <span className="hidden sm:inline">Servidor online · Sincronizado agora</span>
        </footer>
      </div>
      <MobileNav />
    </div>
  );
}
