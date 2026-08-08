"use client";

import {
  useRef,
  useState,
} from "react";

import {
  Camera,
  Plus,
  Loader2,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

const phases = [
  {
    key: "antes",
    label: "Antes",
  },
  {
    key: "durante",
    label: "Durante",
  },
  {
    key: "depois",
    label: "Depois",
  },
] as const;

type PhotoPhase =
  (typeof phases)[number]["key"];

interface Props {
  onAdd: (
    file: File,
    phase: PhotoPhase
  ) => Promise<void>;
}

export function PhotosCard({
  onAdd,
}: Props) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [selectedPhase, setSelectedPhase] =
    useState<PhotoPhase | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const handlePhaseClick = (
    phase: PhotoPhase
  ) => {
    setSelectedPhase(phase);

    inputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    if (!file || !selectedPhase) {
      return;
    }

    try {
      setUploading(true);

      await onAdd(
        file,
        selectedPhase
      );
    } finally {
      setUploading(false);

      event.target.value = "";
      setSelectedPhase(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-4.5 w-4.5 text-primary" />
          Fotos
        </CardTitle>
      </CardHeader>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="grid grid-cols-3 gap-2">
        {phases.map((phase) => (
          <button
            key={phase.key}
            type="button"
            disabled={uploading}
            onClick={() =>
              handlePhaseClick(phase.key)
            }
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-[12px] border border-dashed border-border text-text-muted transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading &&
            selectedPhase === phase.key ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}

            <span className="text-[10px]">
              {phase.label}
            </span>
          </button>
        ))}
      </div>

      <Badge className="mt-3">
        IA de análise de fotos — em breve
      </Badge>
    </Card>
  );
}
