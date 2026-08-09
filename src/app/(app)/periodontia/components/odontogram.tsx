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

/* ============================================================
   FORMATO / ANATOMIA DO DENTE
   ============================================================ */

function getToothKind(number: number) {
  const n = number % 10;

  if (n === 1 || n === 2) {
    return "incisor";
  }

  if (n === 3) {
    return "canine";
  }

  if (n === 4 || n === 5) {
    return "premolar";
  }

  return "molar";
}

/* ============================================================
   DESENHO 2D DO DENTE
   ============================================================ */

function ToothSvg({
  tooth,
  selected,
  onClick,
  lower = false,
}: {
  tooth: Tooth;
  selected: boolean;
  onClick: () => void;
  lower?: boolean;
}) {
  const kind = getToothKind(tooth.number);

  const hasBleeding = Object.values(tooth.sites).some(
    (surface) =>
      Object.values(surface).some(
        (site) => site.bleeding
      )
  );

  const hasPlaque = Object.values(tooth.sites).some(
    (surface) =>
      Object.values(surface).some(
        (site) => site.plaque
      )
  );

  const hasSuppuration = Object.values(tooth.sites).some(
    (surface) =>
      Object.values(surface).some(
        (site) => site.suppuration
      )
  );

  const vestibular =
    tooth.sites.VESTIBULAR;

  const getDepth = (point: Point) =>
    vestibular[point].probingDepth;

  const depthValues = points.map(getDepth);

  const maxDepth =
    Math.max(
      0,
      ...depthValues.filter(
        (value): value is number =>
          typeof value === "number"
      )
    );

  const toothWidth =
    kind === "molar"
      ? 48
      : kind === "premolar"
        ? 40
        : kind === "canine"
          ? 34
          : 30;

  const crownHeight =
    kind === "molar"
      ? 42
      : kind === "premolar"
        ? 44
        : 46;

  const rootHeight =
    kind === "molar"
      ? 50
      : kind === "premolar"
        ? 58
        : 64;

  const rootY =
    lower
      ? crownHeight
      : 2;

  const rootDirection =
    lower ? 1 : -1;

  const crownY =
    lower
      ? 58
      : 70;

  const rootStart =
    lower
      ? 94
      : 68;

  const rootEnd =
    lower
      ? 142
      : 8;

  const pathCrown =
    kind === "molar"
      ? "M12 12 Q24 3 36 12 L39 34 Q38 45 24 48 Q10 45 9 34 Z"
      : kind === "premolar"
        ? "M12 10 Q20 2 28 10 L31 35 Q30 44 20 47 Q10 44 9 35 Z"
        : kind === "canine"
          ? "M10 10 Q17 2 24 10 L27 35 Q26 45 17 48 Q8 45 7 35 Z"
          : "M9 10 Q16 3 23 10 L26 38 Q25 47 16 49 Q7 47 6 38 Z";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="group relative flex w-[78px] shrink-0 flex-col items-center outline-none"
    >
      <span
        className={`mb-1 text-[10px] font-semibold ${
          selected
            ? "text-primary"
            : "text-text-muted"
        }`}
      >
        {tooth.number}
      </span>

      <svg
        width="70"
        height="160"
        viewBox="0 0 48 150"
        className="overflow-visible"
        aria-label={`Dente ${tooth.number}`}
      >
        {/* ====================================================
            RAIZ
        ==================================================== */}

        {tooth.status === "PRESENTE" && (
          <>
            {kind === "molar" ? (
              <>
                <path
                  d={
                    lower
                      ? "M13 82 C10 94 7 108 8 126 C9 136 14 140 18 132 L22 108 C23 98 21 90 20 82"
                      : "M13 68 C10 56 7 42 8 24 C9 14 14 10 18 18 L22 42 C23 52 21 60 20 68"
                  }
                  fill="white"
                  stroke={
                    selected
                      ? "var(--primary)"
                      : "currentColor"
                  }
                  strokeWidth="1.3"
                  className="text-text-muted"
                />

                <path
                  d={
                    lower
                      ? "M25 82 C27 92 31 108 31 126 C31 137 26 141 22 132 L21 108 C21 97 23 90 25 82"
                      : "M25 68 C27 57 31 42 31 24 C31 14 26 10 22 18 L21 42 C21 52 23 60 25 68"
                  }
                  fill="white"
                  stroke={
                    selected
                      ? "var(--primary)"
                      : "currentColor"
                  }
                  strokeWidth="1.3"
                  className="text-text-muted"
                />
              </>
            ) : (
              <path
                d={
                  lower
                    ? `M${24 - toothWidth / 8} 82
                       C${20 - toothWidth / 8} 96
                       ${20 - toothWidth / 8} 116
                       24 140
                       C28 116
                       ${28 + toothWidth / 8} 96
                       ${24 + toothWidth / 8} 82 Z`
                    : `M${24 - toothWidth / 8} 68
                       C${20 - toothWidth / 8} 54
                       ${20 - toothWidth / 8} 34
                       24 8
                       C28 34
                       ${28 + toothWidth / 8} 54
                       ${24 + toothWidth / 8} 68 Z`
                }
                fill="white"
                stroke={
                  selected
                    ? "var(--primary)"
                    : "currentColor"
                }
                strokeWidth="1.3"
                className="text-text-muted"
              />
            )}

            {/* =================================================
                COROA
            ================================================= */}

            <g
              transform={
                lower
                  ? "translate(0 42)"
                  : "translate(0 0)"
              }
            >
              <path
                d={pathCrown}
                fill={
                  selected
                    ? "color-mix(in srgb, var(--primary) 8%, white)"
                    : "white"
                }
                stroke={
                  selected
                    ? "var(--primary)"
                    : "currentColor"
                }
                strokeWidth="1.5"
                className="text-text-muted"
              />

              {/* anatomia oclusal / incisiva */}

              {kind === "molar" && (
                <>
                  <path
                    d="M15 19 Q24 27 33 19"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-text-muted/60"
                  />
                  <path
                    d="M13 30 Q24 23 35 30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-text-muted/60"
                  />
                </>
              )}

              {kind === "premolar" && (
                <path
                  d="M14 25 Q20 20 26 25 Q20 31 14 25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-text-muted/60"
                />
              )}

              {kind === "canine" && (
                <path
                  d="M17 11 L17 39"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-text-muted/50"
                />
              )}

              {kind === "incisor" && (
                <path
                  d="M16 12 L16 40"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  className="text-text-muted/40"
                />
              )}
            </g>
          </>
        )}

        {/* ====================================================
            AUSENTE
        ==================================================== */}

        {tooth.status === "AUSENTE" && (
          <>
            <path
              d="M7 70 L41 70"
              stroke="var(--error)"
              strokeWidth="3"
            />

            <path
              d="M10 55 L38 85"
              stroke="var(--error)"
              strokeWidth="3"
            />

            <path
              d="M38 55 L10 85"
              stroke="var(--error)"
              strokeWidth="3"
            />
          </>
        )}

        {/* ====================================================
            IMPLANTE
        ==================================================== */}

        {tooth.status === "IMPLANTE" && (
          <>
            <path
              d="M12 48 Q24 38 36 48 L34 70 Q24 78 14 70 Z"
              fill="white"
              stroke="var(--secondary)"
              strokeWidth="1.5"
            />

            <path
              d="M18 70 L16 122 L32 122 L30 70"
              fill="white"
              stroke="var(--secondary)"
              strokeWidth="1.5"
            />

            <path
              d="M16 78 L32 84 M16 88 L32 94 M16 98 L32 104 M16 108 L32 114"
              stroke="var(--secondary)"
              strokeWidth="1.5"
            />
          </>
        )}

        {/* ====================================================
            INDICADORES
        ==================================================== */}

        {hasBleeding && (
          <circle
            cx="40"
            cy={lower ? "135" : "15"}
            r="3"
            fill="var(--error)"
          />
        )}

        {hasPlaque && (
          <circle
            cx="8"
            cy={lower ? "135" : "15"}
            r="2.5"
            fill="var(--primary)"
          />
        )}

        {hasSuppuration && (
          <circle
            cx="40"
            cy={lower ? "125" : "25"}
            r="2.5"
            fill="var(--secondary)"
          />
        )}
      </svg>

      {/* ======================================================
          MINI LEITURA DA PS
      ======================================================= */}

      <div className="mt-1 flex gap-[2px]">
        {points.map((point) => {
          const value =
            tooth.sites.VESTIBULAR[
              point
            ].probingDepth;

          return (
            <span
              key={point}
              className={`flex h-4 w-4 items-center justify-center rounded text-[8px] font-semibold ${
                value !== null
                  ? value >= 5
                    ? "bg-error/15 text-error"
                    : "bg-background text-text-secondary"
                  : "text-text-muted"
              }`}
            >
              {value ?? "·"}
            </span>
          );
        })}
      </div>

      {maxDepth >= 5 && (
        <span className="mt-0.5 text-[7px] font-semibold text-error">
          PS ≥ 5
        </span>
      )}
    </motion.button>
  );
}

