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

/* =========================================================
   TIPOS
========================================================= */

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

/* =========================================================
   ARCADA
========================================================= */

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

/* =========================================================
   IMAGENS
========================================================= */

const IMAGES = {
  upperVestibular:
    "/superior-vestibular.png.png",

  upperLingual:
    "/superior-lingual.png.png",

  lowerVestibular:
    "/inferior-vestibular.png.png",

  lowerLingual:
    "/inferior-lingual.png.png",
};

/* =========================================================
   DADOS
========================================================= */

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

/* =========================================================
   NIC / CAL
========================================================= */

function calculateCAL(site: SiteData) {
  if (
    site.probingDepth === null ||
    site.gingivalRecession === null
  ) {
    return null;
  }

  return (
    site.probingDepth +
    site.gingivalRecession
  );
}

/* =========================================================
   POSIÇÃO DOS DENTES NA IMAGEM

   As imagens possuem 16 dentes em uma linha.

   x = centro horizontal do dente.

   Como as quatro imagens possuem a mesma largura,
   usamos uma matriz comum de posições horizontais.
========================================================= */

const TOOTH_X: Record<number, number> = {
  18: 5.0,
  17: 11.0,
  16: 17.0,
  15: 23.2,
  14: 29.3,
  13: 35.2,
  12: 41.1,
  11: 46.5,

  21: 53.5,
  22: 58.9,
  23: 64.8,
  24: 70.7,
  25: 76.8,
  26: 83.0,
  27: 89.0,
  28: 95.0,

  48: 5.0,
  47: 11.0,
  46: 17.0,
  45: 23.2,
  44: 29.3,
  43: 35.2,
  42: 41.1,
  41: 46.5,

  31: 53.5,
  32: 58.9,
  33: 64.8,
  34: 70.7,
  35: 76.8,
  36: 83.0,
  37: 89.0,
  38: 95.0,
};

/* =========================================================
   LARGURA DA ÁREA DE CADA DENTE
========================================================= */

const TOOTH_WIDTH: Record<number, number> = {
  18: 5.4,
  17: 5.5,
  16: 5.7,
  15: 5.4,
  14: 5.1,
  13: 5.0,
  12: 4.7,
  11: 4.8,

  21: 4.8,
  22: 4.7,
  23: 5.0,
  24: 5.1,
  25: 5.4,
  26: 5.7,
  27: 5.5,
  28: 5.4,

  48: 5.4,
  47: 5.5,
  46: 5.7,
  45: 5.4,
  44: 5.1,
  43: 5.0,
  42: 4.7,
  41: 4.8,

  31: 4.8,
  32: 4.7,
  33: 5.0,
  34: 5.1,
  35: 5.4,
  36: 5.7,
  37: 5.5,
  38: 5.4,
};

/* =========================================================
   MAPA DA ESCALA VERTICAL

   A escala sempre começa próxima da região cervical
   e desce em direção à raiz.

   0 mm = margem gengival de referência
   10 mm = região mais apical.
========================================================= */

const SCALE_TOP = 35;
const SCALE_BOTTOM = 94;

/* =========================================================
   PONTOS M/C/D

   A posição anatômica muda conforme o lado.

   18-11:
   o mesial está voltado para a linha média.

   21-28:
   o mesial também está voltado para a linha média,
   mas no lado oposto.

   Portanto M/C/D são espelhados.
========================================================= */

function getPointX(
  toothNumber: number,
  point: Point
) {
  const leftSide =
    toothNumber >= 18 &&
    toothNumber <= 11;

  const rightSide =
    toothNumber >= 21 &&
    toothNumber <= 28;

  /*
   * Para dentes do lado esquerdo da imagem:
   *
   *        D C M
   *
   * Para dentes do lado direito:
   *
   *        M C D
   */

  if (leftSide) {
    if (point === "MESIAL") return 78;
    if (point === "CENTRAL") return 50;
    return 22;
  }

  if (rightSide) {
    if (point === "MESIAL") return 22;
    if (point === "CENTRAL") return 50;
    return 78;
  }

  /*
   * Inferiores seguem a mesma lógica horizontal.
   */

  const lowerLeft =
    toothNumber >= 48 &&
    toothNumber <= 41;

  if (lowerLeft) {
    if (point === "MESIAL") return 78;
    if (point === "CENTRAL") return 50;
    return 22;
  }

  if (point === "MESIAL") return 22;
  if (point === "CENTRAL") return 50;

  return 78;
}

