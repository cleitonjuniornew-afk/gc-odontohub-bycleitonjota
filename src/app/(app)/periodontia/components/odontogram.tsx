"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Save,
  CircleAlert,
  Check,
  Loader2,
  CheckCircle2,
  Cloud,
  CloudOff,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { usePeriodontia } from "@/features/periodontia/hooks/use-periodontia";

import type {
  PeriodontalStatus,
  PeriodontalSurface,
  PeriodontalPoint,
} from "@/repositories/periodontia.repository";

type ToothStatus = PeriodontalStatus;
type Surface = PeriodontalSurface;
type Point = PeriodontalPoint;

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
  18,
  17,
  16,
  15,
  14,
  13,
  12,
  11,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
];

const lowerTeeth = [
  48,
  47,
  46,
  45,
  44,
  43,
  42,
  41,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
];

const points: Point[] = [
  "MESIAL",
  "CENTRAL",
  "DISTAL",
];

const SCALE_MAX = 10;

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

/* =========================================================
   MAPA DAS POSIÇÕES DOS DENTES

   Todas as coordenadas são percentuais.
   Isso faz com que as marcações acompanhem a imagem
   quando ela aumentar ou diminuir.

   x / y = centro da área do dente
   width / height = área clicável do dente

   Estes valores ficam centralizados aqui para facilitar
   pequenos ajustes depois do primeiro preview.
========================================================= */

interface ToothPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

const TOOTH_POSITIONS: Record<number, ToothPosition> = {
  /* SUPERIOR - lado direito */
  18: { x: 8.5, y: 54, width: 5.8, height: 35 },
  17: { x: 14.2, y: 47, width: 5.8, height: 38 },
  16: { x: 20.0, y: 41, width: 6.0, height: 40 },
  15: { x: 26.0, y: 36, width: 5.7, height: 39 },
  14: { x: 32.0, y: 32, width: 5.5, height: 37 },
  13: { x: 38.0, y: 29, width: 5.5, height: 36 },
  12: { x: 43.5, y: 27, width: 5.0, height: 34 },
  11: { x: 48.0, y: 26, width: 5.0, height: 34 },

  /* SUPERIOR - lado esquerdo */
  21: { x: 52.0, y: 26, width: 5.0, height: 34 },
  22: { x: 56.5, y: 27, width: 5.0, height: 34 },
  23: { x: 62.0, y: 29, width: 5.5, height: 36 },
  24: { x: 68.0, y: 32, width: 5.5, height: 37 },
  25: { x: 74.0, y: 36, width: 5.7, height: 39 },
  26: { x: 80.0, y: 41, width: 6.0, height: 40 },
  27: { x: 85.8, y: 47, width: 5.8, height: 38 },
  28: { x: 91.5, y: 54, width: 5.8, height: 35 },

  /* INFERIOR - lado direito */
  48: { x: 8.5, y: 46, width: 5.8, height: 35 },
  47: { x: 14.2, y: 53, width: 5.8, height: 38 },
  46: { x: 20.0, y: 59, width: 6.0, height: 40 },
  45: { x: 26.0, y: 64, width: 5.7, height: 39 },
  44: { x: 32.0, y: 68, width: 5.5, height: 37 },
  43: { x: 38.0, y: 71, width: 5.5, height: 36 },
  42: { x: 43.5, y: 73, width: 5.0, height: 34 },
  41: { x: 48.0, y: 74, width: 5.0, height: 34 },

  /* INFERIOR - lado esquerdo */
  31: { x: 52.0, y: 74, width: 5.0, height: 34 },
  32: { x: 56.5, y: 73, width: 5.0, height: 34 },
  33: { x: 62.0, y: 71, width: 5.5, height: 36 },
  34: { x: 68.0, y: 68, width: 5.5, height: 37 },
  35: { x: 74.0, y: 64, width: 5.7, height: 39 },
  36: { x: 80.0, y: 59, width: 6.0, height: 40 },
  37: { x: 85.8, y: 53, width: 5.8, height: 38 },
  38: { x: 91.5, y: 46, width: 5.8, height: 35 },
};

