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

/*
 * ============================================================
 * POSIÇÕES DOS DENTES
 * ============================================================
 *
 * As imagens possuem 16 dentes distribuídos horizontalmente.
 *
 * Os valores são percentuais da própria imagem.
 * Portanto:
 *
 * 20% continua sendo 20%
 * independentemente do tamanho em que a imagem aparece.
 *
 * Isso impede que a arcada fique achatada ou deformada.
 */

const toothCenters: Record<number, number> = {
  18: 4.8,
  17: 11.0,
  16: 17.8,
  15: 24.3,
  14: 29.8,
  13: 35.0,
  12: 40.2,
  11: 45.2,

  21: 54.8,
  22: 60.0,
  23: 65.0,
  24: 70.1,
  25: 75.5,
  26: 81.5,
  27: 87.8,
  28: 94.3,

  48: 4.8,
  47: 11.1,
  46: 17.8,
  45: 24.3,
  44: 29.9,
  43: 35.0,
  42: 40.2,
  41: 45.2,

  31: 54.8,
  32: 60.0,
  33: 65.0,
  34: 70.1,
  35: 75.5,
  36: 81.5,
  37: 87.8,
  38: 94.3,
};

/*
 * Largura aproximada de cada dente.
 * Usada somente para separar M/C/D.
 */

const toothWidths: Record<number, number> = {
  18: 5.8,
  17: 6.0,
  16: 6.2,
  15: 5.7,
  14: 5.3,
  13: 5.0,
  12: 4.9,
  11: 5.0,

  21: 5.0,
  22: 4.9,
  23: 5.0,
  24: 5.3,
  25: 5.7,
  26: 6.2,
  27: 6.0,
  28: 5.8,

  48: 5.8,
  47: 6.0,
  46: 6.2,
  45: 5.7,
  44: 5.3,
  43: 5.0,
  42: 4.9,
  41: 5.0,

  31: 5.0,
  32: 4.9,
  33: 5.0,
  34: 5.3,
  35: 5.7,
  36: 6.2,
  37: 6.0,
  38: 5.8,
};

/*
 * ============================================================
 * POSIÇÃO VERTICAL DA ESCALA
 * ============================================================
 *
 * A imagem continua intacta.
 *
 * A escala periodontal fica sobre a região radicular.
 *
 * Para a arcada superior:
 * 0 mm = próximo à margem gengival
 * 10 mm = em direção à raiz.
 *
 * Para a inferior fazemos a mesma lógica.
 */

const chartConfig = {
  upper: {
    top: 52,
    bottom: 89,
  },

  lower: {
    top: 50,
    bottom: 87,
  },
};

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

/*
 * ============================================================
 * IMAGEM + OVERLAY PERIODONTAL
 * ============================================================
 */

