"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ToothStatus = "PRESENTE" | "AUSENTE" | "IMPLANTE";

interface Tooth {
  number: number;
  status: ToothStatus;
}

const upperTeeth = [
  18, 17, 16, 15, 14, 13, 12, 11,
  21, 22, 23, 24, 25, 26, 27, 28,
];

const lowerTeeth = [
  48, 47, 46, 45, 44, 43, 42, 41,
  31, 32, 33, 34, 35, 36, 37, 38,
];

function createTeeth(numbers: number[]): Tooth[] {
  return numbers.map((number) => ({
    number,
    status: "PRESENTE",
  }));
}

function ToothVisual({
  tooth,
  selected,
  onClick,
}: {
  tooth: Tooth;
  selected: boolean;
  onClick: () => void;
}) {
  const statusClass =
    tooth.status === "AUSENTE"
      ? "border-error/60 bg-error/10 opacity-60"
      : tooth.status === "IMPLANTE"
        ? "border-secondary bg-secondary/10"
        : selected
          ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(212,175,55,0.18)]"
          : "border-border bg-card hover:border-primary/50";

  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex min-w-[42px] flex-col items-center gap-1 outline-none"
    >
      <span className="text-[10px] font-medium text-text-muted">
        {tooth.number}
      </span>

      <span
        className={`relative flex h-14 w-10 items-center justify-center rounded-[45%] border-2 transition-all ${statusClass}`}
      >
        {tooth.status === "AUSENTE" ? (
          <span className="h-8 w-0.5 rotate-45 rounded-full bg-error" />
        ) : tooth.status === "IMPLANTE" ? (
          <span className="flex h-7 w-5 items-center justify-center rounded-sm border border-secondary">
            <span className="h-5 w-0.5 bg-secondary" />
          </span>
        ) : (
          <span className="h-7 w-6 rounded-[45%] border border-text-muted/50 bg-background/30" />
        )}
      </span>
    </motion.button>
  );
}

export function Odontogram() {
  const [teeth, setTeeth] = useState<Tooth[]>(() => [
    ...createTeeth(upperTeeth),
    ...createTeeth(lowerTeeth),
  ]);

  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  const selected = useMemo(
    () => teeth.find((tooth) => tooth.number === selectedTooth),
    [teeth, selectedTooth]
  );

  function updateStatus(status: ToothStatus) {
    if (selectedTooth === null) return;

    setTeeth((current) =>
      current.map((tooth) =>
        tooth.number === selectedTooth
          ? { ...tooth, status }
          : tooth
      )
    );
  }

  function resetOdontogram() {
    setTeeth([
      ...createTeeth(upperTeeth),
      ...createTeeth(lowerTeeth),
    ]);
    setSelectedTooth(null);
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Odontograma</CardTitle>

              <p className="mt-1 text-sm text-text-secondary">
                Selecione um dente para registrar suas condições.
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={resetOdontogram}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto pb-4">
            <div className="mx-auto min-w-[760px] space-y-8">
              {/* ARCADA SUPERIOR */}
              <div>
                <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Arcada superior
                </p>

                <div className="flex justify-center gap-2">
                  {teeth
                    .filter((tooth) => upperTeeth.includes(tooth.number))
                    .map((tooth) => (
                      <ToothVisual
                        key={tooth.number}
                        tooth={tooth}
                        selected={selectedTooth === tooth.number}
                        onClick={() =>
                          setSelectedTooth(tooth.number)
                        }
                      />
                    ))}
                </div>
              </div>

              <div className="mx-auto h-px max-w-3xl bg-border" />

              {/* ARCADA INFERIOR */}
              <div>
                <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Arcada inferior
                </p>

                <div className="flex justify-center gap-2">
                  {teeth
                    .filter((tooth) => lowerTeeth.includes(tooth.number))
                    .map((tooth) => (
                      <ToothVisual
                        key={tooth.number}
                        tooth={tooth}
                        selected={selectedTooth === tooth.number}
                        onClick={() =>
                          setSelectedTooth(tooth.number)
                        }
                      />
                    ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PAINEL DO DENTE */}
      {selected && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>
                  Dente {selected.number}
                </CardTitle>

                <p className="mt-1 text-sm text-text-secondary">
                  Estado atual do dente
                </p>
              </div>

              <Badge
                variant={
                  selected.status === "PRESENTE"
                    ? "success"
                    : selected.status === "IMPLANTE"
                      ? "primary"
                      : "error"
                }
              >
                {selected.status === "PRESENTE"
                  ? "Presente"
                  : selected.status === "IMPLANTE"
                    ? "Implante"
                    : "Ausente"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Button
                type="button"
                variant={
                  selected.status === "PRESENTE"
                    ? "primary"
                    : "secondary"
                }
                onClick={() => updateStatus("PRESENTE")}
              >
                Presente
              </Button>

              <Button
                type="button"
                variant={
                  selected.status === "AUSENTE"
                    ? "primary"
                    : "secondary"
                }
                onClick={() => updateStatus("AUSENTE")}
              >
                Ausente
              </Button>

              <Button
                type="button"
                variant={
                  selected.status === "IMPLANTE"
                    ? "primary"
                    : "secondary"
                }
                onClick={() => updateStatus("IMPLANTE")}
              >
                Implante
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
