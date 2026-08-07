"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Camera, StickyNote, Package, ListTodo } from "lucide-react";

interface Props {
  onPhoto: () => void;
  onNote: () => void;
  onMaterial: () => void;
  onPendency: () => void;
}

export function FloatingActionButton({ onPhoto, onNote, onMaterial, onPendency }: Props) {
  const [open, setOpen] = useState(false);

  const actions = [
    { icon: Camera, label: "Adicionar Foto", onClick: onPhoto },
    { icon: StickyNote, label: "Adicionar Observação", onClick: onNote },
    { icon: Package, label: "Adicionar Material", onClick: onMaterial },
    { icon: ListTodo, label: "Adicionar Pendência", onClick: onPendency },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open &&
          actions.map((a, i) => (
            <motion.button
              key={a.label}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.03 } }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              onClick={() => {
                a.onClick();
                setOpen(false);
              }}
              className="flex items-center gap-2.5 rounded-full border border-border bg-surface py-2 pl-3.5 pr-4 text-sm text-text-primary shadow-xl"
            >
              <a.icon className="h-4 w-4 text-primary" /> {a.label}
            </motion.button>
          ))}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((o) => !o)}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ duration: 0.15 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_28px_-6px_rgba(212,175,55,0.55)]"
      >
        <Plus className="h-6 w-6" />
      </motion.button>
    </div>
  );
}
