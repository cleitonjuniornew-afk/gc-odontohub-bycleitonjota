"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Save,
  CircleAlert,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { usePeriodontia } from "@/hooks/use-periodontia";

type ToothStatus = "PRESENTE" | "AUSENTE" | "IMPLANTE";
type Surface = "VESTIBULAR" | "LINGUAL";
type Point = "MESIAL" | "CENTRAL" | "DISTAL";

interface SiteData {
  probingDepth: number | null;
  gingivalRecession: number | null;
  bleeding: boolean;
  plaque: boolean;
  suppuration: boolean;
}

interface Tooth {
  number: number;
  status: ToothStatus;
  mobility: number;
  buccalFurcation: number | null;
  lingualFurcation: number | null;
  observations: string;
  sites: {
    VESTIBULAR: Record<Point, SiteData>;
    LINGUAL: Record<Point, SiteData>;
  };
}

interface OdontogramProps {
  examId?: string;
  patientId?: string;
}

const upperTeeth = [
  18, 17, 16, 15, 14, 13, 12, 11,
  21, 22, 23, 24, 25, 26, 27, 28,
];

const lowerTeeth = [
  48, 47, 46, 45, 44, 43, 42, 41,
  31, 32, 33, 34, 35, 36, 37, 38,
];

const points: Point[] = [
  "MESIAL",
  "CENTRAL",
  "DISTAL",
];

function emptySite(): SiteData {
  return {
    probingDepth: null,
    gingivalRecession: null,
    bleeding: false,
    plaque: false,
    suppuration: false,
  };
}

function createSites() {
  return {
    VESTIBULAR: {
      MESIAL: emptySite(),
      CENTRAL: emptySite(),
      DISTAL: emptySite(),
    },
    LINGUAL: {
      MESIAL: emptySite(),
      CENTRAL: emptySite(),
      DISTAL: emptySite(),
    },
  };
}

function createTeeth(numbers: number[]): Tooth[] {
  return numbers.map((number) => ({
    number,
    status: "PRESENTE",
    mobility: 0,
    buccalFurcation: null,
    lingualFurcation: null,
    observations: "",
    sites: createSites(),
  }));
}

function calculateCAL(site: SiteData) {
  if (
    site.probingDepth === null ||
    site.gingivalRecession === null
  ) {
    return null;
  }

  return site.probingDepth + site.gingivalRecession;
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
    (surface) =>
      Object.values(surface).some(
        (site) => site.bleeding
      )
  );

  const statusClass =
    tooth.status === "AUSENTE"
      ? "border-error/60 bg-error/10 opacity-60"
      : tooth.status === "IMPLANTE"
        ? "border-secondary bg-secondary/10"
        : selected
          ? "border-primary bg-primary/10 shadow-[0_0_22px_rgba(212,175,55,0.25)]"
          : hasBleeding
            ? "border-error/60 bg-error/5"
            : "border-border bg-card hover:border-primary/50";

  return (
    <motion.button
      type="button"
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex min-w-[46px] flex-col items-center gap-1 outline-none"
    >
      <span
        className={`text-[11px] font-semibold ${
          selected
            ? "text-primary"
            : "text-text-muted"
        }`}
      >
        {tooth.number}
      </span>

      <span
        className={`relative flex h-16 w-11 items-center justify-center rounded-[45%] border-2 transition-all ${statusClass}`}
      >
        {tooth.status === "AUSENTE" ? (
          <span className="absolute h-9 w-0.5 rotate-45 rounded-full bg-error" />
        ) : tooth.status === "IMPLANTE" ? (
          <span className="flex h-8 w-6 items-center justify-center rounded-sm border border-secondary">
            <span className="h-6 w-0.5 bg-secondary" />
          </span>
        ) : (
          <>
            <span className="h-8 w-7 rounded-[45%] border border-text-muted/50 bg-background/30" />

            {hasBleeding && (
              <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-error" />
            )}
          </>
        )}
      </span>
    </motion.button>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder = "—",
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      min={0}
      max={20}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(event) => {
        const raw = event.target.value;

        if (raw === "") {
          onChange(null);
          return;
        }

        const number = Number(raw);

        if (!Number.isNaN(number)) {
          onChange(number);
        }
      }}
      className="h-9 w-full rounded-md border border-border bg-background px-2 text-center text-sm text-text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
    />
  );
}

