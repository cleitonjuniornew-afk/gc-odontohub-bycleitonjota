"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { MAIN_NAV, SECONDARY_NAV } from "@/constants/navigation";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_-6px_rgba(212,175,55,0.5)] lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-[80%] max-w-[300px] flex-col bg-surface lg:hidden"
            >
              <div className="flex h-[72px] items-center justify-between px-5">
                <Logo />
                <button onClick={() => setOpen(false)} className="text-text-muted">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
                <div className="space-y-1">
                  {MAIN_NAV.map((item) => {
                    const active = pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium",
                          active ? "bg-primary/10 text-text-primary" : "text-text-secondary"
                        )}
                      >
                        <Icon className="h-4.5 w-4.5" /> {item.label}
                      </Link>
                    );
                  })}
                </div>
                <div className="space-y-1 border-t border-border pt-4">
                  {SECONDARY_NAV.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-text-secondary"
                      >
                        <Icon className="h-4.5 w-4.5" /> {item.label}
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
