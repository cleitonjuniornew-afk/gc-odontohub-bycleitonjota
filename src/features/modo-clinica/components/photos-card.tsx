"use client";

import { Camera, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const phases = ["Antes", "Durante", "Depois"] as const;

export type PhotoPhase = (typeof phases)[number];

interface Props {
  onAdd: (phase: PhotoPhase) => void;
}

export function PhotosCard({ onAdd }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-4.5 w-4.5 text-primary" />
          Fotos
        </CardTitle>
      </CardHeader>

      <div className="grid grid-cols-3 gap-2">
        {phases.map((phase) => (
          <button
            key={phase}
            type="button"
            onClick={() => onAdd(phase)}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-[12px] border border-dashed border-border text-text-muted transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Plus className="h-4 w-4" />
            <span className="text-[10px]">{phase}</span>
          </button>
        ))}
      </div>

      <Badge className="mt-3">
        IA de análise de fotos — em breve
      </Badge>
    </Card>
  );
}
