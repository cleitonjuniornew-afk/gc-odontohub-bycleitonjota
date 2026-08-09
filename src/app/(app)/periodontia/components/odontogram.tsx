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
  Activity,
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

function pointShortName(point: Point) {
  if (point === "MESIAL") return "M";
  if (point === "CENTRAL") return "C";
  return "D";
}

function pointName(point: Point) {
  if (point === "MESIAL") return "Mesial";
  if (point === "CENTRAL") return "Central";
  return "Distal";
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

  const hasPlaque = Object.values(tooth.sites).some(
    (surface) =>
      Object.values(surface).some(
        (site) => site.plaque
      )
  );

  const hasSuppuration = Object.values(
    tooth.sites
  ).some((surface) =>
    Object.values(surface).some(
      (site) => site.suppuration
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
          <>
            <span className="absolute h-9 w-0.5 rotate-45 rounded-full bg-error" />
            <span className="absolute h-9 w-0.5 -rotate-45 rounded-full bg-error" />
          </>
        ) : tooth.status === "IMPLANTE" ? (
          <span className="flex h-8 w-6 items-center justify-center rounded-sm border border-secondary">
            <span className="h-6 w-0.5 bg-secondary" />
          </span>
        ) : (
          <>
            <span className="h-8 w-7 rounded-[45%] border border-text-muted/50 bg-background/30" />

            {hasBleeding && (
              <span className="absolute bottom-1 h-2 w-2 rounded-full bg-error shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
            )}

            {hasPlaque && (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-primary" />
            )}

            {hasSuppuration && (
              <span className="absolute left-1 top-1 h-1.5 w-1.5 rounded-full bg-secondary" />
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

/* ============================================================
   TABELA PERIODONTAL GERAL
   ============================================================ */

function PeriodontalOverview({
  teeth,
  onSelectTooth,
}: {
  teeth: Tooth[];
  onSelectTooth: (number: number) => void;
}) {
  const renderSurfaceRows = (surface: Surface) => {
    const label =
      surface === "VESTIBULAR"
        ? "Vestibular"
        : "Lingual";

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
            {label}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[1100px] border-collapse text-xs">
            <thead>
              <tr className="bg-background/70">
                <th
                  rowSpan={2}
                  className="sticky left-0 z-10 border-b border-r border-border bg-card px-3 py-2 text-left font-bold text-text-primary"
                >
                  Dente
                </th>

                {points.map((point) => (
                  <th
                    key={`${surface}-${point}-pd`}
                    className="border-b border-border px-2 py-2 text-center font-bold text-text-muted"
                  >
                    PS {pointShortName(point)}
                  </th>
                ))}

                {points.map((point) => (
                  <th
                    key={`${surface}-${point}-rec`}
                    className="border-b border-border px-2 py-2 text-center font-bold text-text-muted"
                  >
                    REC {pointShortName(point)}
                  </th>
                ))}

                {points.map((point) => (
                  <th
                    key={`${surface}-${point}-nic`}
                    className="border-b border-border px-2 py-2 text-center font-bold text-text-muted"
                  >
                    NIC {pointShortName(point)}
                  </th>
                ))}

                <th
                  rowSpan={2}
                  className="border-b border-border px-3 py-2 text-center font-bold text-text-muted"
                >
                  S
                </th>

                <th
                  rowSpan={2}
                  className="border-b border-border px-3 py-2 text-center font-bold text-text-muted"
                >
                  P
                </th>

                <th
                  rowSpan={2}
                  className="border-b border-border px-3 py-2 text-center font-bold text-text-muted"
                >
                  SUP
                </th>
              </tr>

              <tr className="bg-background/40">
                {points.map((point) => (
                  <th
                    key={`${surface}-${point}-pd-sub`}
                    className="border-b border-border px-2 py-1 text-center text-[10px] text-text-muted"
                  >
                    mm
                  </th>
                ))}

                {points.map((point) => (
                  <th
                    key={`${surface}-${point}-rec-sub`}
                    className="border-b border-border px-2 py-1 text-center text-[10px] text-text-muted"
                  >
                    mm
                  </th>
                ))}

                {points.map((point) => (
                  <th
                    key={`${surface}-${point}-nic-sub`}
                    className="border-b border-border px-2 py-1 text-center text-[10px] text-text-muted"
                  >
                    mm
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {teeth.map((tooth) => {
                const sites = tooth.sites[surface];

                const allSites = Object.values(
                  tooth.sites
                ).flatMap((surfaceSites) =>
                  Object.values(surfaceSites)
                );

                const bleeding = allSites.some(
                  (site) => site.bleeding
                );

                const plaque = allSites.some(
                  (site) => site.plaque
                );

                const suppuration = allSites.some(
                  (site) => site.suppuration
                );

                return (
                  <tr
                    key={`${surface}-${tooth.number}`}
                    className={`border-b border-border/50 transition hover:bg-primary/5 ${
                      tooth.number % 2 === 0
                        ? "bg-card"
                        : "bg-background/20"
                    }`}
                  >
                    <td className="sticky left-0 z-10 border-r border-border bg-inherit px-3 py-2">
                      <button
                        type="button"
                        onClick={() =>
                          onSelectTooth(
                            tooth.number
                          )
                        }
                        className={`font-bold transition hover:text-primary ${
                          tooth.status === "AUSENTE"
                            ? "text-error line-through"
                            : tooth.status ===
                                "IMPLANTE"
                              ? "text-secondary"
                              : "text-text-primary"
                        }`}
                      >
                        {tooth.number}
                      </button>
                    </td>

                    {points.map((point) => {
                      const value =
                        sites[point].probingDepth;

                      return (
                        <td
                          key={`${surface}-${tooth.number}-${point}-pd`}
                          className={`px-2 py-2 text-center font-semibold ${
                            value !== null &&
                            value >= 5
                              ? "bg-error/10 text-error"
                              : value !== null &&
                                  value >= 4
                                ? "text-primary"
                                : "text-text-primary"
                          }`}
                        >
                          {value ?? "—"}
                        </td>
                      );
                    })}

                    {points.map((point) => {
                      const value =
                        sites[point]
                          .gingivalRecession;

                      return (
                        <td
                          key={`${surface}-${tooth.number}-${point}-rec`}
                          className="px-2 py-2 text-center font-semibold text-text-primary"
                        >
                          {value ?? "—"}
                        </td>
                      );
                    })}

                    {points.map((point) => {
                      const value =
                        calculateCAL(
                          sites[point]
                        );

                      return (
                        <td
                          key={`${surface}-${tooth.number}-${point}-nic`}
                          className={`px-2 py-2 text-center font-bold ${
                            value !== null &&
                            value >= 5
                              ? "bg-error/10 text-error"
                              : value !== null &&
                                  value >= 4
                                ? "text-primary"
                                : "text-text-primary"
                          }`}
                        >
                          {value ?? "—"}
                        </td>
                      );
                    })}

                    <td className="px-2 py-2 text-center">
                      {bleeding ? (
                        <span className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-error/15 text-error">
                          <Check className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="text-text-muted">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-2 py-2 text-center">
                      {plaque ? (
                        <span className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                          <Check className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="text-text-muted">
                          —
                        </span>
                      )}
                    </td>

                    <td className="px-2 py-2 text-center">
                      {suppuration ? (
                        <span className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                          <Check className="h-3 w-3" />
                        </span>
                      ) : (
                        <span className="text-text-muted">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>
              Periodontograma geral
            </CardTitle>

            <p className="mt-1 text-sm text-text-secondary">
              Visualização completa dos dados
              registrados em todos os dentes.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Activity className="h-4 w-4 text-primary" />
            <span>
              Clique no número do dente para
              abrir a avaliação
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {renderSurfaceRows("VESTIBULAR")}
        {renderSurfaceRows("LINGUAL")}

        <div className="flex flex-wrap gap-4 rounded-xl border border-border bg-background/40 p-4 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="font-bold text-text-primary">
              PS
            </span>
            <span>
              Profundidade de sondagem
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-text-primary">
              REC
            </span>
            <span>Recessão gengival</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-text-primary">
              NIC
            </span>
            <span>
              Nível de inserção clínica
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-error">
              S
            </span>
            <span>Sangramento</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">
              P
            </span>
            <span>Placa</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-secondary">
              SUP
            </span>
            <span>Supuração</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================
   CHART DIDÁTICO
   ============================================================ */

function PeriodontalEducationalChart({
  tooth,
  surface,
}: {
  tooth: Tooth;
  surface: Surface;
}) {
  const sites = tooth.sites[surface];

  const maxValue = 10;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>
            Chart periodontal — dente{" "}
            {tooth.number}
          </CardTitle>

          <p className="mt-1 text-sm text-text-secondary">
            Visualização didática da profundidade
            e inserção clínica nos três sítios.
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-2xl border border-border bg-background/40 p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              {surface === "VESTIBULAR"
                ? "Vestibular"
                : "Lingual"}
            </span>

            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                PS
              </span>

              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
                NIC
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {points.map((point) => {
              const site = sites[point];

              const ps =
                site.probingDepth ?? 0;

              const nic =
                calculateCAL(site) ?? 0;

              const psHeight = Math.min(
                (ps / maxValue) * 100,
                100
              );

              const nicHeight = Math.min(
                (nic / maxValue) * 100,
                100
              );

              return (
                <div
                  key={point}
                  className="rounded-xl border border-border bg-card p-3"
                >
                  <div className="mb-3 text-center text-xs font-bold text-text-primary">
                    {pointName(point)}
                  </div>

                  <div className="relative mx-auto h-36 w-20">
                    <div className="absolute inset-x-1/2 bottom-0 h-full w-px -translate-x-1/2 bg-border" />

                    {[0, 2, 4, 6, 8, 10].map(
                      (number) => (
                        <div
                          key={number}
                          className="absolute left-0 right-0 flex items-center"
                          style={{
                            bottom: `${
                              (number /
                                maxValue) *
                              100
                            }%`,
                          }}
                        >
                          <span className="absolute -left-1 -translate-x-full text-[9px] text-text-muted">
                            {number}
                          </span>

                          <div className="h-px w-full bg-border/40" />
                        </div>
                      )
                    )}

                    <div
                      className="absolute bottom-0 left-[30%] w-3 rounded-t-full bg-primary/80 transition-all"
                      style={{
                        height: `${Math.max(
                          psHeight,
                          ps > 0 ? 5 : 0
                        )}%`,
                      }}
                    />

                    <div
                      className="absolute bottom-0 right-[30%] w-3 rounded-t-full bg-secondary/80 transition-all"
                      style={{
                        height: `${Math.max(
                          nicHeight,
                          nic > 0 ? 5 : 0
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <div className="text-[10px] text-text-muted">
                        PS
                      </div>
                      <div className="font-bold text-primary">
                        {site.probingDepth ??
                          "—"}
                      </div>
                    </div>

                    <div className="rounded-lg bg-secondary/10 p-2">
                      <div className="text-[10px] text-text-muted">
                        NIC
                      </div>
                      <div className="font-bold text-secondary">
                        {calculateCAL(
                          site
                        ) ?? "—"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex justify-center gap-2">
                    {site.bleeding && (
                      <span className="rounded-full bg-error/10 px-2 py-1 text-[9px] font-bold text-error">
                        SANGRA
                      </span>
                    )}

                    {site.plaque && (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-bold text-primary">
                        PLACA
                      </span>
                    )}

                    {site.suppuration && (
                      <span className="rounded-full bg-secondary/10 px-2 py-1 text-[9px] font-bold text-secondary">
                        SUP
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-xl border border-border bg-card p-4">
            <p className="text-xs leading-relaxed text-text-secondary">
              <strong className="text-text-primary">
                Como interpretar:
              </strong>{" "}
              a PS representa a profundidade de
              sondagem. O NIC representa o nível de
              inserção clínica. Valores maiores devem
              ser avaliados junto aos demais sinais
              clínicos, como sangramento, placa,
              supuração e mobilidade.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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

  /* ==========================================================
     RECUPERAR RASCUNHO LOCAL
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
          parsed?.surface ===
            "LINGUAL"
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

  /* ==========================================================
     SALVAR LOCAL IMEDIATAMENTE
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
    updater: (tooth: Tooth) => Tooth
  ) {
    if (selectedTooth === null) {
      return;
    }

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

  function updateMobility(
    value: number
  ) {
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

  /* ==========================================================
     SALVAR DENTE NO SUPABASE
     ========================================================== */

  async function persistTooth(
    tooth: Tooth
  ) {
    if (!examId || !patientId) {
      return false;
    }

    try {
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
              (site) =>
                site.plaque
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

        setIsSavingExam(true);

        const success =
          await persistTooth(
            toothToSave
          );

        setIsSavingExam(false);

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

  /* ==========================================================
     LIMPAR
     ========================================================== */

  function resetOdontogram() {
    setTeeth([
      ...createTeeth(upperTeeth),
      ...createTeeth(lowerTeeth),
    ]);

    setSelectedTooth(null);
    setSurface("VESTIBULAR");
    setIsSaved(false);
    setIsOfflineDraft(false);

    saveVersionRef.current += 1;

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
    if (selectedIndex < 0) {
      return;
    }

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

  /* ==========================================================
     SALVAR TODOS
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

      let allSuccessful = true;

      for (const tooth of teeth) {
        const success =
          await persistTooth(tooth);

        if (!success) {
          allSuccessful = false;
        }
      }

      if (allSuccessful) {
        setIsSaved(true);
        setIsOfflineDraft(false);
      } else {
        setIsSaved(false);
        setIsOfflineDraft(true);
      }

      console.log(
        "EXAME PERIODONTAL SINCRONIZADO:",
        {
          examId,
          patientId,
        }
      );
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

  return (
    <div className="space-y-6">

      {/* ======================================================
          ODONTOGRAMA
      ======================================================= */}

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

      {/* ======================================================
          TABELA GERAL
      ======================================================= */}

      <PeriodontalOverview
        teeth={teeth}
        onSelectTooth={
          setSelectedTooth
        }
      />

      {/* ======================================================
          DENTE SELECIONADO
      ======================================================= */}

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

            {/* CABEÇALHO */}

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
                              {pointShortName(
                                point
                              )}
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

            {/* CHART DIDÁTICO */}

            <PeriodontalEducationalChart
              tooth={selected}
              surface={surface}
            />

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
                              {pointName(
                                point
                              )}
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

/*
 * Export default mantido de propósito.
 *
 * Seu page.tsx atual está usando:
 *
 * import Odontogram from "./components/odontogram";
 *
 * Portanto não precisamos alterar o page.tsx.
 */

export default Odontogram;
