"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Droplets,
  RotateCcw,
  ShieldCheck,
  Syringe,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ToothStatus = "PRESENTE" | "AUSENTE" | "IMPLANTE";

type SiteName = "MV" | "V" | "DV" | "ML" | "L" | "DL";

interface PeriodontalSite {
  probingDepth: number | null;
  gingivalMargin: number | null;
  bleeding: boolean;
  plaque: boolean;
}

interface Tooth {
  number: number;
  status: ToothStatus;
  mobility: number;
  furcation: number;
  suppuration: boolean;
  sites: Record<SiteName, PeriodontalSite>;
}

const upperTeeth = [
  18, 17, 16, 15, 14, 13, 12, 11,
  21, 22, 23, 24, 25, 26, 27, 28,
];

const lowerTeeth = [
  48, 47, 46, 45, 44, 43, 42, 41,
  31, 32, 33, 34, 35, 36, 37, 38,
];

const siteNames: SiteName[] = [
  "MV",
  "V",
  "DV",
  "ML",
  "L",
  "DL",
];

function createSite(): PeriodontalSite {
  return {
    probingDepth: null,
    gingivalMargin: null,
    bleeding: false,
    plaque: false,
  };
}

function createTooth(number: number): Tooth {
  return {
    number,
    status: "PRESENTE",
    mobility: 0,
    furcation: 0,
    suppuration: false,
    sites: {
      MV: createSite(),
      V: createSite(),
      DV: createSite(),
      ML: createSite(),
      L: createSite(),
      DL: createSite(),
    },
  };
}

function createTeeth(numbers: number[]): Tooth[] {
  return numbers.map(createTooth);
}

function calculateCAL(site: PeriodontalSite) {
  if (
    site.probingDepth === null ||
    site.gingivalMargin === null
  ) {
    return null;
  }

  return site.probingDepth + site.gingivalMargin;
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
  const hasBleeding = Object.values(tooth.sites).some(
    (site) => site.bleeding
  );

  const hasPlaque = Object.values(tooth.sites).some(
    (site) => site.plaque
  );

  const statusClass =
    tooth.status === "AUSENTE"
      ? "border-error/60 bg-error/10 opacity-60"
      : tooth.status === "IMPLANTE"
        ? "border-secondary bg-secondary/10"
        : selected
          ? "border-primary bg-primary/10 shadow-[0_0_24px_rgba(212,175,55,0.25)]"
          : "border-border bg-card hover:border-primary/50";

  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative flex min-w-[42px] flex-col items-center gap-1 outline-none"
    >
      <span
        className={`text-[11px] font-semibold transition-colors ${
          selected ? "text-primary" : "text-text-muted"
        }`}
      >
        {tooth.number}
      </span>

      <span
        className={`relative flex h-14 w-10 items-center justify-center rounded-[45%] border-2 transition-all ${statusClass}`}
      >
        {tooth.status === "AUSENTE" ? (
          <span className="h-9 w-0.5 rotate-45 rounded-full bg-error" />
        ) : tooth.status === "IMPLANTE" ? (
          <span className="flex h-8 w-5 items-center justify-center rounded-sm border border-secondary">
            <span className="h-6 w-0.5 bg-secondary" />
          </span>
        ) : (
          <span className="h-8 w-6 rounded-[45%] border border-text-muted/50 bg-background/30" />
        )}

        {hasBleeding && (
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-error shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
        )}

        {hasPlaque && !hasBleeding && (
          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary" />
        )}
      </span>
    </motion.button>
  );
}

function NumberInput({
  value,
  onChange,
  label,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  label: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium uppercase tracking-wide text-text-muted">
        {label}
      </label>

      <input
        type="number"
        min={0}
        max={15}
        value={value ?? ""}
        onChange={(event) => {
          const raw = event.target.value;

          if (raw === "") {
            onChange(null);
            return;
          }

          const parsed = Number(raw);

          if (Number.isNaN(parsed)) {
            return;
          }

          onChange(parsed);
        }}
        className="h-9 w-full rounded-lg border border-border bg-background px-2 text-center text-sm font-semibold text-text-primary outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/30"
      />
    </div>
  );
}