/* ============================================================
   ESCALA MILIMETRADA
   ============================================================ */

function PeriodontalScale({
  tooth,
  surface,
}: {
  tooth: Tooth;
  surface: Surface;
}) {
  const maxMm = 10;

  return (
    <div className="relative mx-auto mt-1 w-[74px]">
      <div className="absolute left-[13px] right-[13px] top-0 border-t border-border" />

      <div className="flex flex-col">
        {Array.from(
          { length: maxMm + 1 },
          (_, mm) => (
            <div
              key={mm}
              className="relative flex h-[20px] items-center"
            >
              <span className="w-5 text-right text-[8px] text-text-muted">
                {mm}
              </span>

              <div className="ml-1 flex flex-1 items-center">
                <span className="h-px w-full bg-border" />

                <span className="absolute left-[30px] h-[5px] w-px bg-text-muted" />
              </div>

              {points.map(
                (point, index) => {
                  const value =
                    tooth.sites[
                      surface
                    ][point]
                      .probingDepth;

                  if (value !== mm) {
                    return null;
                  }

                  return (
                    <span
                      key={point}
                      className="absolute z-10 h-2 w-2 rounded-full bg-primary shadow-[0_0_5px_rgba(212,175,55,0.55)]"
                      style={{
                        left:
                          40 +
                          index * 9,
                      }}
                    />
                  );
                }
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* ============================================================
   INPUT NUMÉRICO
   ============================================================ */

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

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */

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

  const [
    selectedTooth,
    setSelectedTooth,
  ] = useState<number | null>(null);

  const [surface, setSurface] =
    useState<Surface>("VESTIBULAR");

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

  const selectedIndex = useMemo(
    () =>
      teeth.findIndex(
        (tooth) =>
          tooth.number ===
          selectedTooth
      ),
    [teeth, selectedTooth]
  );

  /* ==========================================================
     RECUPERAR RASCUNHO
  ========================================================== */

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

  /* ==========================================================
     SALVAR RASCUNHO LOCAL
  ========================================================== */

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

  /* ==========================================================
     ATUALIZAÇÃO LOCAL
  ========================================================== */

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
    updateToothLocal((tooth) => ({
      ...tooth,
      status,
    }));
  }

  function updateSite(
    point: Point,
    field: keyof SiteData,
    value:
      | number
      | boolean
      | null
  ) {
    updateToothLocal((tooth) => ({
      ...tooth,
      sites: {
        ...tooth.sites,
        [surface]: {
          ...tooth.sites[surface],
          [point]: {
            ...tooth.sites[
              surface
            ][point],
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

  function updateMobility(
    value: number
  ) {
    updateToothLocal((tooth) => ({
      ...tooth,
      mobility: value,
    }));
  }

  function updateFurcation(
    type:
      | "buccal"
      | "lingual",
    value: number | null
  ) {
    updateToothLocal((tooth) => ({
      ...tooth,
      [
        type === "buccal"
          ? "buccalFurcation"
          : "lingualFurcation"
      ]: value,
    }));
  }

  /* ==========================================================
     PERSISTÊNCIA
  ========================================================== */

  async function persistTooth(
    tooth: Tooth
  ) {
    if (
      !examId ||
      !patientId
    ) {
      return;
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
          (surfaceSites) =>
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
          (surfaceSites) =>
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

      setIsSaved(true);
      setIsOfflineDraft(false);

      return true;
    } catch (error) {
      console.error(
        `ERRO AO SINCRONIZAR DENTE ${tooth.number}:`,
        error
      );

      setIsSaved(false);
      setIsOfflineDraft(true);

      return false;
    } finally {
      setIsSavingExam(false);
    }
  }

  /* ==========================================================
     AUTOSAVE
  ========================================================== */

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
      setTimeout(async () => {
        if (
          currentVersion !==
          saveVersionRef.current
        ) {
          return;
        }

        await persistTooth(
          toothToSave
        );
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

  /* ==========================================================
     RESET
  ========================================================== */

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

  /* ==========================================================
     NAVEGAÇÃO
  ========================================================== */

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

  /* ==========================================================
     SALVAR EXAME
  ========================================================== */

  async function saveExam() {
    if (!examId) {
      console.error(
        "Não foi possível salvar: examId não informado."
      );
      return;
    }

    if (!patientId) {
      console.error(
        "Não foi possível salvar: patientId não informado."
      );
      return;
    }

    if (isSavingExam) {
      return;
    }

    try {
      setIsSavingExam(true);
      setIsSaved(false);

      for (const tooth of teeth) {
        await persistTooth(
          tooth
        );
      }

      setIsSaved(true);
      setIsOfflineDraft(false);
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

  /* ==========================================================
     FINALIZAR
  ========================================================== */

  async function handleFinalizeExam() {
    if (!examId) {
      console.error(
        "Não foi possível finalizar: examId não informado."
      );
      return;
    }

    if (!patientId) {
      console.error(
        "Não foi possível finalizar: patientId não informado."
      );
      return;
    }

    try {
      await saveExam();

      await finalizeExam(
        examId
      );

      setIsSaved(true);
      setIsOfflineDraft(false);

      if (storageKey) {
        try {
          window.localStorage.removeItem(
            storageKey
          );
        } catch {
          // não impede a finalização
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

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="space-y-6">

      {/* ======================================================
          ODONTOGRAMA PRINCIPAL
      ======================================================= */}

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <CardTitle>
                Odontograma periodontal
              </CardTitle>

              <p className="mt-1 text-sm text-text-secondary">
                Visualização periodontal completa da arcada.
                Clique em qualquer dente para editar.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">

              {isOfflineDraft && (
                <Badge
                  variant="secondary"
                  className="gap-1"
                >
                  <CloudOff className="h-3 w-3" />
                  Rascunho local
                </Badge>
              )}

              {isSaved && !isOfflineDraft && (
                <Badge
                  variant="success"
                  className="gap-1"
                >
                  <Cloud className="h-3 w-3" />
                  Salvo
                </Badge>
              )}

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

        <CardContent>
          <div className="overflow-x-auto pb-5">

            <div className="mx-auto min-w-[1400px]">

              {/* ==================================================
                  LEGENDA
              =================================================== */}

              <div className="mb-8 flex flex-wrap justify-center gap-5 text-[11px] text-text-secondary">

                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  PS registrada
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-error" />
                  Sangramento
                </div>

                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
                  Supuração
                </div>

                <div>
                  M = Mesial
                </div>

                <div>
                  C = Central
                </div>

                <div>
                  D = Distal
                </div>
              </div>

              {/* ==================================================
                  ARCADA SUPERIOR
              =================================================== */}

              <section>

                <div className="mb-4 text-center">
                  <span className="rounded-full border border-border px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                    Arcada superior
                  </span>
                </div>

                <div className="relative">

                  {/* linha central */}
                  <div className="absolute left-1/2 top-0 h-full w-px bg-border/50" />

                  <div className="flex justify-center">

                    {teeth
                      .filter((tooth) =>
                        upperTeeth.includes(
                          tooth.number
                        )
                      )
                      .map((tooth) => (
                        <ToothSvg
                          key={
                            tooth.number
                          }
                          tooth={
                            tooth
                          }
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

              </section>

              {/* ==================================================
                  LINHA ENTRE ARCADAS
              =================================================== */}

              <div className="relative my-8">
                <div className="h-px w-full bg-border" />

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-4 text-[9px] uppercase tracking-widest text-text-muted">
                  Linha média
                </div>
              </div>

              {/* ==================================================
                  ARCADA INFERIOR
              =================================================== */}

              <section>

                <div className="relative">

                  <div className="absolute left-1/2 top-0 h-full w-px bg-border/50" />

                  <div className="flex justify-center">

                    {teeth
                      .filter((tooth) =>
                        lowerTeeth.includes(
                          tooth.number
                        )
                      )
                      .map((tooth) => (
                        <ToothSvg
                          key={
                            tooth.number
                          }
                          tooth={
                            tooth
                          }
                          lower
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

                <div className="mt-4 text-center">
                  <span className="rounded-full border border-border px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
                    Arcada inferior
                  </span>
                </div>

              </section>

              {/* ==================================================
                  ESCALA PERIODONTAL VISUAL
              =================================================== */}

              <div className="mt-10 rounded-xl border border-border bg-background/40 p-5">

                <div className="mb-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                    Profundidade de sondagem
                  </p>

                  <p className="mt-1 text-[11px] text-text-muted">
                    A marcação corresponde diretamente
                    ao valor registrado em cada sítio.
                  </p>
                </div>

                <div className="flex justify-center">

                  <div className="flex items-start gap-8">

                    <div className="pt-1 text-[10px] text-text-muted">
                      mm
                    </div>

                    <div className="flex gap-3">

                      {selected && (
                        <>
                          <div>
                            <div className="mb-2 text-center text-[9px] font-semibold text-text-muted">
                              M
                            </div>

                            <PeriodontalScale
                              tooth={
                                selected
                              }
                              surface={
                                surface
                              }
                            />
                          </div>
                        </>
                      )}

                    </div>

                  </div>

                </div>

              </div>

            </div>
          </div>
        </CardContent>
      </Card>

      {/* ======================================================
          DENTE SELECIONADO
      ======================================================= */}

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
            =================================================== */}

            <Card>
              <CardHeader>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

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
                      Registre os dados
                      periodontais do dente
                      selecionado.
                    </p>

                  </div>

                  <div className="flex gap-2">

                    <Button
                      type="button"
                      variant="ghost"
                      disabled={
                        selectedIndex <= 0
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
                          1
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

            {/* ==================================================
                MAPA MILIMETRADO DO DENTE
            =================================================== */}

            <Card>

              <CardHeader>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                  <div>

                    <CardTitle>
                      Mapa periodontal
                    </CardTitle>

                    <p className="mt-1 text-sm text-text-secondary">
                      Profundidade de sondagem
                      posicionada na escala
                      milimetrada.
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

                  <div className="mx-auto min-w-[650px]">

                    <div className="grid grid-cols-[150px_repeat(3,1fr)] border-b border-border">

                      <div className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                        Sítio
                      </div>

                      {points.map(
                        (point) => (
                          <div
                            key={
                              point
                            }
                            className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-text-muted"
                          >
                            {point ===
                            "MESIAL"
                              ? "M"
                              : point ===
                                  "CENTRAL"
                                ? "C"
                                : "D"}
                          </div>
                        )
                      )}

                    </div>

                    {/* PROFUNDIDADE */}

                    <div className="grid grid-cols-[150px_repeat(3,1fr)] border-b border-border/50">

                      <div className="px-3 py-3 text-sm font-medium">
                        Profundidade
                      </div>

                      {points.map(
                        (point) => (
                          <div
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
                          </div>
                        )
                      )}

                    </div>

                    {/* RECESSÃO */}

                    <div className="grid grid-cols-[150px_repeat(3,1fr)] border-b border-border/50">

                      <div className="px-3 py-3 text-sm font-medium">
                        Recessão
                      </div>

                      {points.map(
                        (point) => (
                          <div
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
                          </div>
                        )
                      )}

                    </div>

                    {/* NIC */}

                    <div className="grid grid-cols-[150px_repeat(3,1fr)]">

                      <div className="px-3 py-3 text-sm font-medium">
                        NIC
                      </div>

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
                            <div
                              key={
                                point
                              }
                              className="px-3 py-3"
                            >
                              <div className="flex h-9 items-center justify-center rounded-md border border-border bg-background text-sm font-semibold">
                                {cal ??
                                  "—"}
                              </div>
                            </div>
                          );
                        }
                      )}

                    </div>

                  </div>

                </div>

              </CardContent>
            </Card>

            {/* ==================================================
                MARCADORES
            =================================================== */}

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

            {/* ==================================================
                MOBILIDADE E FURCA
            =================================================== */}

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
            =================================================== */}

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
                  className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm outline-none placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20"
                />

              </CardContent>

            </Card>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