/* =========================================================
   POSIÇÕES RELATIVAS DAS 3 SONDAGENS
========================================================= */

const POINT_X: Record<Point, number> = {
  MESIAL: 22,
  CENTRAL: 50,
  DISTAL: 78,
};

function pointLetter(point: Point) {
  if (point === "MESIAL") return "M";
  if (point === "CENTRAL") return "C";
  return "D";
}

/* =========================================================
   IMAGEM + CAMADA PERIODONTAL
========================================================= */

function PeriodontalImageArch({
  image,
  teeth,
  surface,
  selectedTooth,
  onSelectTooth,
}: {
  image: string;
  teeth: Tooth[];
  surface: Surface;
  selectedTooth: number | null;
  onSelectTooth: (number: number) => void;
}) {
  const presentTeeth = teeth.filter((tooth) =>
    teeth.some((item) => item.number === tooth.number)
  );

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-background">
      {/* IMAGEM ANATÔMICA REAL */}
      <img
        src={image}
        alt={`Arcada periodontal ${surface.toLowerCase()}`}
        className="block h-auto w-full select-none"
        draggable={false}
      />

      {/* =================================================
          CAMADA INTERATIVA
      ================================================= */}
      <div className="pointer-events-none absolute inset-0">
        {/* LINHAS GERAIS MILIMETRADAS */}

        {Array.from({
          length: SCALE_MAX + 1,
        }).map((_, index) => {
          const top = 34 + index * 4.2;

          return (
            <div
              key={`scale-${index}`}
              className="absolute left-[4%] right-[4%]"
              style={{
                top: `${top}%`,
              }}
            >
              <div
                className={`h-px ${
                  index === 0
                    ? "bg-primary/60"
                    : "bg-primary/20"
                }`}
              />

              <span className="absolute right-full mr-1 -translate-y-1/2 text-[8px] font-semibold text-text-muted">
                {index}
              </span>
            </div>
          );
        })}

        {/* DENTES */}

        {presentTeeth.map((tooth) => {
          const position =
            TOOTH_POSITIONS[tooth.number];

          if (!position) return null;

          const sites = tooth.sites[surface];

          const hasBleeding =
            Object.values(sites).some(
              (site) => site.bleeding
            );

          const hasPlaque =
            Object.values(sites).some(
              (site) => site.plaque
            );

          const hasSuppuration =
            Object.values(sites).some(
              (site) => site.suppuration
            );

          const isSelected =
            selectedTooth === tooth.number;

          return (
            <div
              key={tooth.number}
              className="absolute"
              style={{
                left: `${position.x - position.width / 2}%`,
                top: `${position.y - position.height / 2}%`,
                width: `${position.width}%`,
                height: `${position.height}%`,
              }}
            >
              {/* ÁREA CLICÁVEL */}

              <button
                type="button"
                aria-label={`Selecionar dente ${tooth.number}`}
                onClick={() =>
                  onSelectTooth(tooth.number)
                }
                className={`pointer-events-auto absolute inset-0 rounded-lg transition ${
                  isSelected
                    ? "bg-primary/10 ring-2 ring-primary"
                    : "hover:bg-primary/5"
                }`}
              />

              {/* NÚMERO */}

              <span
                className={`pointer-events-none absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold ${
                  isSelected
                    ? "text-primary"
                    : "text-text-primary"
                }`}
              >
                {tooth.number}
              </span>

              {/* CAMADA DE SONDAGEM */}

              {points.map((point) => {
                const site = sites[point];

                const probing =
                  site.probingDepth;

                const recession =
                  site.gingivalRecession;

                const x =
                  POINT_X[point];

                /*
                 * A sondagem ocupa aproximadamente
                 * a região radicular da área do dente.
                 */
                const probingTop =
                  probing !== null
                    ? 18 +
                      (Math.min(
                        Math.max(
                          probing,
                          0
                        ),
                        SCALE_MAX
                      ) /
                        SCALE_MAX) *
                        72
                    : null;

                const recessionTop =
                  recession !== null
                    ? 18 +
                      (Math.min(
                        Math.max(
                          recession,
                          0
                        ),
                        SCALE_MAX
                      ) /
                        SCALE_MAX) *
                        25
                    : null;

                return (
                  <div
                    key={`${tooth.number}-${point}`}
                    className="pointer-events-none absolute inset-0 z-20"
                  >
                    {/* M / C / D */}

                    <span
                      className="absolute -translate-x-1/2 text-[7px] font-bold text-text-secondary"
                      style={{
                        left: `${x}%`,
                        top: "8%",
                      }}
                    >
                      {pointLetter(point)}
                    </span>

                    {/* RECESSÃO */}

                    {recessionTop !== null &&
                      recession !== null &&
                      recession > 0 && (
                        <span
                          className="absolute z-30 h-2 w-2 -translate-x-1/2 rounded-full border border-rose-500 bg-background"
                          style={{
                            left: `${x}%`,
                            top: `${recessionTop}%`,
                          }}
                          title={`Recessão ${recession} mm`}
                        />
                      )}

                    {/* PROFUNDIDADE */}

                    {probingTop !== null &&
                      probing !== null && (
                        <>
                          <span
                            className={`absolute z-40 flex h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-background ${
                              site.bleeding
                                ? "border-red-500 bg-red-500/15"
                                : "border-primary"
                            }`}
                            style={{
                              left: `${x}%`,
                              top: `${probingTop}%`,
                            }}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                site.bleeding
                                  ? "bg-red-500"
                                  : "bg-primary"
                              }`}
                            />
                          </span>

                          <span
                            className={`absolute z-40 -translate-x-1/2 text-[8px] font-bold ${
                              site.bleeding
                                ? "text-red-500"
                                : "text-text-primary"
                            }`}
                            style={{
                              left: `${x}%`,
                              top: `calc(${probingTop}% + 7px)`,
                            }}
                          >
                            {probing}
                          </span>
                        </>
                      )}
                  </div>
                );
              })}

              {/* MARCADORES CLÍNICOS */}

              <div className="pointer-events-none absolute bottom-1 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1">
                {hasBleeding && (
                  <span
                    className="h-2 w-2 rounded-full bg-red-500"
                    title="Sangramento"
                  />
                )}

                {hasPlaque && (
                  <span
                    className="h-2 w-2 rounded-full bg-primary"
                    title="Placa"
                  />
                )}

                {hasSuppuration && (
                  <span
                    className="h-2 w-2 rounded-full bg-secondary"
                    title="Supuração"
                  />
                )}
              </div>

              {/* AUSENTE */}

              {tooth.status ===
                "AUSENTE" && (
                <div className="pointer-events-none absolute inset-0 z-50">
                  <div className="absolute left-1/2 top-1/2 h-[80%] w-[2px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-error" />

                  <div className="absolute left-1/2 top-1/2 h-[80%] w-[2px] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-error" />
                </div>
              )}

              {/* IMPLANTE */}

              {tooth.status ===
                "IMPLANTE" && (
                <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
                  <div className="relative h-[65%] w-[24%] rounded-b-md border-2 border-secondary bg-secondary/10">
                    <div className="absolute inset-y-1 left-1/2 w-1 -translate-x-1/2 rounded-full bg-secondary/60" />

                    {Array.from({
                      length: 5,
                    }).map(
                      (_, index) => (
                        <span
                          key={index}
                          className="absolute left-1/2 h-px w-[85%] -translate-x-1/2 bg-secondary"
                          style={{
                            top: `${
                              15 +
                              index * 17
                            }%`,
                          }}
                        />
                      )
                    )}
                  </div>
                </div>
              )}

              {/* FURCA */}

              {(tooth.buccalFurcation !==
                null ||
                tooth.lingualFurcation !==
                  null) && (
                <span className="pointer-events-none absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded bg-secondary/15 px-1.5 py-0.5 text-[7px] font-bold text-secondary">
                  F
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   INPUT NUMÉRICO
========================================================= */

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

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */

export function Odontogram({
  examId,
  patientId,
}: OdontogramProps) {
  const {
    createTooth,
    updateTooth,
    saveSite,
    finalizeExam,
    isCreatingTooth,
    isUpdatingTooth,
    isSavingSite,
    isFinalizingExam,
  } = usePeriodontia();

  const storageKey = examId
    ? `gc-odontohub-periodontia-draft-${examId}`
    : null;

  const [teeth, setTeeth] =
    useState<Tooth[]>(() => [
      ...createTeeth(upperTeeth),
      ...createTeeth(lowerTeeth),
    ]);

  const [selectedTooth, setSelectedTooth] =
    useState<number | null>(null);

  const [surface, setSurface] =
    useState<Surface>("VESTIBULAR");

  const [isSavingExam, setIsSavingExam] =
    useState(false);

  const [isSaved, setIsSaved] =
    useState(false);

  const [isOfflineDraft, setIsOfflineDraft] =
    useState(false);

  const [hasLoadedDraft, setHasLoadedDraft] =
    useState(false);

  const saveTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const saveVersionRef = useRef(0);

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

  /* =======================================================
     RECUPERAR RASCUNHO
  ======================================================= */

  useEffect(() => {
    if (!storageKey) {
      setHasLoadedDraft(true);
      return;
    }

    try {
      const raw =
        window.localStorage.getItem(
          storageKey
        );

      if (raw) {
        const parsed = JSON.parse(raw);

        if (
          Array.isArray(parsed?.teeth) &&
          parsed.teeth.length > 0
        ) {
          setTeeth(parsed.teeth);
        }

        if (
          typeof parsed?.selectedTooth ===
          "number"
        ) {
          setSelectedTooth(
            parsed.selectedTooth
          );
        }

        if (
          parsed?.surface ===
            "VESTIBULAR" ||
          parsed?.surface === "LINGUAL"
        ) {
          setSurface(parsed.surface);
        }

        setIsSaved(false);
        setIsOfflineDraft(true);
      }
    } catch (error) {
      console.error(
        "ERRO AO RECUPERAR RASCUNHO PERIODONTAL:",
        error
      );
    } finally {
      setHasLoadedDraft(true);
    }
  }, [storageKey]);

  /* =======================================================
     SALVAR RASCUNHO LOCAL
  ======================================================= */

  useEffect(() => {
    if (!storageKey || !hasLoadedDraft) {
      return;
    }

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          teeth,
          selectedTooth,
          surface,
          updatedAt:
            new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error(
        "ERRO AO SALVAR RASCUNHO LOCAL:",
        error
      );
    }
  }, [
    teeth,
    selectedTooth,
    surface,
    storageKey,
    hasLoadedDraft,
  ]);

  /* =======================================================
     ATUALIZAÇÃO LOCAL
  ======================================================= */

  function updateToothLocal(
    updater: (tooth: Tooth) => Tooth
  ) {
    if (selectedTooth === null) return;

    saveVersionRef.current += 1;

    setTeeth((current) =>
      current.map((tooth) =>
        tooth.number === selectedTooth
          ? updater(tooth)
          : tooth
      )
    );

    setIsSaved(false);
    setIsOfflineDraft(true);
  }

  function updateStatus(status: ToothStatus) {
    updateToothLocal((tooth) => ({
      ...tooth,
      status,
    }));
  }

  function updateSite(
    point: Point,
    field: keyof SiteData,
    value: number | boolean | null
  ) {
    updateToothLocal((tooth) => ({
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
    updateToothLocal((tooth) => ({
      ...tooth,
      observations: value,
    }));
  }

  function updateMobility(value: number) {
    updateToothLocal((tooth) => ({
      ...tooth,
      mobility: value,
    }));
  }

  function updateFurcation(
    type: "buccal" | "lingual",
    value: number | null
  ) {
    updateToothLocal((tooth) => ({
      ...tooth,
      [type === "buccal"
        ? "buccalFurcation"
        : "lingualFurcation"]: value,
    }));
  }

  /* =======================================================
     SALVAR DENTE
  ======================================================= */

  async function persistTooth(
    tooth: Tooth
  ) {
    if (!examId || !patientId) {
      return false;
    }

    try {
      setIsSavingExam(true);

      const savedTooth =
        await createTooth({
          examId,
          toothNumber: tooth.number,
          status: tooth.status,
        });

      const hasSuppuration =
        Object.values(tooth.sites).some(
          (surfaceSites) =>
            Object.values(
              surfaceSites
            ).some(
              (site) =>
                site.suppuration
            )
        );

      const hasPlaque =
        Object.values(tooth.sites).some(
          (surfaceSites) =>
            Object.values(
              surfaceSites
            ).some(
              (site) => site.plaque
            )
        );

      await updateTooth({
        id: savedTooth.id,
        input: {
          status: tooth.status,
          mobility: tooth.mobility,
          furcationBuccal:
            tooth.buccalFurcation,
          furcationLingual:
            tooth.lingualFurcation,
          suppuration:
            hasSuppuration,
          plaque: hasPlaque,
          observations:
            tooth.observations || null,
        },
      });

      for (const currentSurface of [
        "VESTIBULAR",
        "LINGUAL",
      ] as Surface[]) {
        for (const point of points) {
          const site =
            tooth.sites[
              currentSurface
            ][point];

          const cal =
            calculateCAL(site);

          await saveSite({
            toothId: savedTooth.id,
            surface: currentSurface,
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
            observations: null,
          });
        }
      }

      return true;
    } catch (error) {
      console.error(
        `ERRO AO SINCRONIZAR DENTE ${tooth.number}:`,
        error
      );

      return false;
    }
  }

  /* =======================================================
     AUTOSAVE
  ======================================================= */

  useEffect(() => {
    if (
      !hasLoadedDraft ||
      !examId ||
      !patientId ||
      selectedTooth === null
    ) {
      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    const toothToSave = teeth.find(
      (tooth) =>
        tooth.number === selectedTooth
    );

    if (!toothToSave) {
      return;
    }

    const currentVersion =
      saveVersionRef.current;

    saveTimerRef.current =
      setTimeout(async () => {
        if (
          currentVersion !==
          saveVersionRef.current
        ) {
          return;
        }

        const success =
          await persistTooth(
            toothToSave
          );

        if (success) {
          setIsSaved(true);
          setIsOfflineDraft(false);
        } else {
          setIsSaved(false);
          setIsOfflineDraft(true);
        }
      }, 700);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(
          saveTimerRef.current
        );
      }
    };
  }, [
    teeth,
    selectedTooth,
    examId,
    patientId,
    hasLoadedDraft,
  ]);

  /* =======================================================
     LIMPAR
  ======================================================= */

  function resetOdontogram() {
    setTeeth([
      ...createTeeth(upperTeeth),
      ...createTeeth(lowerTeeth),
    ]);

    setSelectedTooth(null);
    setSurface("VESTIBULAR");
    setIsSaved(false);
    setIsOfflineDraft(false);

    if (storageKey) {
      try {
        window.localStorage.removeItem(
          storageKey
        );
      } catch (error) {
        console.error(
          "ERRO AO LIMPAR RASCUNHO:",
          error
        );
      }
    }
  }

  /* =======================================================
     NAVEGAÇÃO
  ======================================================= */

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

  /* =======================================================
     SALVAR TODOS
  ======================================================= */

  async function saveExam() {
    if (!examId || !patientId) {
      return;
    }

    if (isSavingExam) return;

    try {
      setIsSavingExam(true);
      setIsSaved(false);

      let allSuccess = true;

      for (const tooth of teeth) {
        const success =
          await persistTooth(tooth);

        if (!success) {
          allSuccess = false;
        }
      }

      setIsSaved(allSuccess);
      setIsOfflineDraft(!allSuccess);
    } catch (error) {
      console.error(
        "ERRO AO SALVAR EXAME PERIODONTAL:",
        error
      );

      setIsSaved(false);
      setIsOfflineDraft(true);
    } finally {
      setIsSavingExam(false);
    }
  }

  /* =======================================================
     FINALIZAR
  ======================================================= */

  async function handleFinalizeExam() {
    if (!examId || !patientId) {
      return;
    }

    try {
      await saveExam();

      await finalizeExam(examId);

      setIsSaved(true);
      setIsOfflineDraft(false);

      if (storageKey) {
        try {
          window.localStorage.removeItem(
            storageKey
          );
        } catch {
          // Não impede a finalização.
        }
      }
    } catch (error) {
      console.error(
        "ERRO AO FINALIZAR EXAME PERIODONTAL:",
        error
      );
    }
  }

  const saving =
    isSavingExam ||
    isCreatingTooth ||
    isUpdatingTooth ||
    isSavingSite;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-6">
      {/* ===================================================
          CABEÇALHO
      =================================================== */}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>
                Odontograma periodontal
              </CardTitle>

              <p className="mt-1 text-sm text-text-secondary">
                Avaliação periodontal sobre
                a anatomia real da arcada.
                Clique em um dente para
                registrar a sondagem.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isOfflineDraft ? (
                <Badge
                  variant="secondary"
                  className="gap-1"
                >
                  <CloudOff className="h-3 w-3" />
                  Rascunho local
                </Badge>
              ) : isSaved ? (
                <Badge
                  variant="success"
                  className="gap-1"
                >
                  <Cloud className="h-3 w-3" />
                  Salvo
                </Badge>
              ) : null}

              <Button
                type="button"
                variant="ghost"
                onClick={
                  resetOdontogram
                }
                disabled={saving}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Limpar
              </Button>

              <Button
                type="button"
                onClick={saveExam}
                disabled={
                  saving ||
                  !examId ||
                  !patientId
                }
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isSaved ? (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}

                {saving
                  ? "Salvando..."
                  : isSaved
                    ? "Salvo"
                    : "Salvar exame"}
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={
                  handleFinalizeExam
                }
                disabled={
                  saving ||
                  isFinalizingExam ||
                  !examId ||
                  !patientId
                }
              >
                {isFinalizingExam ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}

                {isFinalizingExam
                  ? "Finalizando..."
                  : "Finalizar exame"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ===================================================
          PERIODONTOGRAMA
      =================================================== */}

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>
                Periodontograma
              </CardTitle>

              <p className="mt-1 text-xs text-text-secondary">
                A anatomia da arcada é
                representada pela imagem
                original. As linhas, pontos
                e valores periodontais são
                desenhados sobre ela.
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
                  surface === "LINGUAL"
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

        <CardContent className="space-y-6 px-2 sm:px-4">
          {/* =================================================
              SUPERIOR VESTIBULAR
          ================================================= */}

          <div>
            <div className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
              Arcada superior — Vestibular
            </div>

            <PeriodontalImageArch
              image="/superior-vestibular.png.png"
              teeth={teeth.filter((tooth) =>
                upperTeeth.includes(
                  tooth.number
                )
              )}
              surface="VESTIBULAR"
              selectedTooth={
                selectedTooth
              }
              onSelectTooth={
                setSelectedTooth
              }
            />
          </div>

          {/* =================================================
              SUPERIOR LINGUAL
          ================================================= */}

          <div>
            <div className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
              Arcada superior — Lingual /
              Palatina
            </div>

            <PeriodontalImageArch
              image="/superior-lingual.png.png"
              teeth={teeth.filter((tooth) =>
                upperTeeth.includes(
                  tooth.number
                )
              )}
              surface="LINGUAL"
              selectedTooth={
                selectedTooth
              }
              onSelectTooth={
                setSelectedTooth
              }
            />
          </div>

          {/* =================================================
              LINHA MÉDIA
          ================================================= */}

          <div className="relative flex items-center">
            <div className="h-px flex-1 bg-border" />

            <span className="mx-3 rounded-full border border-border bg-card px-3 py-1 text-[8px] font-bold uppercase tracking-wider text-text-muted">
              Linha média
            </span>

            <div className="h-px flex-1 bg-border" />
          </div>

          {/* =================================================
              INFERIOR VESTIBULAR
          ================================================= */}

          <div>
            <div className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
              Arcada inferior — Vestibular
            </div>

            <PeriodontalImageArch
              image="/inferior-vestibular.png.png"
              teeth={teeth.filter((tooth) =>
                lowerTeeth.includes(
                  tooth.number
                )
              )}
              surface="VESTIBULAR"
              selectedTooth={
                selectedTooth
              }
              onSelectTooth={
                setSelectedTooth
              }
            />
          </div>

          {/* =================================================
              INFERIOR LINGUAL
          ================================================= */}

          <div>
            <div className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
              Arcada inferior — Lingual
            </div>

            <PeriodontalImageArch
              image="/inferior-lingual.png.png"
              teeth={teeth.filter((tooth) =>
                lowerTeeth.includes(
                  tooth.number
                )
              )}
              surface="LINGUAL"
              selectedTooth={
                selectedTooth
              }
              onSelectTooth={
                setSelectedTooth
              }
            />
          </div>

          {/* =================================================
              LEGENDA
          ================================================= */}

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-border pt-3 text-[9px] text-text-muted">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Sondagem
            </span>

            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Sangramento
            </span>

            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              Supuração
            </span>

            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary/60" />
              Placa
            </span>

            <span>
              M = Mesial
            </span>

            <span>
              C = Central
            </span>

            <span>
              D = Distal
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ===================================================
          DENTE SELECIONADO
      =================================================== */}

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
                        0
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
                        teeth.length - 1
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
                <CardTitle>
                  Sondagem periodontal
                </CardTitle>

                <p className="mt-1 text-sm text-text-secondary">
                  Informe os valores do
                  sítio selecionado. Eles
                  aparecem automaticamente
                  sobre a imagem da arcada.
                </p>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] border-collapse">
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
                              {pointLetter(
                                point
                              )}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="px-3 py-3 text-sm font-medium">
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
                        <td className="px-3 py-3 text-sm font-medium">
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
                        <td className="px-3 py-3 text-sm font-medium">
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
                                <div className="flex h-9 items-center justify-center rounded-md border border-border bg-background text-sm font-semibold">
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
                  Sangramento, placa e
                  supuração por sítio.
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
                            <span className="text-sm font-semibold">
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
                              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                                site.bleeding
                                  ? "border-error/50 bg-error/10 text-error"
                                  : "border-border text-text-secondary"
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
                              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                                site.plaque
                                  ? "border-primary/50 bg-primary/10 text-primary"
                                  : "border-border text-text-secondary"
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
                              className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                                site.suppuration
                                  ? "border-secondary/50 bg-secondary/10 text-secondary"
                                  : "border-border text-text-secondary"
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
                    <label className="mb-2 block text-sm font-medium">
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
                      className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
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
                    <label className="mb-2 block text-sm font-medium">
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
                    <label className="mb-2 block text-sm font-medium">
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
                  className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none transition placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