function SiteCard({
  name,
  site,
  onChange,
}: {
  name: SiteName;
  site: PeriodontalSite;
  onChange: (site: PeriodontalSite) => void;
}) {
  const cal = calculateCAL(site);

  return (
    <div
      className={`rounded-xl border p-3 transition-all ${
        site.bleeding
          ? "border-error/40 bg-error/5"
          : "border-border bg-card"
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold text-text-primary">
          {name}
        </span>

        {site.bleeding && (
          <Droplets className="h-3.5 w-3.5 text-error" />
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <NumberInput
          label="MG"
          value={site.gingivalMargin}
          onChange={(value) =>
            onChange({
              ...site,
              gingivalMargin: value,
            })
          }
        />

        <NumberInput
          label="PS"
          value={site.probingDepth}
          onChange={(value) =>
            onChange({
              ...site,
              probingDepth: value,
            })
          }
        />

        <div className="space-y-1">
          <span className="block text-[10px] font-medium uppercase tracking-wide text-text-muted">
            NIC
          </span>

          <div className="flex h-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-sm font-bold text-primary">
            {cal ?? "—"}
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() =>
            onChange({
              ...site,
              bleeding: !site.bleeding,
            })
          }
          className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
            site.bleeding
              ? "border-error/40 bg-error/10 text-error"
              : "border-border text-text-muted hover:border-error/40 hover:text-error"
          }`}
        >
          Sangramento
        </button>

        <button
          type="button"
          onClick={() =>
            onChange({
              ...site,
              plaque: !site.plaque,
            })
          }
          className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
            site.plaque
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border text-text-muted hover:border-primary/40 hover:text-primary"
          }`}
        >
          Placa
        </button>
      </div>
    </div>
  );
}

export function Odontogram() {
  const [teeth, setTeeth] = useState<Tooth[]>(() => [
    ...createTeeth(upperTeeth),
    ...createTeeth(lowerTeeth),
  ]);

  const [selectedTooth, setSelectedTooth] = useState<number | null>(
    null
  );

  const selected = useMemo(
    () =>
      teeth.find(
        (tooth) => tooth.number === selectedTooth
      ),
    [teeth, selectedTooth]
  );

  function updateSelectedTooth(
    updater: (tooth: Tooth) => Tooth
  ) {
    if (selectedTooth === null) {
      return;
    }

    setTeeth((current) =>
      current.map((tooth) =>
        tooth.number === selectedTooth
          ? updater(tooth)
          : tooth
      )
    );
  }

  function updateSite(
    siteName: SiteName,
    site: PeriodontalSite
  ) {
    updateSelectedTooth((tooth) => ({
      ...tooth,
      sites: {
        ...tooth.sites,
        [siteName]: site,
      },
    }));
  }

  function resetOdontogram() {
    setTeeth([
      ...createTeeth(upperTeeth),
      ...createTeeth(lowerTeeth),
    ]);

    setSelectedTooth(null);
  }

  function updateStatus(status: ToothStatus) {
    updateSelectedTooth((tooth) => ({
      ...tooth,
      status,
    }));
  }

  function updateMobility(mobility: number) {
    updateSelectedTooth((tooth) => ({
      ...tooth,
      mobility,
    }));
  }

  function updateFurcation(furcation: number) {
    updateSelectedTooth((tooth) => ({
      ...tooth,
      furcation,
    }));
  }

  function toggleSuppuration() {
    updateSelectedTooth((tooth) => ({
      ...tooth,
      suppuration: !tooth.suppuration,
    }));
  }

  const bleedingCount = selected
    ? Object.values(selected.sites).filter(
        (site) => site.bleeding
      ).length
    : 0;

  const plaqueCount = selected
    ? Object.values(selected.sites).filter(
        (site) => site.plaque
      ).length
    : 0;

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary">
            Odontograma periodontal
          </h3>

          <p className="mt-1 text-sm text-text-secondary">
            Selecione um dente para registrar os seis sítios
            periodontais.
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

      {/* LEGENDA */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card/50 p-3 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-error" />
          Sangramento
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          Placa
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-secondary" />
          Implante
        </div>
      </div>

      {/* ARCADA */}
      <div className="overflow-x-auto pb-4">
        <div className="mx-auto min-w-[820px] space-y-8">
          <div>
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">
              Arcada superior
            </p>

            <div className="flex justify-center gap-2">
              {upperTeeth.map((number) => {
                const tooth = teeth.find(
                  (item) => item.number === number
                );

                if (!tooth) {
                  return null;
                }

                return (
                  <ToothVisual
                    key={number}
                    tooth={tooth}
                    selected={selectedTooth === number}
                    onClick={() =>
                      setSelectedTooth(number)
                    }
                  />
                );
              })}
            </div>
          </div>

          <div className="mx-auto h-px max-w-3xl bg-border" />

          <div>
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">
              Arcada inferior
            </p>

            <div className="flex justify-center gap-2">
              {lowerTeeth.map((number) => {
                const tooth = teeth.find(
                  (item) => item.number === number
                );

                if (!tooth) {
                  return null;
                }

                return (
                  <ToothVisual
                    key={number}
                    tooth={tooth}
                    selected={selectedTooth === number}
                    onClick={() =>
                      setSelectedTooth(number)
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL DO DENTE */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.number}
            initial={{
              opacity: 0,
              y: 12,
              height: 0,
            }}
            animate={{
              opacity: 1,
              y: 0,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              y: -8,
              height: 0,
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4">
              {/* IDENTIFICAÇÃO */}
              <Card className="overflow-hidden border-primary/20">
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <CardTitle>
                          Dente {selected.number}
                        </CardTitle>

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

                      <p className="mt-1 text-sm text-text-secondary">
                        Registro periodontal individual
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={
                          selected.status === "PRESENTE"
                            ? "primary"
                            : "secondary"
                        }
                        onClick={() =>
                          updateStatus("PRESENTE")
                        }
                      >
                        Presente
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant={
                          selected.status === "IMPLANTE"
                            ? "primary"
                            : "secondary"
                        }
                        onClick={() =>
                          updateStatus("IMPLANTE")
                        }
                      >
                        Implante
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant={
                          selected.status === "AUSENTE"
                            ? "primary"
                            : "secondary"
                        }
                        onClick={() =>
                          updateStatus("AUSENTE")
                        }
                      >
                        Ausente
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-3">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />

                        <span className="text-xs font-medium text-text-muted">
                          Mobilidade
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-4 gap-1.5">
                        {[0, 1, 2, 3].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              updateMobility(value)
                            }
                            className={`rounded-lg border py-2 text-xs font-bold transition-all ${
                              selected.mobility === value
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-text-muted hover:border-primary/40"
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-3">
                      <div className="flex items-center gap-2">
                        <Syringe className="h-4 w-4 text-primary" />

                        <span className="text-xs font-medium text-text-muted">
                          Furca
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-4 gap-1.5">
                        {[0, 1, 2, 3].map((value) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              updateFurcation(value)
                            }
                            className={`rounded-lg border py-2 text-xs font-bold transition-all ${
                              selected.furcation === value
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-text-muted hover:border-primary/40"
                            }`}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-3">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-4 w-4 text-error" />

                        <span className="text-xs font-medium text-text-muted">
                          Supuração
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={toggleSuppuration}
                        className={`mt-3 w-full rounded-lg border py-2 text-xs font-bold transition-all ${
                          selected.suppuration
                            ? "border-error/40 bg-error/10 text-error"
                            : "border-border text-text-muted hover:border-error/40"
                        }`}
                      >
                        {selected.suppuration
                          ? "Presente"
                          : "Ausente"}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SÍTIOS */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>
                        Sondagem periodontal
                      </CardTitle>

                      <p className="mt-1 text-sm text-text-secondary">
                        Registre MG, PS e o NIC calculado em seis
                        sítios.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Badge
                        variant={
                          bleedingCount > 0
                            ? "error"
                            : "secondary"
                        }
                      >
                        Sangramento: {bleedingCount}/6
                      </Badge>

                      <Badge variant="secondary">
                        Placa: {plaqueCount}/6
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {siteNames.map((siteName) => (
                      <SiteCard
                        key={siteName}
                        name={siteName}
                        site={selected.sites[siteName]}
                        onChange={(site) =>
                          updateSite(siteName, site)
                        }
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* RESUMO */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        Registro clínico
                      </p>

                      <p className="mt-1 text-xs leading-5 text-text-secondary">
                        O nível de inserção clínica é calculado
                        automaticamente a partir da margem gengival e
                        profundidade de sondagem. Os dados permanecem
                        neste exame enquanto você trabalha no
                        periodontograma.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