export function Odontogram({
  examId,
  patientId,
}: OdontogramProps) {
  const [teeth, setTeeth] = useState<Tooth[]>(() => [
    ...createTeeth(upperTeeth),
    ...createTeeth(lowerTeeth),
  ]);

  const [selectedTooth, setSelectedTooth] =
    useState<number | null>(null);

  const [surface, setSurface] =
    useState<Surface>("VESTIBULAR");

  const {
    createTooth,
    saveSite,
    finalizeExam,
    isCreatingTooth,
    isSavingSite,
    isFinalizingExam,
  } = usePeriodontia();

  const isSaving =
    isCreatingTooth ||
    isSavingSite ||
    isFinalizingExam;

  const selected = useMemo(
    () =>
      teeth.find(
        (tooth) =>
          tooth.number === selectedTooth
      ),
    [teeth, selectedTooth]
  );

  const selectedIndex = useMemo(
    () =>
      teeth.findIndex(
        (tooth) =>
          tooth.number === selectedTooth
      ),
    [teeth, selectedTooth]
  );

  function updateTooth(
    updater: (tooth: Tooth) => Tooth
  ) {
    if (selectedTooth === null) return;

    setTeeth((current) =>
      current.map((tooth) =>
        tooth.number === selectedTooth
          ? updater(tooth)
          : tooth
      )
    );
  }

  function updateStatus(
    status: ToothStatus
  ) {
    updateTooth((tooth) => ({
      ...tooth,
      status,
    }));
  }

  function updateSite(
    point: Point,
    field: keyof SiteData,
    value: number | boolean | null
  ) {
    updateTooth((tooth) => ({
      ...tooth,
      sites: {
        ...tooth.sites,
        [surface]: {
          ...tooth.sites[surface],
          [point]: {
            ...tooth.sites[surface][point],
            [field]: value,
          },
        },
      },
    }));
  }

  function updateObservation(
    value: string
  ) {
    updateTooth((tooth) => ({
      ...tooth,
      observations: value,
    }));
  }

  function updateMobility(
    value: number
  ) {
    updateTooth((tooth) => ({
      ...tooth,
      mobility: value,
    }));
  }

  function updateFurcation(
    type: "buccal" | "lingual",
    value: number | null
  ) {
    updateTooth((tooth) => ({
      ...tooth,
      [type === "buccal"
        ? "buccalFurcation"
        : "lingualFurcation"]: value,
    }));
  }

  function resetOdontogram() {
    setTeeth([
      ...createTeeth(upperTeeth),
      ...createTeeth(lowerTeeth),
    ]);

    setSelectedTooth(null);
    setSurface("VESTIBULAR");
  }

  function goToTooth(
    direction: -1 | 1
  ) {
    if (selectedIndex < 0) return;

    const nextIndex =
      selectedIndex + direction;

    if (
      nextIndex < 0 ||
      nextIndex >= teeth.length
    ) {
      return;
    }

    setSelectedTooth(
      teeth[nextIndex].number
    );
  }

  async function saveExam() {
    if (!examId) {
      toast.error(
        "Exame periodontal não encontrado."
      );
      return;
    }

    if (!patientId) {
      toast.error(
        "Paciente não encontrado."
      );
      return;
    }

    if (isSaving) return;

    try {
      toast.loading(
        "Salvando exame periodontal...",
        {
          id: "periodontia-save",
        }
      );

      /*
       * =====================================================
       * 1. SALVAR OS 32 DENTES
       * =====================================================
       *
       * O createTooth do repository usa UPSERT.
       * Portanto:
       *
       * - se o dente ainda não existe → cria
       * - se já existe → atualiza
       *
       * Assim não precisamos descobrir previamente
       * o ID do dente.
       */

      for (const tooth of teeth) {
        const savedTooth =
          await createTooth({
            examId,
            toothNumber: tooth.number,
            status: tooth.status,
            mobility: tooth.mobility,
            furcationBuccal:
              tooth.buccalFurcation,
            furcationLingual:
              tooth.lingualFurcation,
            suppuration:
              Object.values(
                tooth.sites
              ).some((surfaceSites) =>
                Object.values(
                  surfaceSites
                ).some(
                  (site) =>
                    site.suppuration
                )
              ),
            plaque:
              Object.values(
                tooth.sites
              ).some((surfaceSites) =>
                Object.values(
                  surfaceSites
                ).some(
                  (site) =>
                    site.plaque
                )
              ),
            observations:
              tooth.observations || null,
          });

        if (!savedTooth?.id) {
          throw new Error(
            `Não foi possível salvar o dente ${tooth.number}.`
          );
        }

        /*
         * =================================================
         * 2. SALVAR OS 6 SÍTIOS DO DENTE
         * =================================================
         */

        const surfaces: Surface[] = [
          "VESTIBULAR",
          "LINGUAL",
        ];

        for (const currentSurface of surfaces) {
          for (const point of points) {
            const site =
              tooth.sites[currentSurface][point];

            const cal =
              calculateCAL(site);

            await saveSite({
              toothId:
                savedTooth.id,

              surface:
                currentSurface,

              point,

              probingDepth:
                site.probingDepth,

              gingivalRecession:
                site.gingivalRecession,

              clinicalAttachmentLevel:
                cal,

              bleeding:
                site.bleeding,

              plaque:
                site.plaque,

              suppuration:
                site.suppuration,

              observations:
                null,
            });
          }
        }
      }

      /*
       * =====================================================
       * 3. FINALIZAR O EXAME
       * =====================================================
       */

      await finalizeExam(examId);

      toast.success(
        "Exame periodontal salvo e finalizado!",
        {
          id: "periodontia-save",
        }
      );
    } catch (error) {
      console.error(
        "ERRO AO SALVAR EXAME PERIODONTAL:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o exame periodontal.";

      toast.error(
        message,
        {
          id: "periodontia-save",
        }
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* ODONTOGRAMA */}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>
                Odontograma periodontal
              </CardTitle>

              <p className="mt-1 text-sm text-text-secondary">
                Selecione um dente para iniciar
                a avaliação periodontal.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={isSaving}
                onClick={
                  resetOdontogram
                }
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Limpar
              </Button>

              <Button
                type="button"
                disabled={isSaving}
                onClick={saveExam}
              >
                <Save className="mr-2 h-4 w-4" />

                {isSaving
                  ? "Salvando..."
                  : "Salvar exame"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto pb-4">
            <div className="mx-auto min-w-[850px] space-y-8">
              {/* SUPERIOR */}

              <div>
                <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Arcada superior
                </p>

                <div className="flex justify-center gap-2">
                  {teeth
                    .filter((tooth) =>
                      upperTeeth.includes(
                        tooth.number
                      )
                    )
                    .map((tooth) => (
                      <ToothVisual
                        key={
                          tooth.number
                        }
                        tooth={tooth}
                        selected={
                          selectedTooth ===
                          tooth.number
                        }
                        onClick={() =>
                          setSelectedTooth(
                            tooth.number
                          )
                        }
                      />
                    ))}
                </div>
              </div>

              <div className="mx-auto h-px max-w-4xl bg-border" />

              {/* INFERIOR */}

              <div>
                <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Arcada inferior
                </p>

                <div className="flex justify-center gap-2">
                  {teeth
                    .filter((tooth) =>
                      lowerTeeth.includes(
                        tooth.number
                      )
                    )
                    .map((tooth) => (
                      <ToothVisual
                        key={
                          tooth.number
                        }
                        tooth={tooth}
                        selected={
                          selectedTooth ===
                          tooth.number
                        }
                        onClick={() =>
                          setSelectedTooth(
                            tooth.number
                          )
                        }
                      />
                    ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.number}
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -8,
            }}
            transition={{
              duration: 0.2,
            }}
            className="space-y-6"
          >
            {/* CABEÇALHO DO DENTE */}

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle>
                        Dente{" "}
                        {selected.number}
                      </CardTitle>

                      <Badge
                        variant={
                          selected.status ===
                          "PRESENTE"
                            ? "success"
                            : selected.status ===
                                "IMPLANTE"
                              ? "primary"
                              : "error"
                        }
                      >
                        {selected.status ===
                        "PRESENTE"
                          ? "Presente"
                          : selected.status ===
                              "IMPLANTE"
                            ? "Implante"
                            : "Ausente"}
                      </Badge>
                    </div>

                    <p className="mt-1 text-sm text-text-secondary">
                      Avaliação periodontal
                      detalhada
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={
                        selectedIndex <=
                          0 ||
                        isSaving
                      }
                      onClick={() =>
                        goToTooth(-1)
                      }
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Anterior
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      disabled={
                        selectedIndex >=
                          teeth.length -
                            1 ||
                        isSaving
                      }
                      onClick={() =>
                        goToTooth(1)
                      }
                    >
                      Próximo
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Button
                    type="button"
                    variant={
                      selected.status ===
                      "PRESENTE"
                        ? "primary"
                        : "secondary"
                    }
                    onClick={() =>
                      updateStatus(
                        "PRESENTE"
                      )
                    }
                  >
                    Presente
                  </Button>

                  <Button
                    type="button"
                    variant={
                      selected.status ===
                      "AUSENTE"
                        ? "primary"
                        : "secondary"
                    }
                    onClick={() =>
                      updateStatus(
                        "AUSENTE"
                      )
                    }
                  >
                    Ausente
                  </Button>

                  <Button
                    type="button"
                    variant={
                      selected.status ===
                      "IMPLANTE"
                        ? "primary"
                        : "secondary"
                    }
                    onClick={() =>
                      updateStatus(
                        "IMPLANTE"
                      )
                    }
                  >
                    Implante
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* SONDAGEM */}

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>
                      Sondagem periodontal
                    </CardTitle>

                    <p className="mt-1 text-sm text-text-secondary">
                      Registre a profundidade
                      de sondagem em cada sítio.
                    </p>
                  </div>

                  <div className="flex rounded-lg border border-border p-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={
                        surface ===
                        "VESTIBULAR"
                          ? "primary"
                          : "ghost"
                      }
                      onClick={() =>
                        setSurface(
                          "VESTIBULAR"
                        )
                      }
                    >
                      Vestibular
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant={
                        surface ===
                        "LINGUAL"
                          ? "primary"
                          : "ghost"
                      }
                      onClick={() =>
                        setSurface(
                          "LINGUAL"
                        )
                      }
                    >
                      Lingual
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] border-collapse">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                          Sítio
                        </th>

                        {points.map(
                          (point) => (
                            <th
                              key={point}
                              className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-text-muted"
                            >
                              {point ===
                              "MESIAL"
                                ? "M"
                                : point ===
                                    "CENTRAL"
                                  ? "C"
                                  : "D"}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="px-3 py-3 text-sm font-medium text-text-primary">
                          Profundidade
                        </td>

                        {points.map(
                          (point) => (
                            <td
                              key={point}
                              className="px-3 py-3"
                            >
                              <NumberInput
                                value={
                                  selected
                                    .sites[
                                      surface
                                    ][
                                      point
                                    ]
                                      .probingDepth
                                }
                                onChange={(
                                  value
                                ) =>
                                  updateSite(
                                    point,
                                    "probingDepth",
                                    value
                                  )
                                }
                              />
                            </td>
                          )
                        )}
                      </tr>

                      <tr className="border-b border-border/50">
                        <td className="px-3 py-3 text-sm font-medium text-text-primary">
                          Recessão
                        </td>

                        {points.map(
                          (point) => (
                            <td
                              key={point}
                              className="px-3 py-3"
                            >
                              <NumberInput
                                value={
                                  selected
                                    .sites[
                                      surface
                                    ][
                                      point
                                    ]
                                      .gingivalRecession
                                }
                                onChange={(
                                  value
                                ) =>
                                  updateSite(
                                    point,
                                    "gingivalRecession",
                                    value
                                  )
                                }
                              />
                            </td>
                          )
                        )}
                      </tr>

                      <tr>
                        <td className="px-3 py-3 text-sm font-medium text-text-primary">
                          NIC
                        </td>

                        {points.map(
                          (point) => {
                            const site =
                              selected
                                .sites[
                                surface
                              ][point];

                            const cal =
                              calculateCAL(
                                site
                              );

                            return (
                              <td
                                key={point}
                                className="px-3 py-3 text-center"
                              >
                                <div className="flex h-9 items-center justify-center rounded-md border border-border bg-background text-sm font-semibold text-text-primary">
                                  {cal ??
                                    "—"}
                                </div>
                              </td>
                            );
                          }
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* MARCADORES */}

            <Card>
              <CardHeader>
                <CardTitle>
                  Marcadores clínicos
                </CardTitle>

                <p className="mt-1 text-sm text-text-secondary">
                  Sangramento, placa e supuração
                  por sítio.
                </p>
              </CardHeader>

              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {points.map(
                    (point) => {
                      const site =
                        selected.sites[
                          surface
                        ][point];

                      return (
                        <div
                          key={point}
                          className="rounded-xl border border-border p-4"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-semibold text-text-primary">
                              {point ===
                              "MESIAL"
                                ? "Mesial"
                                : point ===
                                    "CENTRAL"
                                  ? "Central"
                                  : "Distal"}
                            </span>

                            {site.bleeding && (
                              <CircleAlert className="h-4 w-4 text-error" />
                            )}
                          </div>

                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateSite(
                                  point,
                                  "bleeding",
                                  !site.bleeding
                                )
                              }
                              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                                site.bleeding
                                  ? "border-error/50 bg-error/10 text-error"
                                  : "border-border text-text-secondary hover:border-primary/40"
                              }`}
                            >
                              <span>
                                Sangramento
                              </span>

                              {site.bleeding && (
                                <Check className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateSite(
                                  point,
                                  "plaque",
                                  !site.plaque
                                )
                              }
                              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                                site.plaque
                                  ? "border-primary/50 bg-primary/10 text-primary"
                                  : "border-border text-text-secondary hover:border-primary/40"
                              }`}
                            >
                              <span>
                                Placa
                              </span>

                              {site.plaque && (
                                <Check className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateSite(
                                  point,
                                  "suppuration",
                                  !site.suppuration
                                )
                              }
                              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                                site.suppuration
                                  ? "border-secondary/50 bg-secondary/10 text-secondary"
                                  : "border-border text-text-secondary hover:border-primary/40"
                              }`}
                            >
                              <span>
                                Supuração
                              </span>

                              {site.suppuration && (
                                <Check className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>

            {/* MOBILIDADE E FURCA */}

            <Card>
              <CardHeader>
                <CardTitle>
                  Mobilidade e furca
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      Mobilidade
                    </label>

                    <select
                      value={
                        selected.mobility
                      }
                      onChange={(event) =>
                        updateMobility(
                          Number(
                            event.target
                              .value
                          )
                        )
                      }
                      className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-text-primary outline-none focus:border-primary"
                    >
                      <option value={0}>
                        0 — Normal
                      </option>

                      <option value={1}>
                        1 — Grau I
                      </option>

                      <option value={2}>
                        2 — Grau II
                      </option>

                      <option value={3}>
                        3 — Grau III
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      Furca vestibular
                    </label>

                    <NumberInput
                      value={
                        selected.buccalFurcation
                      }
                      onChange={(value) =>
                        updateFurcation(
                          "buccal",
                          value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-text-primary">
                      Furca lingual
                    </label>

                    <NumberInput
                      value={
                        selected.lingualFurcation
                      }
                      onChange={(value) =>
                        updateFurcation(
                          "lingual",
                          value
                        )
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* OBSERVAÇÕES */}

            <Card>
              <CardHeader>
                <CardTitle>
                  Observações clínicas
                </CardTitle>
              </CardHeader>

              <CardContent>
                <textarea
                  value={
                    selected.observations
                  }
                  onChange={(event) =>
                    updateObservation(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="Digite observações sobre este dente..."
                  className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
