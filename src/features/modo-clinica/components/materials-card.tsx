"use client";
import { useState } from "react";
import { Package, Plus, X } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { MaterialItem } from "@/types";

interface Props {
  materials: MaterialItem[];
  onAdd: (m: { name: string; quantity: number }) => void;
  onRemove: (id: string) => void;
}

export function MaterialsCard({ materials, onAdd, onRemove }: Props) {
  const [name, setName] = useState("");

  function handleAdd() {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), quantity: 1 });
    setName("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Package className="h-4.5 w-4.5 text-primary" /> Materiais Utilizados</CardTitle>
      </CardHeader>
      <div className="mb-3 flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Resina composta A2" onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
        <Button size="icon" variant="ghost" onClick={handleAdd}><Plus className="h-4 w-4" /></Button>
      </div>
      {materials.length === 0 ? (
        <p className="text-sm text-text-muted">Nenhum material adicionado ainda.</p>
      ) : (
        <ul className="space-y-2">
          {materials.map((m) => (
            <li key={m.id} className="flex items-center justify-between rounded-[10px] bg-card px-3 py-2 text-sm">
              <span className="text-text-primary">{m.name}</span>
              <button onClick={() => onRemove(m.id)} className="text-text-muted hover:text-error"><X className="h-3.5 w-3.5" /></button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