/* =========================================================
   LETRA
========================================================= */

function pointLetter(point: Point) {
  if (point === "MESIAL") return "M";
  if (point === "CENTRAL") return "C";
  return "D";
}

/* =========================================================
   POSIÇÃO VERTICAL DA ESCALA
========================================================= */

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.min(
    max,
    Math.max(min, value)
  );
}

/*
 * Converte milímetros para porcentagem vertical.
 *
 * 0 mm fica no SCALE_TOP.
 * 10 mm fica no SCALE_BOTTOM.
 */

function depthToPercent(
  depth: number
) {
  const safe = clamp(
    depth,
    0,
    SCALE_MAX
  );

  return (
    SCALE_TOP +
    (safe / SCALE_MAX) *
      (SCALE_BOTTOM - SCALE_TOP)
  );
}

/*
 * Margem gengival:
 *
 * positiva = sobe
 * negativa = desce
 *
 * Cada 1 mm representa uma pequena
 * distância vertical.
 */

function recessionToPercent(
  recession: number
) {
  const MILLIMETER_PX =
    (SCALE_BOTTOM - SCALE_TOP) /
    SCALE_MAX;

  /*
   * positivo sobe -> subtrai
   * negativo desce -> soma
   */

  return (
    SCALE_TOP -
    recession * MILLIMETER_PX
  );
}

/*
 * Profundidade de sondagem é medida
 * a partir da margem gengival.
 */

function probingFromMargin(
  recession: number | null,
  probing: number | null
) {
  if (probing === null) {
    return null;
  }

  const margin =
    recession ?? 0;

  const marginPosition =
    recessionToPercent(margin);

  const MILLIMETER_PX =
    (SCALE_BOTTOM - SCALE_TOP) /
    SCALE_MAX;

  return (
    marginPosition +
    probing * MILLIMETER_PX
  );
}

/* =========================================================
   SVG DO PERIODONTO SOBRE A IMAGEM
========================================================= */

