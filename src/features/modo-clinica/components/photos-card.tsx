"use client";

import { useRef, useState } from "react";
import { Camera, Plus, Loader2 } from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const phases = ["Antes", "Durante", "Depois"] as const;

type PhotoPhase = (typeof phases)[number];

interface Props {
  onAdd: (
    file: File,
    phase: PhotoPhase
  ) => Promise<void>;
}

export function PhotosCard({ onAdd }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(
    null
  );

  const [selectedPhase, setSelectedPhase] =
    useState<PhotoPhase | null>(null);

  const [uploadingPhase, setUploadingPhase] =
    useState<PhotoPhase | null>(null);

  /**
   * Abre o seletor de arquivos para a fase escolhida.
   */
  const handleSelectPhase = (phase: PhotoPhase) => {
    setSelectedPhase(phase);

    // Pequeno timeout para garantir que o estado
    // seja atualizado antes de abrir o seletor.
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  };

  /**
   * Recebe o arquivo escolhido pelo usuário.
   */
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file || !selectedPhase) {
      event.target.value = "";
      return;
    }

    try {
      setUploadingPhase(selectedPhase);

      await onAdd(file, selectedPhase);
    } finally {
      setUploadingPhase(null);
      setSelectedPhase(null);

      // Permite selecionar novamente o mesmo arquivo.
      event.target.value = "";
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

      {/* Input invisível responsável por abrir
          o seletor de arquivos do dispositivo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="grid grid-cols-3 gap-2">
        {phases.map((phase) => {
          const isUploading =
            uploadingPhase === phase;

          return (
            <button
              key={phase}
              type="button"
              disabled={uploadingPhase !== null}
              onClick={() =>
                handleSelectPhase(phase)
              }
              className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-[12px] border border-dashed border-border text-text-muted transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}

              <span className="text-[10px]">
                {isUploading
                  ? "Enviando..."
                  : phase}
              </span>
            </button>
          );
        })}
      </div>

      <Badge className="mt-3">
        IA de análise de fotos — em breve
      </Badge>
    </Card>
  );
}