function PeriodontalArcade({
  teeth,
  upper,
  surface,
  selectedTooth,
  onSelectTooth,
}: {
  teeth: Tooth[];
  upper: boolean;
  surface: Surface;
  selectedTooth: number | null;
  onSelectTooth: (number: number) => void;
}) {
  const image = upper
    ? surface === "VESTIBULAR"
      ? "/superior-vestibular.png.png"
      : "/superior-lingual.png.png"
    : surface === "VESTIBULAR"
      ? "/inferior-vestibular.png.png"
      : "/inferior-lingual.png.png";

  const config = upper
    ? chartConfig.upper
    : chartConfig.lower;

  const visibleTeeth = teeth.filter((tooth) =>
    upper
      ? upperTeeth.includes(tooth.number)
      : lowerTeeth.includes(tooth.number)
  );

  function siteX(
    toothNumber: number,
    point: Point
  ) {
    const center =
      toothCenters[toothNumber];

    const width =
      toothWidths[toothNumber];

    if (point === "MESIAL") {
      return center - width * 0.25;
    }

    if (point === "DISTAL") {
      return center + width * 0.25;
    }

    return center;
  }

  function yForProbing(
    value: number | null
  ) {
    if (value === null) {
      return null;
    }

    const safe = Math.max(
      0,
      Math.min(SCALE_MAX, value)
    );

    return (
      config.top +
      ((config.bottom - config.top) *
        safe) /
        SCALE_MAX
    );
  }

  /*
   * Recessão:
   *
   * 0 = margem gengival normal
   *
   * positiva:
   * desloca para cima
   *
   * negativa:
   * desloca para baixo
   *
   * Cada 1 mm = 2.2% da altura disponível.
   */

  function yForRecession(
    value: number | null
  ) {
    if (value === null) {
      return null;
    }

    const displacement =
      value * 2.2;

    return Math.max(
      18,
      Math.min(
        94,
        config.top - displacement
      )
    );
  }

  function buildPolyline(
    tooth: Tooth,
    type: "recession" | "probing"
  ) {
    const sites =
      tooth.sites[surface];

    return points
      .map((point) => {
        const x = siteX(
          tooth.number,
          point
        );

        const value =
          type === "recession"
            ? sites[point]
                .gingivalRecession
            : sites[point]
                .probingDepth;

        const y =
          type === "recession"
            ? yForRecession(value)
            : yForProbing(value);

        if (y === null) {
          return null;
        }

        return `${x},${y}`;
      })
      .filter(Boolean)
      .join(" ");
  }

  return (
    <div className="w-full">
      <div
        className="relative w-full overflow-hidden rounded-xl border border-border bg-white"
        style={{
          aspectRatio: "3248 / 653",
        }}
      >
        {/* ==================================================
            IMAGEM REAL
        ================================================== */}

        <img
          src={image}
          alt={
            upper
              ? `Arcada superior ${surface.toLowerCase()}`
              : `Arcada inferior ${surface.toLowerCase()}`
          }
          className="absolute inset-0 block h-full w-full object-contain"
          draggable={false}
        />

        {/* ==================================================
            SVG SOBRE A IMAGEM
        ================================================== */}

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          {/* =================================================
              ESCALAS PRETAS
          ================================================= */}

          {visibleTeeth.map((tooth) => {
            const center =
              toothCenters[tooth.number];

            const width =
              toothWidths[tooth.number];

            const sites =
              tooth.sites[surface];

            const scaleX = [
              center - width * 0.25,
              center,
              center + width * 0.25,
            ];

            return (
              <g key={`scale-${tooth.number}`}>
                {scaleX.map(
                  (x, index) => (
                    <g
                      key={`${tooth.number}-${index}`}
                    >
                      {/* Linha vertical principal */}
                      <line
                        x1={x}
                        y1={config.top}
                        x2={x}
                        y2={config.bottom}
                        stroke="#111111"
                        strokeWidth="0.16"
                        vectorEffect="non-scaling-stroke"
                        opacity="0.82"
                      />

                      {/* Milímetros */}
                      {Array.from({
                        length: 11,
                      }).map(
                        (_, mm) => {
                          const y =
                            config.top +
                            ((config.bottom -
                              config.top) *
                              mm) /
                              SCALE_MAX;

                          return (
                            <line
                              key={mm}
                              x1={x - 0.65}
                              y1={y}
                              x2={x + 0.65}
                              y2={y}
                              stroke="#111111"
                              strokeWidth="0.14"
                              vectorEffect="non-scaling-stroke"
                              opacity="0.85"
                            />
                          );
                        }
                      )}
                    </g>
                  )
                )}

                {/* =========================================
                    LINHA VERMELHA — MARGEM GENGIVAL
                ========================================= */}

                {(() => {
                  const polyline =
                    buildPolyline(
                      tooth,
                      "recession"
                    );

                  if (!polyline) {
                    return null;
                  }

                  return (
                    <polyline
                      points={polyline}
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="0.55"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })()}

                {/* =========================================
                    LINHA AZUL — PROFUNDIDADE
                ========================================= */}

                {(() => {
                  const polyline =
                    buildPolyline(
                      tooth,
                      "probing"
                    );

                  if (!polyline) {
                    return null;
                  }

                  return (
                    <polyline
                      points={polyline}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="0.55"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })()}
              </g>
            );
          })}
        </svg>

        {/* ==================================================
            CAMADA INTERATIVA DOS DENTES
        ================================================== */}

        {visibleTeeth.map((tooth) => {
          const center =
            toothCenters[tooth.number];

          const width =
            toothWidths[tooth.number];

          const selected =
            selectedTooth === tooth.number;

          const sites =
            tooth.sites[surface];

          const recessionPoints =
            points
              .map((point) => {
                const value =
                  sites[point]
                    .gingivalRecession;

                if (value === null) {
                  return null;
                }

                const x =
                  point === "MESIAL"
                    ? center -
                      width * 0.25
                    : point ===
                        "DISTAL"
                      ? center +
                        width * 0.25
                      : center;

                const y =
                  yForRecession(value);

                if (y === null) {
                  return null;
                }

                return {
                  x,
                  y,
                  value,
                };
              })
              .filter(Boolean) as {
              x: number;
              y: number;
              value: number;
            }[];

          const probingPoints =
            points
              .map((point) => {
                const value =
                  sites[point]
                    .probingDepth;

                if (value === null) {
                  return null;
                }

                const x =
                  point === "MESIAL"
                    ? center -
                      width * 0.25
                    : point ===
                        "DISTAL"
                      ? center +
                        width * 0.25
                      : center;

                const y =
                  yForProbing(value);

                if (y === null) {
                  return null;
                }

                return {
                  x,
                  y,
                  value,
                  bleeding:
                    sites[point]
                      .bleeding,
                };
              })
              .filter(Boolean) as {
              x: number;
              y: number;
              value: number;
              bleeding: boolean;
            }[];

          const hasBleeding =
            points.some(
              (point) =>
                sites[point].bleeding
            );

          const hasPlaque =
            points.some(
              (point) =>
                sites[point].plaque
            );

          const hasSuppuration =
            points.some(
              (point) =>
                sites[point]
                  .suppuration
            );

          return (
            <button
              key={`interactive-${tooth.number}`}
              type="button"
              aria-label={`Selecionar dente ${tooth.number}`}
              onClick={() =>
                onSelectTooth(
                  tooth.number
                )
              }
              className="absolute z-30 -translate-x-1/2 outline-none"
              style={{
                left: `${center}%`,
                top: "0%",
                width: `${width + 1.5}%`,
                height: "100%",
              }}
            >
              {/* =================================================
                  NÚMERO DO DENTE
              ================================================= */}

              <span
                className={`absolute left-1/2 top-[2%] -translate-x-1/2 rounded px-1 text-[8px] font-bold leading-none sm:text-[9px] ${
                  selected
                    ? "bg-primary text-white"
                    : "bg-white/90 text-black"
                }`}
              >
                {tooth.number}
              </span>

              {/* =================================================
                  M/C/D
              ================================================= */}

              <div
                className="pointer-events-none absolute left-0 right-0"
                style={{
                  top: `${config.top - 7}%`,
                }}
              >
                {points.map(
                  (point) => {
                    const x =
                      point ===
                      "MESIAL"
                        ? 25
                        : point ===
                            "DISTAL"
                          ? 75
                          : 50;

                    return (
                      <span
                        key={point}
                        className="absolute -translate-x-1/2 text-[8px] font-bold text-black sm:text-[9px]"
                        style={{
                          left: `${x}%`,
                        }}
                      >
                        {point ===
                        "MESIAL"
                          ? "M"
                          : point ===
                              "CENTRAL"
                            ? "C"
                            : "D"}
                      </span>
                    );
                  }
                )}
              </div>

              {/* =================================================
                  PONTOS VERMELHOS — MARGEM
              ================================================= */}

              <div className="pointer-events-none absolute inset-0">
                {recessionPoints.map(
                  (point, index) => (
                    <span
                      key={`rec-${index}`}
                      className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-700 bg-red-500 shadow-sm"
                      style={{
                        left: `${((point.x - center) / width) * 100 + 50}%`,
                        top: `${point.y}%`,
                      }}
                    />
                  )
                )}
              </div>

              {/* =================================================
                  PONTOS AZUIS — SONDAGEM
              ================================================= */}

              <div className="pointer-events-none absolute inset-0">
                {probingPoints.map(
                  (point, index) => (
                    <span
                      key={`probe-${index}`}
                      className={`absolute flex h-3 w-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-white ${
                        point.bleeding
                          ? "border-red-600"
                          : "border-blue-600"
                      }`}
                      style={{
                        left: `${((point.x - center) / width) * 100 + 50}%`,
                        top: `${point.y}%`,
                      }}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          point.bleeding
                            ? "bg-red-600"
                            : "bg-blue-600"
                        }`}
                      />
                    </span>
                  )
                )}
              </div>

              {/* =================================================
                  VALORES DA SONDAGEM
              ================================================= */}

              <div className="pointer-events-none absolute inset-0">
                {probingPoints.map(
                  (point, index) => (
                    <span
                      key={`value-${index}`}
                      className={`absolute -translate-x-1/2 whitespace-nowrap text-[8px] font-bold ${
                        point.bleeding
                          ? "text-red-600"
                          : "text-blue-700"
                      }`}
                      style={{
                        left: `${((point.x - center) / width) * 100 + 50}%`,
                        top: `calc(${point.y}% + 4px)`,
                      }}
                    >
                      {point.value}
                    </span>
                  )
                )}
              </div>

              {/* =================================================
                  X — DENTE AUSENTE
              ================================================= */}

              {tooth.status ===
                "AUSENTE" && (
                <div className="pointer-events-none absolute inset-x-[20%] top-[30%] bottom-[20%]">
                  <span
                    className="absolute left-1/2 top-1/2 h-[75%] w-[2px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-red-600"
                  />

                  <span
                    className="absolute left-1/2 top-1/2 h-[75%] w-[2px] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-red-600"
                  />
                </div>
              )}

              {/* =================================================
                  IMPLANTE
              ================================================= */}

              {tooth.status ===
                "IMPLANTE" && (
                <div className="pointer-events-none absolute left-1/2 top-[35%] h-[30%] w-[20%] -translate-x-1/2 rounded border-2 border-purple-600">
                  <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-purple-600" />

                  {Array.from({
                    length: 5,
                  }).map(
                    (_, index) => (
                      <span
                        key={index}
                        className="absolute left-1/2 h-px w-full -translate-x-1/2 bg-purple-600"
                        style={{
                          top: `${15 + index * 17}%`,
                        }}
                      />
                    )
                  )}
                </div>
              )}

              {/* =================================================
                  MARCADORES
              ================================================= */}

              <div className="pointer-events-none absolute bottom-[2%] left-1/2 flex -translate-x-1/2 gap-1">
                {hasBleeding && (
                  <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
                )}

                {hasPlaque && (
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                )}

                {hasSuppuration && (
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/*
 * ============================================================
 * INPUT
 * ============================================================
 */

function NumberInput({
  value,
  onChange,
  placeholder = "—",
}: {
  value: number | null;
  onChange: (
    value: number | null
  ) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      min={-20}
      max={20}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(event) => {
        const raw =
          event.target.value;

        if (raw === "") {
          onChange(null);
          return;
        }

        const number =
          Number(raw);

        if (!Number.isNaN(number)) {
          onChange(number);
        }
      }}
      className="h-9 w-full rounded-md border border-border bg-background px-2 text-center text-sm text-text-primary outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30"
    />
  );
}

/*
 * ============================================================
 * COMPONENTE PRINCIPAL
 * ============================================================
 */

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
      ...createTeeth(
        upperTeeth
      ),
      ...createTeeth(
        lowerTeeth
      ),
    ]);

  const [
    selectedTooth,
    setSelectedTooth,
  ] = useState<number | null>(
    null
  );

  const [surface, setSurface] =
    useState<Surface>(
      "VESTIBULAR"
    );

  const [
    isSavingExam,
    setIsSavingExam,
  ] = useState(false);

  const [isSaved, setIsSaved] =
    useState(false);

  const [
    isOfflineDraft,
    setIsOfflineDraft,
  ] = useState(false);

  const [
    hasLoadedDraft,
    setHasLoadedDraft,
  ] = useState(false);

  const saveTimerRef =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const saveVersionRef =
    useRef(0);

  const selected = useMemo(
    () =>
      teeth.find(
        (tooth) =>
          tooth.number ===
          selectedTooth
      ),
    [
      teeth,
      selectedTooth,
    ]
  );

  const selectedIndex =
    useMemo(
      () =>
        teeth.findIndex(
          (tooth) =>
            tooth.number ===
            selectedTooth
        ),
      [
        teeth,
        selectedTooth,
      ]
    );

  /*
   * ==========================================================
   * RECUPERAR RASCUNHO
   * ==========================================================
   */

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
        const parsed =
          JSON.parse(raw);

        if (
          Array.isArray(
            parsed?.teeth
          ) &&
          parsed.teeth.length >
            0
        ) {
          setTeeth(
            parsed.teeth
          );
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
          parsed?.surface ===
            "LINGUAL"
        ) {
          setSurface(
            parsed.surface
          );
        }

        setIsSaved(false);
        setIsOfflineDraft(
          true
        );
      }
    } catch (error) {
      console.error(
        "ERRO AO RECUPERAR RASCUNHO PERIODONTAL:",
        error
      );
    } finally {
      setHasLoadedDraft(
        true
      );
    }
  }, [storageKey]);

  /*
   * ==========================================================
   * SALVAR RASCUNHO LOCAL
   * ==========================================================
   */

  useEffect(() => {
    if (
      !storageKey ||
      !hasLoadedDraft
    ) {
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

  /*
   * ==========================================================
   * ATUALIZAÇÃO LOCAL
   * ==========================================================
   */

  function updateToothLocal(
    updater: (
      tooth: Tooth
    ) => Tooth
  ) {
    if (
      selectedTooth === null
    ) {
      return;
    }

    saveVersionRef.current += 1;

    setTeeth(
      (current) =>
        current.map(
          (tooth) =>
            tooth.number ===
            selectedTooth
              ? updater(tooth)
              : tooth
        )
    );

    setIsSaved(false);
    setIsOfflineDraft(true);
  }

  function updateStatus(
    status: ToothStatus
  ) {
    updateToothLocal(
      (tooth) => ({
        ...tooth,
        status,
      })
    );
  }

  function updateSite(
    point: Point,
    field: keyof SiteData,
    value:
      | number
      | boolean
      | null
  ) {
    updateToothLocal(
      (tooth) => ({
        ...tooth,

        sites: {
          ...tooth.sites,

          [surface]: {
            ...tooth.sites[
              surface
            ],

            [point]: {
              ...tooth.sites[
                surface
              ][point],

              [field]: value,
            },
          },
        },
      })
    );
  }

  function updateObservation(
    value: string
  ) {
    updateToothLocal(
      (tooth) => ({
        ...tooth,
        observations:
          value,
      })
    );
  }

  function updateMobility(
    value: number
  ) {
    updateToothLocal(
      (tooth) => ({
        ...tooth,
        mobility: value,
      })
    );
  }

  function updateFurcation(
    type:
      | "buccal"
      | "lingual",
    value: number | null
  ) {
    updateToothLocal(
      (tooth) => ({
        ...tooth,

        [type === "buccal"
          ? "buccalFurcation"
          : "lingualFurcation"]:
          value,
      })
    );
  }

  /*
   * ==========================================================
   * SALVAR DENTE
   * ==========================================================
   */

  async function persistTooth(
    tooth: Tooth
  ) {
    if (
      !examId ||
      !patientId
    ) {
      return false;
    }

    try {
      setIsSavingExam(true);

      const savedTooth =
        await createTooth({
          examId,
          toothNumber:
            tooth.number,
          status:
            tooth.status,
        });

      const hasSuppuration =
        Object.values(
          tooth.sites
        ).some(
          (
            surfaceSites
          ) =>
            Object.values(
              surfaceSites
            ).some(
              (site) =>
                site.suppuration
            )
        );

      const hasPlaque =
        Object.values(
          tooth.sites
        ).some(
          (
            surfaceSites
          ) =>
            Object.values(
              surfaceSites
            ).some(
              (site) =>
                site.plaque
            )
        );

      await updateTooth({
        id: savedTooth.id,

        input: {
          status:
            tooth.status,

          mobility:
            tooth.mobility,

          furcationBuccal:
            tooth.buccalFurcation,

          furcationLingual:
            tooth.lingualFurcation,

          suppuration:
            hasSuppuration,

          plaque:
            hasPlaque,

          observations:
            tooth.observations ||
            null,
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

      return true;
    } catch (error) {
      console.error(
        `ERRO AO SINCRONIZAR DENTE ${tooth.number}:`,
        error
      );

      return false;
    }
  }

  /*
   * ==========================================================
   * AUTOSAVE
   * ==========================================================
   */

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
      clearTimeout(
        saveTimerRef.current
      );
    }

    const toothToSave =
      teeth.find(
        (tooth) =>
          tooth.number ===
          selectedTooth
      );

    if (!toothToSave) {
      return;
    }

    const currentVersion =
      saveVersionRef.current;

    saveTimerRef.current =
      setTimeout(
        async () => {
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
            setIsOfflineDraft(
              false
            );
          } else {
            setIsSaved(false);
            setIsOfflineDraft(
              true
            );
          }
        },
        700
      );

    return () => {
      if (
        saveTimerRef.current
      ) {
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

  /*
   * ==========================================================
   * LIMPAR
   * ==========================================================
   */

  function resetOdontogram() {
    setTeeth([
      ...createTeeth(
        upperTeeth
      ),
      ...createTeeth(
        lowerTeeth
      ),
    ]);

    setSelectedTooth(null);
    setSurface(
      "VESTIBULAR"
    );

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

  /*
   * ==========================================================
   * NAVEGAÇÃO
   * ==========================================================
   */

  function goToTooth(
    direction: -1 | 1
  ) {
    if (
      selectedIndex < 0
    ) {
      return;
    }

    const nextIndex =
      selectedIndex +
      direction;

    if (
      nextIndex < 0 ||
      nextIndex >=
        teeth.length
    ) {
      return;
    }

    setSelectedTooth(
      teeth[nextIndex].number
    );
  }

  /*
   * ==========================================================
   * SALVAR TODOS
   * ==========================================================
   */

  async function saveExam() {
    if (
      !examId ||
      !patientId
    ) {
      return;
    }

    if (isSavingExam) {
      return;
    }

    try {
      setIsSavingExam(true);
      setIsSaved(false);

      let allSuccess =
        true;

      for (const tooth of teeth) {
        const success =
          await persistTooth(
            tooth
          );

        if (!success) {
          allSuccess =
            false;
        }
      }

      setIsSaved(
        allSuccess
      );

      setIsOfflineDraft(
        !allSuccess
      );
    } catch (error) {
      console.error(
        "ERRO AO SALVAR EXAME PERIODONTAL:",
        error
      );

      setIsSaved(false);
      setIsOfflineDraft(true);
    } finally {
      setIsSavingExam(
        false
      );
    }
  }

  /*
   * ==========================================================
   * FINALIZAR
   * ==========================================================
   */

  async function handleFinalizeExam() {
    if (
      !examId ||
      !patientId
    ) {
      return;
    }

    try {
      await saveExam();

      await finalizeExam(
        examId
      );

      setIsSaved(true);
      setIsOfflineDraft(
        false
      );

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

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <div className="space-y-6">
      {/* ======================================================
          CABEÇALHO
      ====================================================== */}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>
                Odontograma periodontal
              </CardTitle>

              <p className="mt-1 text-sm text-text-secondary">
                Periodontograma com
                representação anatômica
                real da arcada.
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
                onClick={
                  saveExam
                }
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

      {/* ======================================================
          PERIODONTOGRAMA
      ====================================================== */}

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>
                Periodontograma
              </CardTitle>

              <p className="mt-1 text-xs text-text-secondary">
                A imagem anatômica
                permanece proporcional.
                As marcações são
                desenhadas sobre cada
                dente.
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

        <CardContent className="space-y-6 px-2 sm:px-4">
          {/* ==================================================
              SUPERIOR
          ================================================== */}

          <div>
            <div className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
              Arcada superior
            </div>

            <PeriodontalArcade
              teeth={teeth}
              upper
              surface={surface}
              selectedTooth={
                selectedTooth
              }
              onSelectTooth={
                setSelectedTooth
              }
            />
          </div>

          {/* ==================================================
              LINHA MÉDIA
          ================================================== */}

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />

            <span className="rounded-full border border-border bg-card px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-text-muted">
              Linha média
            </span>

            <div className="h-px flex-1 bg-border" />
          </div>

          {/* ==================================================
              INFERIOR
          ================================================== */}

          <div>
            <div className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
              Arcada inferior
            </div>

            <PeriodontalArcade
              teeth={teeth}
              upper={false}
              surface={surface}
              selectedTooth={
                selectedTooth
              }
              onSelectTooth={
                setSelectedTooth
              }
            />
          </div>

          {/* ==================================================
              LEGENDA
          ================================================== */}

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border pt-4 text-[9px] text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
              Profundidade de sondagem
            </span>

            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
              Margem gengival
            </span>

            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
              Sangramento
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

      {/* ======================================================
          DENTE SELECIONADO
      ====================================================== */}

      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={
              selected.number
            }
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
            {/* ==================================================
                CABEÇALHO DO DENTE
            ================================================== */}

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle>
                        Dente{" "}
                        {
                          selected.number
                        }
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
                        goToTooth(
                          -1
                        )
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
                          1
                      }
                      onClick={() =>
                        goToTooth(
                          1
                        )
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

            {/* ==================================================
                SONDAGEM
            ================================================== */}

            <Card>
              <CardHeader>
                <CardTitle>
                  Sondagem periodontal
                </CardTitle>

                <p className="mt-1 text-sm text-text-secondary">
                  Os valores são
                  representados
                  automaticamente no
                  periodontograma.
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
                          Margem gengival
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

            {/* ==================================================
                MARCADORES
            ================================================== */}

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
                        selected
                          .sites[
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

            {/* ==================================================
                MOBILIDADE / FURCA
            ================================================== */}

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
                      onChange={(
                        event
                      ) =>
                        updateMobility(
                          Number(
                            event
                              .target
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
                      onChange={(
                        value
                      ) =>
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
                      onChange={(
                        value
                      ) =>
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

            {/* ==================================================
                OBSERVAÇÕES
            ================================================== */}

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
                  onChange={(
                    event
                  ) =>
                    updateObservation(
                      event.target
                        .value
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