function PeriodontalImageArch({
  image,
  teeth,
  selectedTooth,
  onSelectTooth,
  surface,
  flipY = false,
}: {
  image: string;
  teeth: Tooth[];
  selectedTooth: number | null;
  onSelectTooth: (
    number: number
  ) => void;
  surface: Surface;
  flipY?: boolean;
}) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-border bg-white"
    >
      {/* =================================================
          IMAGEM ANATÔMICA
      ================================================= */}

      <img
        src={image}
        alt="Arcada dentária"
        draggable={false}
        className={`block h-auto w-full select-none ${
          flipY
            ? "scale-y-[-1]"
            : ""
        }`}
      />

      {/* =================================================
          CAMADA SVG
      ================================================= */}

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        {teeth.map((tooth) => {
          const x =
            TOOTH_X[tooth.number];

          const width =
            TOOTH_WIDTH[tooth.number];

          if (
            x === undefined ||
            width === undefined
          ) {
            return null;
          }

          const sites =
            tooth.sites[surface];

          const isSelected =
            selectedTooth ===
            tooth.number;

          /*
           * Coordenadas horizontais
           */

          const mX =
            x +
            (getPointX(
              tooth.number,
              "MESIAL"
            ) -
              50) *
              (width / 100);

          const cX =
            x +
            (getPointX(
              tooth.number,
              "CENTRAL"
            ) -
              50) *
              (width / 100);

          const dX =
            x +
            (getPointX(
              tooth.number,
              "DISTAL"
            ) -
              50) *
              (width / 100);

          /*
           * Coordenadas da margem gengival.
           */

          const mRecession =
            sites.MESIAL
              .gingivalRecession ??
            0;

          const cRecession =
            sites.CENTRAL
              .gingivalRecession ??
            0;

          const dRecession =
            sites.DISTAL
              .gingivalRecession ??
            0;

          const mY =
            recessionToPercent(
              mRecession
            );

          const cY =
            recessionToPercent(
              cRecession
            );

          const dY =
            recessionToPercent(
              dRecession
            );

          /*
           * Profundidade de sondagem.
           */

          const mProbe =
            probingFromMargin(
              sites.MESIAL
                .gingivalRecession,
              sites.MESIAL
                .probingDepth
            );

          const cProbe =
            probingFromMargin(
              sites.CENTRAL
                .gingivalRecession,
              sites.CENTRAL
                .probingDepth
            );

          const dProbe =
            probingFromMargin(
              sites.DISTAL
                .gingivalRecession,
              sites.DISTAL
                .probingDepth
            );

          /*
           * Linha vermelha.
           */

          const redPoints = [
            `${mX},${mY}`,
            `${cX},${cY}`,
            `${dX},${dY}`,
          ].join(" ");

          /*
           * Linha azul:
           *
           * Ela liga os três pontos de sondagem.
           */

          const bluePoints =
            mProbe !== null &&
            cProbe !== null &&
            dProbe !== null
              ? [
                  `${mX},${mProbe}`,
                  `${cX},${cProbe}`,
                  `${dX},${dProbe}`,
                ].join(" ")
              : "";

          const hasAnyRecession =
            sites.MESIAL
              .gingivalRecession !== null ||
            sites.CENTRAL
              .gingivalRecession !== null ||
            sites.DISTAL
              .gingivalRecession !== null;

          const hasAnyProbing =
            sites.MESIAL
              .probingDepth !== null ||
            sites.CENTRAL
              .probingDepth !== null ||
            sites.DISTAL
              .probingDepth !== null;

          return (
            <g
              key={tooth.number}
            >
              {/* =================================================
                  ÁREA CLICÁVEL
              ================================================= */}

              <rect
                x={x - width / 2}
                y={8}
                width={width}
                height={88}
                rx={0.8}
                fill={
                  isSelected
                    ? "rgba(37,99,235,0.08)"
                    : "transparent"
                }
                stroke={
                  isSelected
                    ? "rgba(37,99,235,0.8)"
                    : "transparent"
                }
                strokeWidth="0.25"
                pointerEvents="auto"
                onClick={() =>
                  onSelectTooth(
                    tooth.number
                  )
                }
                className="cursor-pointer"
              />

              {/* =================================================
                  NÚMERO DO DENTE
              ================================================= */}

              <text
                x={x}
                y={7}
                textAnchor="middle"
                fontSize="2"
                fontWeight="700"
                fill={
                  isSelected
                    ? "#2563eb"
                    : "#111827"
                }
              >
                {tooth.number}
              </text>

              {/* =================================================
                  ESCALA PRETA
              ================================================= */}

              {Array.from({
                length:
                  SCALE_MAX + 1,
              }).map(
                (_, index) => {
                  const y =
                    SCALE_TOP +
                    (index /
                      SCALE_MAX) *
                      (SCALE_BOTTOM -
                        SCALE_TOP);

                  return (
                    <g
                      key={`${tooth.number}-scale-${index}`}
                    >
                      <line
                        x1={
                          x -
                          width / 2
                        }
                        y1={y}
                        x2={
                          x +
                          width / 2
                        }
                        y2={y}
                        stroke="#111111"
                        strokeWidth={
                          index === 0
                            ? "0.35"
                            : "0.18"
                        }
                        opacity={
                          index === 0
                            ? 0.95
                            : 0.55
                        }
                      />

                      <text
                        x={
                          x -
                          width / 2 -
                          0.6
                        }
                        y={y + 0.8}
                        textAnchor="end"
                        fontSize="1.5"
                        fontWeight="600"
                        fill="#111111"
                        opacity="0.8"
                      >
                        {index}
                      </text>
                    </g>
                  );
                }
              )}

              {/* =================================================
                  LETRAS M/C/D
              ================================================= */}

              <text
                x={mX}
                y={SCALE_TOP - 2}
                textAnchor="middle"
                fontSize="1.8"
                fontWeight="700"
                fill="#111111"
              >
                M
              </text>

              <text
                x={cX}
                y={SCALE_TOP - 2}
                textAnchor="middle"
                fontSize="1.8"
                fontWeight="700"
                fill="#111111"
              >
                C
              </text>

              <text
                x={dX}
                y={SCALE_TOP - 2}
                textAnchor="middle"
                fontSize="1.8"
                fontWeight="700"
                fill="#111111"
              >
                D
              </text>

              {/* =================================================
                  LINHA VERMELHA — MARGEM GENGIVAL
              ================================================= */}

              {hasAnyRecession && (
                <polyline
                  points={redPoints}
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="0.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* =================================================
                  PONTOS DA MARGEM GENGIVAL
              ================================================= */}

              {hasAnyRecession && (
                <>
                  <circle
                    cx={mX}
                    cy={mY}
                    r="0.85"
                    fill="#dc2626"
                  />

                  <circle
                    cx={cX}
                    cy={cY}
                    r="0.85"
                    fill="#dc2626"
                  />

                  <circle
                    cx={dX}
                    cy={dY}
                    r="0.85"
                    fill="#dc2626"
                  />
                </>
              )}

              {/* =================================================
                  VALORES DA MARGEM
              ================================================= */}

              {sites.MESIAL
                .gingivalRecession !==
                null && (
                <text
                  x={mX}
                  y={mY - 1.3}
                  textAnchor="middle"
                  fontSize="1.6"
                  fontWeight="700"
                  fill="#dc2626"
                >
                  {
                    sites.MESIAL
                      .gingivalRecession
                  }
                </text>
              )}

              {sites.CENTRAL
                .gingivalRecession !==
                null && (
                <text
                  x={cX}
                  y={cY - 1.3}
                  textAnchor="middle"
                  fontSize="1.6"
                  fontWeight="700"
                  fill="#dc2626"
                >
                  {
                    sites.CENTRAL
                      .gingivalRecession
                  }
                </text>
              )}

              {sites.DISTAL
                .gingivalRecession !==
                null && (
                <text
                  x={dX}
                  y={dY - 1.3}
                  textAnchor="middle"
                  fontSize="1.6"
                  fontWeight="700"
                  fill="#dc2626"
                >
                  {
                    sites.DISTAL
                      .gingivalRecession
                  }
                </text>
              )}

              {/* =================================================
                  LINHA AZUL — PROFUNDIDADE
              ================================================= */}

              {hasAnyProbing &&
                bluePoints && (
                  <polyline
                    points={
                      bluePoints
                    }
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="0.55"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

              {/* =================================================
                  PONTOS AZUIS
              ================================================= */}

              {mProbe !== null && (
                <circle
                  cx={mX}
                  cy={mProbe}
                  r="0.95"
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="0.3"
                />
              )}

              {cProbe !== null && (
                <circle
                  cx={cX}
                  cy={cProbe}
                  r="0.95"
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="0.3"
                />
              )}

              {dProbe !== null && (
                <circle
                  cx={dX}
                  cy={dProbe}
                  r="0.95"
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="0.3"
                />
              )}

              {/* =================================================
                  VALORES DA SONDAGEM
              ================================================= */}

              {sites.MESIAL
                .probingDepth !==
                null && (
                <text
                  x={mX}
                  y={
                    (mProbe ??
                      SCALE_TOP) +
                    3
                  }
                  textAnchor="middle"
                  fontSize="1.8"
                  fontWeight="700"
                  fill={
                    sites.MESIAL
                      .bleeding
                      ? "#dc2626"
                      : "#2563eb"
                  }
                >
                  {
                    sites.MESIAL
                      .probingDepth
                  }
                </text>
              )}

              {sites.CENTRAL
                .probingDepth !==
                null && (
                <text
                  x={cX}
                  y={
                    (cProbe ??
                      SCALE_TOP) +
                    3
                  }
                  textAnchor="middle"
                  fontSize="1.8"
                  fontWeight="700"
                  fill={
                    sites.CENTRAL
                      .bleeding
                      ? "#dc2626"
                      : "#2563eb"
                  }
                >
                  {
                    sites.CENTRAL
                      .probingDepth
                  }
                </text>
              )}

              {sites.DISTAL
                .probingDepth !==
                null && (
                <text
                  x={dX}
                  y={
                    (dProbe ??
                      SCALE_TOP) +
                    3
                  }
                  textAnchor="middle"
                  fontSize="1.8"
                  fontWeight="700"
                  fill={
                    sites.DISTAL
                      .bleeding
                      ? "#dc2626"
                      : "#2563eb"
                  }
                >
                  {
                    sites.DISTAL
                      .probingDepth
                  }
                </text>
              )}

              {/* =================================================
                  SANGRAMENTO
              ================================================= */}

              {sites.MESIAL
                .bleeding && (
                <circle
                  cx={mX}
                  cy={mProbe ?? mY}
                  r="1.45"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="0.55"
                />
              )}

              {sites.CENTRAL
                .bleeding && (
                <circle
                  cx={cX}
                  cy={cProbe ?? cY}
                  r="1.45"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="0.55"
                />
              )}

              {sites.DISTAL
                .bleeding && (
                <circle
                  cx={dX}
                  cy={dProbe ?? dY}
                  r="1.45"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="0.55"
                />
              )}

              {/* =================================================
                  DENTE AUSENTE
              ================================================= */}

              {tooth.status ===
                "AUSENTE" && (
                <>
                  <line
                    x1={
                      x -
                      width * 0.4
                    }
                    y1={30}
                    x2={
                      x +
                      width * 0.4
                    }
                    y2={80}
                    stroke="#dc2626"
                    strokeWidth="1"
                  />

                  <line
                    x1={
                      x +
                      width * 0.4
                    }
                    y1={30}
                    x2={
                      x -
                      width * 0.4
                    }
                    y2={80}
                    stroke="#dc2626"
                    strokeWidth="1"
                  />
                </>
              )}

              {/* =================================================
                  IMPLANTE
              ================================================= */}

              {tooth.status ===
                "IMPLANTE" && (
                <g>
                  <rect
                    x={
                      x -
                      width *
                        0.22
                    }
                    y={48}
                    width={
                      width *
                      0.44
                    }
                    height={32}
                    rx="1"
                    fill="rgba(37,99,235,0.08)"
                    stroke="#2563eb"
                    strokeWidth="0.7"
                  />

                  {Array.from({
                    length: 6,
                  }).map(
                    (_, index) => (
                      <line
                        key={
                          index
                        }
                        x1={
                          x -
                          width *
                            0.2
                        }
                        x2={
                          x +
                          width *
                            0.2
                        }
                        y1={
                          53 +
                          index *
                            4.5
                        }
                        y2={
                          53 +
                          index *
                            4.5
                        }
                        stroke="#2563eb"
                        strokeWidth="0.55"
                      />
                    )
                  )}
                </g>
              )}

              {/* =================================================
                  FURCA
              ================================================= */}

              {(tooth.buccalFurcation !==
                null ||
                tooth.lingualFurcation !==
                  null) && (
                <text
                  x={x}
                  y={88}
                  textAnchor="middle"
                  fontSize="2"
                  fontWeight="700"
                  fill="#7c3aed"
                >
                  F
                </text>
              )}
            </g>
          );
        })}
      </svg>
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
  min = -20,
  max = 20,
}: {
  value: number | null;
  onChange: (
    value: number | null
  ) => void;
  placeholder?: string;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      min={min}
      max={max}
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

        if (
          !Number.isNaN(number)
        ) {
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
    [teeth, selectedTooth]
  );

  const selectedIndex =
    useMemo(
      () =>
        teeth.findIndex(
          (tooth) =>
            tooth.number ===
            selectedTooth
        ),
      [teeth, selectedTooth]
    );

  /* =======================================================
     RASCUNHO
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
        const parsed =
          JSON.parse(raw);

        if (
          Array.isArray(
            parsed?.teeth
          ) &&
          parsed.teeth.length > 0
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

  /* =======================================================
     ATUALIZAÇÃO LOCAL
  ======================================================= */

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

    setTeeth((current) =>
      current.map((tooth) =>
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
        observations: value,
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

  /* =======================================================
     SALVAR DENTE
  ======================================================= */

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
            calculateCAL(
              site
            );

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
      ...createTeeth(
        upperTeeth
      ),
      ...createTeeth(
        lowerTeeth
      ),
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

  /* =======================================================
     SALVAR TODOS
  ======================================================= */

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

      let allSuccess = true;

      for (const tooth of teeth) {
        const success =
          await persistTooth(
            tooth
          );

        if (!success) {
          allSuccess = false;
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
      setIsOfflineDraft(
        true
      );
    } finally {
      setIsSavingExam(false);
    }
  }

  /* =======================================================
     FINALIZAR
  ======================================================= */

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
                Avaliação periodontal
                sobre a anatomia real
                da arcada.
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
                Preto = escala milimetrada.
                Vermelho = margem gengival.
                Azul = profundidade de
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

        <CardContent className="space-y-5 px-2 sm:px-4">
          {/* =================================================
              SUPERIOR
          ================================================= */}

          <div>
            <div className="mb-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
              Arcada superior
            </div>

            <PeriodontalImageArch
              image={
                surface ===
                "VESTIBULAR"
                  ? IMAGES.upperVestibular
                  : IMAGES.upperLingual
              }
              teeth={teeth.filter(
                (tooth) =>
                  upperTeeth.includes(
                    tooth.number
                  )
              )}
              selectedTooth={
                selectedTooth
              }
              onSelectTooth={
                setSelectedTooth
              }
              surface={
                surface
              }
              flipY={
                surface ===
                "VESTIBULAR"
              }
            />
          </div>

          {/* =================================================
              LINHA MÉDIA
          ================================================= */}

          <div className="relative flex items-center">
            <div className="h-px flex-1 bg-border" />

            <span className="mx-3 rounded-full border border-border bg-card px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-text-muted">
              Linha média
            </span>

            <div className="h-px flex-1 bg-border" />
          </div>

          {/* =================================================
              INFERIOR
          ================================================= */}

          <div>
            <PeriodontalImageArch
              image={
                surface ===
                "VESTIBULAR"
                  ? IMAGES.lowerVestibular
                  : IMAGES.lowerLingual
              }
              teeth={teeth.filter(
                (tooth) =>
                  lowerTeeth.includes(
                    tooth.number
                  )
              )}
              selectedTooth={
                selectedTooth
              }
              onSelectTooth={
                setSelectedTooth
              }
              surface={
                surface
              }
              flipY={
                surface ===
                "LINGUAL"
              }
            />

            <div className="mt-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
              Arcada inferior
            </div>
          </div>

          {/* =================================================
              LEGENDA
          ================================================= */}

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border pt-4 text-[10px] text-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 border border-black bg-white" />
              Escala mm
            </span>

            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-5 bg-red-600" />
              Margem gengival
            </span>

            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-5 bg-blue-600" />
              Sondagem
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
            {/* =================================================
                CABEÇALHO DO DENTE
            ================================================= */}

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

            {/* =================================================
                SONDAGEM
            ================================================= */}

            <Card>
              <CardHeader>
                <CardTitle>
                  Sondagem periodontal
                </CardTitle>

                <p className="mt-1 text-sm text-text-secondary">
                  Informe a margem gengival
                  e a profundidade de
                  sondagem de cada sítio.
                  Valores positivos e
                  negativos de margem são
                  aceitos.
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
                              key={
                                point
                              }
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
                      {/* PROFUNDIDADE */}

                      <tr className="border-b border-border/50">
                        <td className="px-3 py-3 text-sm font-medium">
                          Profundidade
                        </td>

                        {points.map(
                          (point) => (
                            <td
                              key={
                                point
                              }
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
                                min={
                                  0
                                }
                                max={
                                  20
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

                      {/* MARGEM */}

                      <tr className="border-b border-border/50">
                        <td className="px-3 py-3 text-sm font-medium">
                          Margem gengival
                        </td>

                        {points.map(
                          (point) => (
                            <td
                              key={
                                point
                              }
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
                                min={
                                  -20
                                }
                                max={
                                  20
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

                      {/* NIC */}

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
                              ][
                                point
                              ];

                            const cal =
                              calculateCAL(
                                site
                              );

                            return (
                              <td
                                key={
                                  point
                                }
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

            {/* =================================================
                MARCADORES
            ================================================= */}

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
                          key={
                            point
                          }
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

            {/* =================================================
                MOBILIDADE E FURCA
            ================================================= */}

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
                      min={0}
                      max={10}
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
                      min={0}
                      max={10}
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

            {/* =================================================
                OBSERVAÇÕES
            ================================================= */}

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
