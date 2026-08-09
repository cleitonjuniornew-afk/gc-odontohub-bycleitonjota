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
   ANATOMIA SVG
   ========================================================= */

type ToothKind =
  | "incisor"
  | "canine"
  | "premolar"
  | "molar";

function getToothKind(number: number): ToothKind {
  const digit = number % 10;

  if (digit === 1 || digit === 2) {
    return "incisor";
  }

  if (digit === 3) {
    return "canine";
  }

  if (digit === 4 || digit === 5) {
    return "premolar";
  }

  return "molar";
}

function ToothSvg({
  number,
  upper,
}: {
  number: number;
  upper: boolean;
}) {
  const kind = getToothKind(number);

  const transform = upper
    ? "translate(0 0)"
    : "translate(0 100) rotate(180 50 50)";

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 h-full w-full"
      aria-label={`Dente ${number}`}
    >
      <g transform={transform}>
        {/* RAIZ */}
        {kind === "incisor" && (
          <path
            d="M43 48 C43 62 41 73 45 92 C47 97 49 99 50 99 C51 99 53 97 55 92 C59 73 57 62 57 48"
            fill="#f7f7f5"
            stroke="#8d8d8d"
            strokeWidth="1.5"
          />
        )}

        {kind === "canine" && (
          <path
            d="M40 45 C40 61 37 72 42 94 C44 99 47 100 50 100 C53 100 56 99 58 94 C63 72 60 61 60 45"
            fill="#f7f7f5"
            stroke="#8d8d8d"
            strokeWidth="1.5"
          />
        )}

        {kind === "premolar" && (
          <>
            <path
              d="M36 47 C36 63 34 73 38 91 C39 96 43 98 46 98"
              fill="#f7f7f5"
              stroke="#8d8d8d"
              strokeWidth="1.5"
            />
            <path
              d="M64 47 C64 63 66 73 62 91 C61 96 57 98 54 98"
              fill="#f7f7f5"
              stroke="#8d8d8d"
              strokeWidth="1.5"
            />
          </>
        )}

        {kind === "molar" && (
          <>
            <path
              d="M30 47 C30 62 29 70 34 88 C35 93 39 96 43 96"
              fill="#f7f7f5"
              stroke="#8d8d8d"
              strokeWidth="1.5"
            />
            <path
              d="M50 47 C50 63 48 75 50 91"
              fill="#f7f7f5"
              stroke="#8d8d8d"
              strokeWidth="1.5"
            />
            <path
              d="M70 47 C70 62 71 70 66 88 C65 93 61 96 57 96"
              fill="#f7f7f5"
              stroke="#8d8d8d"
              strokeWidth="1.5"
            />
          </>
        )}

        {/* COROA */}

        {kind === "incisor" && (
          <path
            d="M38 15
               C40 8 45 5 50 5
               C55 5 60 8 62 15
               L60 43
               C58 50 54 53 50 53
               C46 53 42 50 40 43
               Z"
            fill="#fffefa"
            stroke="#777"
            strokeWidth="1.7"
          />
        )}

        {kind === "canine" && (
          <path
            d="M34 17
               C36 9 43 5 50 5
               C57 5 64 9 66 17
               L58 45
               C56 51 53 54 50 57
               C47 54 44 51 42 45
               Z"
            fill="#fffefa"
            stroke="#777"
            strokeWidth="1.7"
          />
        )}

        {kind === "premolar" && (
          <path
            d="M29 18
               C31 9 39 5 46 7
               C49 8 51 10 53 7
               C61 5 69 10 71 18
               L68 39
               C66 48 59 52 50 52
               C41 52 34 48 32 39
               Z"
            fill="#fffefa"
            stroke="#777"
            strokeWidth="1.7"
          />

        )}

        {kind === "molar" && (
          <path
            d="M24 18
               C25 8 34 4 43 7
               C47 8 50 10 53 7
               C62 4 71 8 75 18
               L73 37
               C72 47 63 53 50 53
               C37 53 28 47 27 37
               Z"
            fill="#fffefa"
            stroke="#777"
            strokeWidth="1.7"
          />
        )}

        {/* SULCOS / ANATOMIA DA COROA */}

        {kind === "incisor" && (
          <path
            d="M50 9 L50 46"
            stroke="#d1d1ce"
            strokeWidth="1"
          />
        )}

        {kind === "canine" && (
          <>
            <path
              d="M50 10 L50 48"
              stroke="#d1d1ce"
              strokeWidth="1"
            />
            <path
              d="M39 24 Q50 31 61 24"
              fill="none"
              stroke="#d1d1ce"
              strokeWidth="1"
            />
          </>
        )}

        {kind === "premolar" && (
          <>
            <ellipse
              cx="41"
              cy="27"
              rx="7"
              ry="10"
              fill="none"
              stroke="#d1d1ce"
              strokeWidth="1"
            />
            <ellipse
              cx="59"
              cy="27"
              rx="7"
              ry="10"
              fill="none"
              stroke="#d1d1ce"
              strokeWidth="1"
            />
            <path
              d="M50 17 L50 39"
              stroke="#d1d1ce"
              strokeWidth="1"
            />
          </>
        )}

        {kind === "molar" && (
          <>
            <ellipse
              cx="40"
              cy="25"
              rx="9"
              ry="8"
              fill="none"
              stroke="#d1d1ce"
              strokeWidth="1"
            />
            <ellipse
              cx="60"
              cy="25"
              rx="9"
              ry="8"
              fill="none"
              stroke="#d1d1ce"
              strokeWidth="1"
            />
            <path
              d="M50 15 L50 39"
              stroke="#d1d1ce"
              strokeWidth="1"
            />
            <path
              d="M31 25 Q50 31 69 25"
              fill="none"
              stroke="#d1d1ce"
              strokeWidth="1"
            />
          </>
        )}
      </g>
    </svg>
  );
}

