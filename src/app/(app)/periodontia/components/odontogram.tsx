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

/* =========================================================
   CRIA SITE VAZIO
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

/* =========================================================
   CRIA SITES
========================================================= */

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

/* =========================================================
   CRIA DENTES
========================================================= */

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
   CAL / NIC
========================================================= */

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
   POSIÇÃO HORIZONTAL DOS DENTES

   As posições são percentuais da imagem.
========================================================= */

const TOOTH_POSITIONS: Record<number, number> = {
  18: 3.2,
  17: 9.0,
  16: 15.0,
  15: 21.0,
  14: 27.0,
  13: 33.0,
  12: 39.0,
  11: 45.0,

  21: 55.0,
  22: 61.0,
  23: 67.0,
  24: 73.0,
  25: 79.0,
  26: 85.0,
  27: 91.0,
  28: 96.8,

  48: 3.2,
  47: 9.0,
  46: 15.0,
  45: 21.0,
  44: 27.0,
  43: 33.0,
  42: 39.0,
  41: 45.0,

  31: 55.0,
  32: 61.0,
  33: 67.0,
  34: 73.0,
  35: 79.0,
  36: 85.0,
  37: 91.0,
  38: 96.8,
};

function getToothPosition(number: number) {
  return TOOTH_POSITIONS[number] ?? 50;
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
      min={-20}
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
   PERIODONTOGRAMA

   Aqui está a parte visual principal.

   IMPORTANTE:

   A imagem e o SVG são independentes.

   A imagem lingual é invertida somente visualmente.

   O gráfico NÃO é invertido.

   Assim os valores continuam matematicamente
   orientados corretamente.
========================================================= */

function PeriodontalArch({
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
  const imageSrc =
    upper
      ? surface === "VESTIBULAR"
        ? "/superior-vestibular.png.png"
        : "/superior-lingual.png.png"
      : surface === "VESTIBULAR"
        ? "/inferior-vestibular.png.png"
        : "/inferior-lingual.png.png";

  /*
   * Pelas imagens que você descreveu:
   *
   * Superior vestibular:
   * oclusal para baixo.
   *
   * Superior lingual:
   * oclusal para cima -> precisa inverter.
   *
   * Inferior vestibular:
   * oclusal para cima.
   *
   * Inferior lingual:
   * oclusal para baixo -> precisa inverter.
   */
  const rotateImage = surface === "LINGUAL";

  const orderedTeeth = upper
    ? teeth.filter((tooth) =>
        upperTeeth.includes(tooth.number)
      )
    : teeth.filter((tooth) =>
        lowerTeeth.includes(tooth.number)
      );

  /*
   * LINHA BASE
   *
   * Superior:
   * linha fica abaixo da região cervical.
   *
   * Inferior:
   * linha fica acima da região cervical.
   */
  const periodontalLineY = upper ? 63 : 37;

  /*
   * Altura máxima usada para os 10 mm.
   *
   * Mantemos relativamente curta para evitar
   * aquelas linhas enormes que estavam acontecendo.
   */
  const chartHeight = 20;

  /*
   * Para o gráfico:
   *
   * Superior:
   * raiz está para cima.
   *
   * Inferior:
   * raiz está para baixo.
   */
  function rootDirectionY(
    millimeters: number
  ) {
    const safe = Math.max(
      0,
      Math.min(SCALE_MAX, millimeters)
    );

    const distance =
      (safe / SCALE_MAX) *
      chartHeight;

    if (upper) {
      return periodontalLineY - distance;
    }

    return periodontalLineY + distance;
  }

  /*
   * Margem gengival:
   *
   * positivo = direção da raiz
   * negativo = direção da oclusal
   */
  function recessionY(
    value: number
  ) {
    const safe = Math.max(
      -10,
      Math.min(10, value)
    );

    const distance =
      (Math.abs(safe) / SCALE_MAX) *
      chartHeight;

    if (safe === 0) {
      return periodontalLineY;
    }

    if (safe > 0) {
      return upper
        ? periodontalLineY - distance
        : periodontalLineY + distance;
    }

    return upper
      ? periodontalLineY + distance
      : periodontalLineY - distance;
  }

  /*
   * Posição M/C/D.
   *
   * Pequena distância para que os três pontos
   * fiquem dentro do dente.
   */
  const pointOffsets = {
    MESIAL: -1.45,
    CENTRAL: 0,
    DISTAL: 1.45,
  };

  /*
   * Altura dos textos M/C/D.
   */
  const pointLabelY = upper
    ? periodontalLineY + 4.2
    : periodontalLineY - 4.2;

  /*
   * Área clicável do dente.
   */
  const toothWidth = 5.55;

  return (
    <div className="relative w-full overflow-hidden rounded-md bg-white">
      {/* =================================================
          IMAGEM DA ARCADA
      ================================================= */}

      <img
        src={imageSrc}
        alt={
          upper
            ? `Arcada superior ${surface.toLowerCase()}`
            : `Arcada inferior ${surface.toLowerCase()}`
        }
        className={`block h-auto w-full select-none ${
          rotateImage
            ? "rotate-180"
            : ""
        }`}
        draggable={false}
      />

      {/* =================================================
          CAMADA GRÁFICA
      ================================================= */}

      <svg
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* =================================================
            LINHA PRETA PRINCIPAL

            UMA ÚNICA LINHA DE CANTO A CANTO
        ================================================= */}

        <line
          x1="0"
          y1={periodontalLineY}
          x2="100"
          y2={periodontalLineY}
          stroke="#000000"
          strokeWidth="0.35"
          vectorEffect="non-scaling-stroke"
        />

        {/* =================================================
            ESCALA 0–10

            A escala acompanha a linha.
        ================================================= */}

        {Array.from({
          length: SCALE_MAX + 1,
        }).map((_, index) => {
          const y = rootDirectionY(index);

          return (
            <g key={`scale-${index}`}>
              <line
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke={
                  index === 0
                    ? "#000000"
                    : "rgba(0,0,0,0.20)"
                }
                strokeWidth={
                  index === 0
                    ? "0.25"
                    : "0.12"
                }
                vectorEffect="non-scaling-stroke"
              />

              <text
                x="0.7"
                y={y}
                fill="#000000"
                fontSize="2.1"
                fontWeight="700"
                dominantBaseline="middle"
              >
                {index}
              </text>
            </g>
          );
        })}

        {/* =================================================
            DADOS DOS DENTES
        ================================================= */}

        {orderedTeeth.map((tooth) => {
          const center =
            getToothPosition(
              tooth.number
            );

          const site =
            tooth.sites[surface];

          /*
           * ==============================
           * PONTOS DA MARGEM GENGIVAL
           * ==============================
           */

          const redPoints =
            points.map((point) => {
              const value =
                site[point]
                  .gingivalRecession;

              return {
                x:
                  center +
                  pointOffsets[point],

                y:
                  value === null
                    ? periodontalLineY
                    : recessionY(
                        value
                      ),
              };
            });

          /*
           * ==============================
           * PONTOS DA PROFUNDIDADE
           * ==============================
           */

          const bluePoints =
            points.map((point) => {
              const value =
                site[point]
                  .probingDepth;

              return {
                x:
                  center +
                  pointOffsets[point],

                y:
                  value === null
                    ? periodontalLineY
                    : rootDirectionY(
                        value
                      ),
              };
            });

          /*
           * Só desenha a linha vermelha
           * se pelo menos um ponto tiver valor.
           */

          const hasRedData =
            points.some(
              (point) =>
                site[point]
                  .gingivalRecession !==
                null
            );

          /*
           * Só desenha a linha azul
           * se pelo menos um ponto tiver valor.
           */

          const hasBlueData =
            points.some(
              (point) =>
                site[point]
                  .probingDepth !== null
            );

          const redPolyline =
            redPoints
              .map(
                (point) =>
                  `${point.x},${point.y}`
              )
              .join(" ");

          const bluePolyline =
            bluePoints
              .map(
                (point) =>
                  `${point.x},${point.y}`
              )
              .join(" ");

          return (
            <g
              key={`chart-${tooth.number}`}
            >
              {/* =================================================
                  LINHA VERMELHA
              ================================================= */}

              {hasRedData && (
                <>
                  <polyline
                    points={redPolyline}
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="0.42"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />

                  {redPoints.map(
                    (point, index) => {
                      const hasValue =
                        site[
                          points[index]
                        ]
                          .gingivalRecession !==
                        null;

                      if (!hasValue) {
                        return null;
                      }

                      return (
                        <circle
                          key={`red-point-${tooth.number}-${index}`}
                          cx={point.x}
                          cy={point.y}
                          r="0.65"
                          fill="#dc2626"
                          stroke="#ffffff"
                          strokeWidth="0.15"
                          vectorEffect="non-scaling-stroke"
                        />
                      );
                    }
                  )}
                </>
              )}

              {/* =================================================
                  LINHA AZUL
              ================================================= */}

              {hasBlueData && (
                <>
                  <polyline
                    points={bluePolyline}
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="0.42"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />

                  {bluePoints.map(
                    (point, index) => {
                      const hasValue =
                        site[
                          points[index]
                        ]
                          .probingDepth !==
                        null;

                      if (!hasValue) {
                        return null;
                      }

                      return (
                        <circle
                          key={`blue-point-${tooth.number}-${index}`}
                          cx={point.x}
                          cy={point.y}
                          r="0.65"
                          fill="#2563eb"
                          stroke="#ffffff"
                          strokeWidth="0.15"
                          vectorEffect="non-scaling-stroke"
                        />
                      );
                    }
                  )}
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* =================================================
          CAMADA HTML DOS DENTES

          Aqui ficam:
          - números
          - M/C/D
          - seleção
          - ausência
          - sangramento
      ================================================= */}

      <div className="pointer-events-none absolute inset-0 z-30">
        {orderedTeeth.map((tooth) => {
          const center =
            getToothPosition(
              tooth.number
            );

          const site =
            tooth.sites[surface];

          const toothHasBleeding =
            Object.values(site).some(
              (item) =>
                item.bleeding
            );

          return (
            <div
              key={`overlay-${tooth.number}`}
              className="absolute inset-y-0"
              style={{
                left: `${center - toothWidth / 2}%`,
                width: `${toothWidth}%`,
              }}
            >
              {/* =================================================
                  NÚMERO DO DENTE
              ================================================= */}

              <span
                className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-white/90 px-1 text-[9px] font-bold leading-none shadow-sm ${
                  selectedTooth ===
                  tooth.number
                    ? "text-primary"
                    : "text-black"
                }`}
                style={{
                  top: upper
                    ? "2%"
                    : "auto",
                  bottom: upper
                    ? "auto"
                    : "2%",
                }}
              >
                {tooth.number}
              </span>

              {/* =================================================
                  M / C / D
              ================================================= */}

              {points.map(
                (point) => {
                  const offset =
                    pointOffsets[
                      point
                    ];

                  const x =
                    50 +
                    (offset /
                      toothWidth) *
                      100;

                  const short =
                    point ===
                    "MESIAL"
                      ? "M"
                      : point ===
                          "CENTRAL"
                        ? "C"
                        : "D";

                  const siteData =
                    site[point];

                  return (
                    <div
                      key={`${tooth.number}-${point}`}
                      className="absolute -translate-x-1/2"
                      style={{
                        left: `${x}%`,
                        top:
                          `${pointLabelY}%`,
                      }}
                    >
                      <div className="flex flex-col items-center gap-[1px]">
                        <span className="text-[7px] font-bold leading-none text-black">
                          {short}
                        </span>

                        {siteData
                          .probingDepth !==
                          null && (
                          <span
                            className={`text-[7px] font-bold leading-none ${
                              siteData.bleeding
                                ? "text-red-600"
                                : "text-blue-700"
                            }`}
                          >
                            {
                              siteData.probingDepth
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }
              )}

              {/* =================================================
                  SANGRAMENTO
              ================================================= */}

              {toothHasBleeding && (
                <span
                  className="absolute left-1/2 h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-red-600"
                  style={{
                    top: upper
                      ? "7%"
                      : "90%",
                  }}
                />
              )}

              {/* =================================================
                  ÁREA CLICÁVEL DO DENTE
              ================================================= */}

              <button
                type="button"
                aria-label={`Selecionar dente ${tooth.number}`}
                onClick={() =>
                  onSelectTooth(
                    tooth.number
                  )
                }
                className={`pointer-events-auto absolute inset-x-0 z-50 h-[78%] rounded-md border-2 transition ${
                  selectedTooth ===
                  tooth.number
                    ? "border-primary bg-primary/10 shadow-[0_0_0_2px_rgba(255,255,255,0.8)]"
                    : "border-transparent hover:border-primary/60"
                }`}
                style={{
                  top: "11%",
                }}
              >
                {/* =================================================
                    DENTE AUSENTE
                ================================================= */}

                {tooth.status ===
                  "AUSENTE" && (
                  <>
                    <div className="absolute left-1/2 top-1/2 h-[65%] w-[3px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded bg-red-600" />

                    <div className="absolute left-1/2 top-1/2 h-[65%] w-[3px] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded bg-red-600" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
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

  const selectedIndex = useMemo(
    () =>
      teeth.findIndex(
        (tooth) =>
          tooth.number ===
          selectedTooth
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
      selectedTooth ===
      null
    ) {
      return;
    }

    saveVersionRef.current +=
      1;

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
    setIsOfflineDraft(
      true
    );
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
        [
          type ===
          "buccal"
            ? "buccalFurcation"
            : "lingualFurcation"
        ]: value,
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
      setIsSavingExam(
        true
      );

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

      for (
        const currentSurface of [
          "VESTIBULAR",
          "LINGUAL",
        ] as Surface[]
      ) {
        for (
          const point of points
        ) {
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

    if (
      saveTimerRef.current
    ) {
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
      teeth[nextIndex]
        .number
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

      for (
        const tooth of teeth
      ) {
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
      setIsSavingExam(
        false
      );
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
      {/* =================================================
          CABEÇALHO
      ================================================= */}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>
                Odontograma periodontal
              </CardTitle>

              <p className="mt-1 text-sm text-text-secondary">
                Periodontograma sobre
                a anatomia real da
                arcada dentária.
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

      {/* =================================================
          PERIODOGRAMA
      ================================================= */}

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>
                Periodontograma
              </CardTitle>

              <p className="mt-1 text-xs text-text-secondary">
                Linha preta =
                referência.
                Vermelho =
                margem gengival.
                Azul =
                profundidade de
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

        <CardContent className="space-y-6 px-2 sm:px-4">
          {/* =============================================
              ARCADA SUPERIOR
          ============================================= */}

          <div>
            <div className="mb-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
              Arcada superior
            </div>

            <PeriodontalArch
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

          {/* =============================================
              LINHA MÉDIA
          ============================================= */}

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />

            <span className="rounded-full border border-border bg-card px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-text-muted">
              Linha média
            </span>

            <div className="h-px flex-1 bg-border" />
          </div>

          {/* =============================================
              ARCADA INFERIOR
          ============================================= */}

          <div>
            <PeriodontalArch
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

            <div className="mt-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
              Arcada inferior
            </div>
          </div>

          {/* =============================================
              LEGENDA
          ============================================= */}

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border pt-4 text-[10px] text-text-muted">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-8 rounded-full bg-black" />
              Referência / escala
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2.5 w-8 rounded-full bg-red-600" />
              Margem gengival
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2.5 w-8 rounded-full bg-blue-600" />
              Profundidade
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

      {/* =================================================
          DENTE SELECIONADO
      ================================================= */}

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
            {/* ===========================================
                CABEÇALHO DO DENTE
            =========================================== */}

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

            {/* ===========================================
                SONDAGEM
            =========================================== */}

            <Card>
              <CardHeader>
                <CardTitle>
                  Sondagem periodontal
                </CardTitle>

                <p className="mt-1 text-sm text-text-secondary">
                  Os valores são
                  automaticamente
                  representados no
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

            {/* ===========================================
                MARCADORES
            =========================================== */}

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

            {/* ===========================================
                MOBILIDADE E FURCA
            =========================================== */}

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

            {/* ===========================================
                OBSERVAÇÕES
            =========================================== */}

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