/* =========================================================
   ESCALA PERIODONTAL SOBRE O DENTE
   ========================================================= */

function PeriodontalTooth({
  tooth,
  upper,
  selected,
  surface,
  onClick,
}: {
  tooth: Tooth;
  upper: boolean;
  selected: boolean;
  surface: Surface;
  onClick: () => void;
}) {
  const sites = tooth.sites[surface];

  const hasBleeding = Object.values(sites).some(
    (site) => site.bleeding
  );

  const hasPlaque = Object.values(sites).some(
    (site) => site.plaque
  );

  const hasSuppuration = Object.values(sites).some(
    (site) => site.suppuration
  );

  const toothKind = getToothKind(tooth.number);

  const recessionValues = points.map(
    (point) => sites[point].gingivalRecession
  );

  const maxRecession = Math.max(
    0,
    ...recessionValues.map((value) =>
      value ?? 0
    )
  );

  /*
   * Área gráfica:
   *
   * 0 = margem gengival / região cervical
   * 10 = região apical
   *
   * A escala fica DENTRO da coluna do dente.
   */
  const chartTop = upper ? 44 : 44;
  const chartHeight = 190;

  function yForDepth(depth: number) {
    const safeDepth = Math.max(
      0,
      Math.min(SCALE_MAX, depth)
    );

    return (
      chartTop +
      (safeDepth / SCALE_MAX) * chartHeight
    );
  }

  function yForRecession(recession: number) {
    const safe = Math.max(
      0,
      Math.min(SCALE_MAX, recession)
    );

    return chartTop + safe * 4;
  }

  const selectedClass = selected
    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
    : "";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex min-w-0 flex-1 flex-col items-center outline-none transition-all ${selectedClass}`}
      style={{
        minWidth:
          "clamp(38px, 5.4vw, 72px)",
      }}
    >
      {/* NÚMERO */}
      <div
        className={`mb-1 text-[8px] font-bold sm:text-[9px] md:text-[10px] ${
          selected
            ? "text-primary"
            : "text-text-primary"
        }`}
      >
        {tooth.number}
      </div>

      {/* UNIDADE DO DENTE */}
      <div
        className="relative w-full"
        style={{
          height:
            "clamp(245px, 27vw, 315px)",
        }}
      >
        {/* LINHAS MILIMETRADAS */}
        <div className="pointer-events-none absolute left-[8%] right-[8%] top-0 bottom-0">
          {Array.from({
            length: SCALE_MAX + 1,
          }).map((_, index) => {
            const y =
              ((chartTop +
                (index / SCALE_MAX) *
                  chartHeight) /
                315) *
              100;

            return (
              <div
                key={index}
                className="absolute left-0 right-0"
                style={{
                  top: `${y}%`,
                }}
              >
                <div
                  className={`h-px w-full ${
                    index === 0
                      ? "bg-primary/70"
                      : "bg-border/50"
                  }`}
                />
                <span
                  className="absolute -left-1 -translate-x-full -translate-y-1/2 text-[7px] leading-none text-text-muted"
                >
                  {index}
                </span>
              </div>
            );
          })}
        </div>

        {/* DENTE SVG */}
        {tooth.status === "PRESENTE" && (
          <div
            className="absolute left-[9%] right-[9%] top-0 z-10"
            style={{
              height:
                "clamp(190px, 20vw, 235px)",
            }}
          >
            <ToothSvg
              number={tooth.number}
              upper={upper}
            />
          </div>
        )}

        {/* DENTE AUSENTE */}
        {tooth.status === "AUSENTE" && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="h-24 w-px rotate-45 bg-error" />
            <div className="absolute h-24 w-px -rotate-45 bg-error" />
          </div>
        )}

        {/* IMPLANTE */}
        {tooth.status === "IMPLANTE" && (
          <div className="absolute inset-x-0 top-10 z-20 flex justify-center">
            <div className="flex h-28 w-8 flex-col items-center rounded-b-lg border-2 border-secondary">
              <div className="h-full w-1 bg-secondary/70" />
              {Array.from({ length: 6 }).map(
                (_, index) => (
                  <span
                    key={index}
                    className="absolute h-px w-7 bg-secondary"
                    style={{
                      top:
                        15 +
                        index * 17,
                    }}
                  />
                )
              )}
            </div>
          </div>
        )}

        {/* MARGEM GENGIVAL / RECESSÃO */}
        {tooth.status === "PRESENTE" && (
          <div
            className="pointer-events-none absolute z-30"
            style={{
              top:
                chartTop +
                Math.min(
                  maxRecession * 4,
                  chartHeight
                ),
              left: "18%",
              right: "18%",
            }}
          >
            <div className="h-0.5 rounded-full bg-rose-400/80 shadow-[0_0_4px_rgba(251,113,133,0.45)]" />
          </div>
        )}

        {/* PONTOS M/C/D */}
        {tooth.status === "PRESENTE" && (
          <>
            {points.map((point, index) => {
              const site = sites[point];

              const x =
                index === 0
                  ? "23%"
                  : index === 1
                    ? "50%"
                    : "77%";

              const probing =
                site.probingDepth;

              const recession =
                site.gingivalRecession;

              /*
               * A profundidade é posicionada
               * diretamente sobre a escala.
               */
              const y =
                probing !== null
                  ? yForDepth(probing)
                  : null;

              /*
               * Se houver recessão, mostramos
               * também o ponto correspondente
               * à margem gengival.
               */
              const recessionY =
                recession !== null
                  ? yForRecession(
                      recession
                    )
                  : null;

              return (
                <div
                  key={point}
                  className="absolute z-40"
                  style={{
                    left: x,
                    top: 0,
                  }}
                >
                  {/* LETRA M/C/D */}
                  <span
                    className="absolute left-1/2 -translate-x-1/2 text-[7px] font-bold text-text-secondary sm:text-[8px]"
                    style={{
                      top: chartTop - 15,
                    }}
                  >
                    {point === "MESIAL"
                      ? "M"
                      : point === "CENTRAL"
                        ? "C"
                        : "D"}
                  </span>

                  {/* RECESSÃO */}
                  {recessionY !== null &&
                    recession !== null &&
                    recession > 0 && (
                      <span
                        className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full border border-rose-500 bg-background"
                        style={{
                          top:
                            recessionY -
                            3,
                        }}
                        title={`Recessão ${recession} mm`}
                      />
                    )}

                  {/* PROFUNDIDADE DE SONDAGEM */}
                  {y !== null && (
                    <span
                      className={`absolute left-1/2 flex h-3.5 w-3.5 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-background ${
                        site.bleeding
                          ? "border-red-500 bg-red-500/15"
                          : "border-primary"
                      }`}
                      style={{
                        top: y - 7,
                      }}
                      title={`${point} ${probing} mm`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          site.bleeding
                            ? "bg-red-500"
                            : "bg-primary"
                        }`}
                      />
                    </span>
                  )}

                  {/* VALOR */}
                  {probing !== null && (
                    <span
                      className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[7px] font-bold ${
                        site.bleeding
                          ? "text-red-500"
                          : "text-text-primary"
                      }`}
                      style={{
                        top:
                          (y ?? 0) + 8,
                      }}
                    >
                      {probing}
                    </span>
                  )}
                </div>
              );
            })}
          </>
        )}

        {/* MARCADORES */}
        <div className="absolute bottom-1 left-1/2 z-50 flex -translate-x-1/2 items-center gap-0.5">
          {hasBleeding && (
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          )}

          {hasPlaque && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          )}

          {hasSuppuration && (
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
          )}
        </div>

        {/* FURCA */}
        {(toothKind === "molar" ||
          toothKind === "premolar") &&
          (tooth.buccalFurcation !== null ||
            tooth.lingualFurcation !== null) && (
            <span className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded bg-secondary/15 px-1 text-[7px] font-bold text-secondary">
              F
            </span>
          )}
      </div>
    </button>
  );
}

/* =========================================================
   INPUT
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

  const [teeth, setTeeth] = useState<Tooth[]>(
    () => [
      ...createTeeth(upperTeeth),
      ...createTeeth(lowerTeeth),
    ]
  );

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
          parsed?.surface === "VESTIBULAR" ||
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
                Visualização periodontal da
                arcada. Clique em um dente
                para registrar a sondagem.
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
          PERIODONTAL CHART
      =================================================== */}

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>
                Periodontograma
              </CardTitle>

              <p className="mt-1 text-xs text-text-secondary">
                As linhas milimetradas ficam
                sobre a região radicular do
                dente. Os pontos M, C e D
                representam os sítios de
                sondagem.
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

        <CardContent className="px-2 sm:px-4">
          {/* ===========================
              SUPERIOR
          ============================ */}

          <div className="w-full">
            <div className="mb-1 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted">
              Arcada superior
            </div>

            <div className="flex w-full items-start gap-0">
              {teeth
                .filter((tooth) =>
                  upperTeeth.includes(
                    tooth.number
                  )
                )
                .map((tooth) => (
                  <PeriodontalTooth
                    key={
                      tooth.number
                    }
                    tooth={tooth}
                    upper
                    selected={
                      selectedTooth ===
                      tooth.number
                    }
                    surface={surface}
                    onClick={() =>
                      setSelectedTooth(
                        tooth.number
                      )
                    }
                  />
                ))}
            </div>
          </div>

          {/* ===========================
              LINHA MÉDIA
          ============================ */}

          <div className="relative my-2 flex items-center">
            <div className="h-px flex-1 bg-border" />

            <span className="mx-3 rounded-full border border-border bg-card px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-text-muted">
              Linha média
            </span>

            <div className="h-px flex-1 bg-border" />
          </div>

          {/* ===========================
              INFERIOR
          ============================ */}

          <div className="w-full">
            <div className="flex w-full items-start gap-0">
              {teeth
                .filter((tooth) =>
                  lowerTeeth.includes(
                    tooth.number
                  )
                )
                .map((tooth) => (
                  <PeriodontalTooth
                    key={
                      tooth.number
                    }
                    tooth={tooth}
                    upper={false}
                    selected={
                      selectedTooth ===
                      tooth.number
                    }
                    surface={surface}
                    onClick={() =>
                      setSelectedTooth(
                        tooth.number
                      )
                    }
                  />
                ))}
            </div>

            <div className="mt-1 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted">
              Arcada inferior
            </div>
          </div>

          {/* ===========================
              LEGENDA
          ============================ */}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-border pt-3 text-[9px] text-text-muted">
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
                  Informe os valores. Eles
                  serão posicionados
                  automaticamente na escala
                  milimetrada do dente.
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
