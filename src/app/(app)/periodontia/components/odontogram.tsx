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
  ClipboardList,
  Info,
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

function getAllSites(teeth: Tooth[]) {
  const result: {
    tooth: Tooth;
    surface: Surface;
    point: Point;
    site: SiteData;
  }[] = [];

  for (const tooth of teeth) {
    if (tooth.status === "AUSENTE") {
      continue;
    }

    for (const surface of [
      "VESTIBULAR",
      "LINGUAL",
    ] as Surface[]) {
      for (const point of points) {
        result.push({
          tooth,
          surface,
          point,
          site: tooth.sites[surface][point],
        });
      }
    }
  }

  return result;
}

function getBleedingPercentage(teeth: Tooth[]) {
  const sites = getAllSites(teeth);

  const examinedSites = sites.filter(
    ({ site }) => site.probingDepth !== null
  );

  if (examinedSites.length === 0) {
    return 0;
  }

  const bleedingSites = examinedSites.filter(
    ({ site }) => site.bleeding
  ).length;

  return (
    (bleedingSites / examinedSites.length) * 100
  );
}

function getPlaquePercentage(teeth: Tooth[]) {
  const sites = getAllSites(teeth);

  const examinedSites = sites.filter(
    ({ site }) => site.probingDepth !== null
  );

  if (examinedSites.length === 0) {
    return 0;
  }

  const plaqueSites = examinedSites.filter(
    ({ site }) => site.plaque
  ).length;

  return (
    (plaqueSites / examinedSites.length) * 100
  );
}

function getExaminedSites(teeth: Tooth[]) {
  return getAllSites(teeth).filter(
    ({ site }) => site.probingDepth !== null
  ).length;
}

function getBleedingSites(teeth: Tooth[]) {
  return getAllSites(teeth).filter(
    ({ site }) =>
      site.probingDepth !== null &&
      site.bleeding
  ).length;
}

function getPlaqueSites(teeth: Tooth[]) {
  return getAllSites(teeth).filter(
    ({ site }) =>
      site.probingDepth !== null &&
      site.plaque
  ).length;
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
  const hasBleeding =
    Object.values(tooth.sites).some(
      (surface) =>
        Object.values(surface).some(
          (site) => site.bleeding
        )
    );

  const hasPlaque =
    Object.values(tooth.sites).some(
      (surface) =>
        Object.values(surface).some(
          (site) => site.plaque
        )
    );

  const hasSuppuration =
    Object.values(tooth.sites).some(
      (surface) =>
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

function PeriodontalTable({
  teeth,
  onSelectTooth,
}: {
  teeth: Tooth[];
  onSelectTooth: (number: number) => void;
}) {
  const upper = teeth.filter((tooth) =>
    upperTeeth.includes(tooth.number)
  );

  const lower = teeth.filter((tooth) =>
    lowerTeeth.includes(tooth.number)
  );

  /*
   * CORREÇÃO:
   * O traço aparece somente quando não existe valor.
   * Quando existe valor, ele é exibido normalmente,
   * sem ficar pequeno ou com traço sobreposto.
   */
  const formatNumber = (
    value: number | null
  ) => (value === null ? "—" : String(value));

  const renderArch = (
    title: string,
    archTeeth: Tooth[]
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          {title}
        </h3>

        <span className="text-xs text-text-muted">
          M · C · D
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[1500px] border-collapse text-xs">
          <thead>
            <tr className="bg-background">
              <th className="sticky left-0 z-10 min-w-[125px] border-b border-r border-border bg-background px-3 py-3 text-left font-semibold text-text-secondary">
                Dente
              </th>

              {archTeeth.map((tooth) => (
                <th
                  key={tooth.number}
                  colSpan={3}
                  className="border-b border-r border-border px-2 py-2 text-center"
                >
                  <button
                    type="button"
                    onClick={() =>
                      onSelectTooth(tooth.number)
                    }
                    className={`font-bold transition hover:text-primary ${
                      tooth.status === "AUSENTE"
                        ? "text-error"
                        : "text-text-primary"
                    }`}
                  >
                    {tooth.number}
                  </button>
                </th>
              ))}
            </tr>

            <tr className="bg-background/60">
              <th className="sticky left-0 z-10 border-b border-r border-border bg-background/60 px-3 py-2 text-left text-text-muted">
                Sítio
              </th>

              {archTeeth.flatMap((tooth) =>
                points.map((point) => (
                  <th
                    key={`${tooth.number}-${point}`}
                    className="border-b border-r border-border px-2 py-2 text-center font-medium text-text-muted"
                  >
                    {point === "MESIAL"
                      ? "M"
                      : point === "CENTRAL"
                        ? "C"
                        : "D"}
                  </th>
                ))
              )}
            </tr>
          </thead>

          <tbody>
            {/* PS */}
            <tr className="bg-primary/5">
              <td className="sticky left-0 z-10 border-b border-r border-border bg-primary/5 px-3 py-2 font-semibold text-text-primary">
                PS
              </td>

              {archTeeth.flatMap((tooth) =>
                points.map((point) => {
                  const vestibular =
                    tooth.sites.VESTIBULAR[
                      point
                    ].probingDepth;

                  const lingual =
                    tooth.sites.LINGUAL[
                      point
                    ].probingDepth;

                  return (
                    <td
                      key={`${tooth.number}-${point}`}
                      className="border-b border-r border-border px-2 py-2 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-0.5 leading-tight">
                        <span
                          className={
                            vestibular === null
                              ? "text-sm text-text-muted"
                              : "text-sm font-semibold text-text-primary"
                          }
                        >
                          {formatNumber(
                            vestibular
                          )}
                        </span>

                        <span
                          className={
                            lingual === null
                              ? "text-sm text-text-muted"
                              : "text-sm font-semibold text-text-primary"
                          }
                        >
                          {formatNumber(
                            lingual
                          )}
                        </span>
                      </div>
                    </td>
                  );
                })
              )}
            </tr>

            {/* RECESSÃO */}
            <tr>
              <td className="sticky left-0 z-10 border-b border-r border-border bg-background px-3 py-2 font-semibold text-text-primary">
                Recessão
              </td>

              {archTeeth.flatMap((tooth) =>
                points.map((point) => {
                  const vestibular =
                    tooth.sites.VESTIBULAR[
                      point
                    ].gingivalRecession;

                  const lingual =
                    tooth.sites.LINGUAL[
                      point
                    ].gingivalRecession;

                  return (
                    <td
                      key={`${tooth.number}-${point}`}
                      className="border-b border-r border-border px-2 py-2 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-0.5 leading-tight">
                        <span
                          className={
                            vestibular === null
                              ? "text-sm text-text-muted"
                              : "text-sm font-semibold text-text-primary"
                          }
                        >
                          {formatNumber(
                            vestibular
                          )}
                        </span>

                        <span
                          className={
                            lingual === null
                              ? "text-sm text-text-muted"
                              : "text-sm font-semibold text-text-primary"
                          }
                        >
                          {formatNumber(
                            lingual
                          )}
                        </span>
                      </div>
                    </td>
                  );
                })
              )}
            </tr>

            {/* NIC */}
            <tr className="bg-secondary/5">
              <td className="sticky left-0 z-10 border-b border-r border-border bg-secondary/5 px-3 py-2 font-semibold text-text-primary">
                NIC
              </td>

              {archTeeth.flatMap((tooth) =>
                points.map((point) => {
                  const vestibular =
                    calculateCAL(
                      tooth.sites.VESTIBULAR[
                        point
                      ]
                    );

                  const lingual =
                    calculateCAL(
                      tooth.sites.LINGUAL[
                        point
                      ]
                    );

                  return (
                    <td
                      key={`${tooth.number}-${point}`}
                      className="border-b border-r border-border px-2 py-2 text-center"
                    >
                      <div className="flex flex-col items-center justify-center gap-0.5 leading-tight">
                        <span
                          className={
                            vestibular === null
                              ? "text-sm text-text-muted"
                              : "text-sm font-semibold text-text-primary"
                          }
                        >
                          {formatNumber(
                            vestibular
                          )}
                        </span>

                        <span
                          className={
                            lingual === null
                              ? "text-sm text-text-muted"
                              : "text-sm font-semibold text-text-primary"
                          }
                        >
                          {formatNumber(
                            lingual
                          )}
                        </span>
                      </div>
                    </td>
                  );
                })
              )}
            </tr>

            {/* SS */}
            <tr>
              <td className="sticky left-0 z-10 border-b border-r border-border bg-background px-3 py-2 font-semibold text-text-primary">
                SS
              </td>

              {archTeeth.flatMap((tooth) =>
                points.map((point) => {
                  const v =
                    tooth.sites.VESTIBULAR[
                      point
                    ];

                  const l =
                    tooth.sites.LINGUAL[
                      point
                    ];

                  const hasV =
                    v.probingDepth !== null;

                  const hasL =
                    l.probingDepth !== null;

                  return (
                    <td
                      key={`${tooth.number}-${point}`}
                      className="border-b border-r border-border px-2 py-2 text-center"
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span
                          className={
                            hasV && v.bleeding
                              ? "font-bold text-error"
                              : "text-text-muted"
                          }
                        >
                          {hasV
                            ? v.bleeding
                              ? "●"
                              : "○"
                            : "—"}
                        </span>

                        <span
                          className={
                            hasL && l.bleeding
                              ? "text-sm font-bold text-error"
                              : "text-sm text-text-muted"
                          }
                        >
                          {hasL
                            ? l.bleeding
                              ? "●"
                              : "○"
                            : "—"}
                        </span>
                      </div>
                    </td>
                  );
                })
              )}
            </tr>

            {/* PI */}
            <tr>
              <td className="sticky left-0 z-10 border-b border-r border-border bg-background px-3 py-2 font-semibold text-text-primary">
                PI
              </td>

              {archTeeth.flatMap((tooth) =>
                points.map((point) => {
                  const v =
                    tooth.sites.VESTIBULAR[
                      point
                    ];

                  const l =
                    tooth.sites.LINGUAL[
                      point
                    ];

                  const hasV =
                    v.probingDepth !== null;

                  const hasL =
                    l.probingDepth !== null;

                  return (
                    <td
                      key={`${tooth.number}-${point}`}
                      className="border-b border-r border-border px-2 py-2 text-center"
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span
                          className={
                            hasV && v.plaque
                              ? "font-bold text-primary"
                              : "text-text-muted"
                          }
                        >
                          {hasV
                            ? v.plaque
                              ? "●"
                              : "○"
                            : "—"}
                        </span>

                        <span
                          className={
                            hasL && l.plaque
                              ? "text-sm font-bold text-primary"
                              : "text-sm text-text-muted"
                          }
                        >
                          {hasL
                            ? l.plaque
                              ? "●"
                              : "○"
                            : "—"}
                        </span>
                      </div>
                    </td>
                  );
                })
              )}
            </tr>

            {/* SUPURAÇÃO */}
            <tr>
              <td className="sticky left-0 z-10 border-r border-border bg-background px-3 py-2 font-semibold text-text-primary">
                Supuração
              </td>

              {archTeeth.flatMap((tooth) =>
                points.map((point) => {
                  const v =
                    tooth.sites.VESTIBULAR[
                      point
                    ];

                  const l =
                    tooth.sites.LINGUAL[
                      point
                    ];

                  const hasV =
                    v.probingDepth !== null;

                  const hasL =
                    l.probingDepth !== null;

                  return (
                    <td
                      key={`${tooth.number}-${point}`}
                      className="border-r border-border px-2 py-2 text-center"
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <span
                          className={
                            hasV && v.suppuration
                              ? "font-bold text-secondary"
                              : "text-text-muted"
                          }
                        >
                          {hasV
                            ? v.suppuration
                              ? "●"
                              : "○"
                            : "—"}
                        </span>

                        <span
                          className={
                            hasL && l.suppuration
                              ? "text-sm font-bold text-secondary"
                              : "text-sm text-text-muted"
                          }
                        >
                          {hasL
                            ? l.suppuration
                              ? "●"
                              : "○"
                            : "—"}
                        </span>
                      </div>
                    </td>
                  );
                })
              )}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-text-muted">
        Em cada célula: valor superior =
        vestibular; valor inferior =
        lingual. Clique no número do dente
        para editar.
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Periodontograma</CardTitle>

        <p className="mt-1 text-sm text-text-secondary">
          Visão clínica de todos os dentes e
          sítios registrados.
        </p>
      </CardHeader>

      <CardContent className="space-y-8">
        {renderArch(
          "Arcada superior",
          upper
        )}

        {renderArch(
          "Arcada inferior",
          lower
        )}
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

  const [teeth, setTeeth] = useState<Tooth[]>(() => [
    ...createTeeth(upperTeeth),
    ...createTeeth(lowerTeeth),
  ]);

  const [selectedTooth, setSelectedTooth] =
    useState<number | null>(null);

  const [surface, setSurface] =
    useState<Surface>("VESTIBULAR");

  const [activeTab, setActiveTab] =
    useState<"dentist" | "chart">(
      "dentist"
    );

  const [isSaved, setIsSaved] =
    useState(false);

  const [isOfflineDraft, setIsOfflineDraft] =
    useState(false);

  const [hasLoadedDraft, setHasLoadedDraft] =
    useState(false);

  const [isAutoSaving, setIsAutoSaving] =
    useState(false);

  const saveTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const saveVersionRef =
    useRef(0);

  const toothIdsRef =
    useRef<Record<number, string>>({});

  const teethRef =
    useRef<Tooth[]>(teeth);

  useEffect(() => {
    teethRef.current = teeth;
  }, [teeth]);

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

  const bleedingPercentage =
    useMemo(
      () =>
        getBleedingPercentage(teeth),
      [teeth]
    );

  const plaquePercentage =
    useMemo(
      () =>
        getPlaquePercentage(teeth),
      [teeth]
    );

  const examinedSites = useMemo(
    () =>
      getExaminedSites(teeth),
    [teeth]
  );

  const bleedingSites = useMemo(
    () =>
      getBleedingSites(teeth),
    [teeth]
  );

  const plaqueSites = useMemo(
    () =>
      getPlaqueSites(teeth),
    [teeth]
  );

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
          teethRef.current =
            parsed.teeth;
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

        if (
          parsed?.toothIds &&
          typeof parsed.toothIds ===
            "object"
        ) {
          toothIdsRef.current =
            parsed.toothIds;
        }

        setIsSaved(false);
        setIsOfflineDraft(true);
      }
    } catch (error) {
      console.error(
        "Erro ao recuperar rascunho periodontal:",
        error
      );
    } finally {
      setHasLoadedDraft(true);
    }
  }, [storageKey]);

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
          toothIds:
            toothIdsRef.current,
          updatedAt:
            new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error(
        "Erro ao salvar rascunho local:",
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

  function updateToothLocal(
    updater: (tooth: Tooth) => Tooth
  ) {
    if (selectedTooth === null) {
      return;
    }

    saveVersionRef.current += 1;

    setTeeth((current) => {
      const updated =
        current.map(
          (tooth) =>
            tooth.number ===
            selectedTooth
              ? updater(tooth)
              : tooth
        );

      teethRef.current =
        updated;

      return updated;
    });

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
    type: "buccal" | "lingual",
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

  async function persistTooth(
    tooth: Tooth
  ) {
    if (!examId || !patientId) {
      console.error(
        "Autosave cancelado: examId ou patientId ausente.",
        {
          examId,
          patientId,
        }
      );

      return false;
    }

    try {
      let toothId =
        toothIdsRef.current[
          tooth.number
        ];

      if (!toothId) {
        const savedTooth =
          await createTooth({
            examId,
            toothNumber:
              tooth.number,
            status:
              tooth.status,
          });

        if (
          !savedTooth ||
          !savedTooth.id
        ) {
          throw new Error(
            `Não foi possível criar o dente ${tooth.number}.`
          );
        }

        toothId =
          savedTooth.id;

        toothIdsRef.current[
          tooth.number
        ] = toothId;
      }

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
        id: toothId,
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
            toothId,
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

      if (storageKey) {
        try {
          window.localStorage.setItem(
            storageKey,
            JSON.stringify({
              teeth:
                teethRef.current,
              selectedTooth,
              surface,
              toothIds:
                toothIdsRef.current,
              updatedAt:
                new Date().toISOString(),
            })
          );
        } catch {
          // O banco já foi salvo.
        }
      }

      return true;
    } catch (error) {
      console.error(
        `Erro ao sincronizar dente ${tooth.number}:`,
        error
      );

      return false;
    }
  }

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
      teethRef.current.find(
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

        setIsAutoSaving(true);
        setIsSaved(false);

        const success =
          await persistTooth(
            toothToSave
          );

        if (
          currentVersion !==
          saveVersionRef.current
        ) {
          setIsAutoSaving(false);
          return;
        }

        setIsAutoSaving(false);

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

  function resetOdontogram() {
    const initialTeeth = [
      ...createTeeth(upperTeeth),
      ...createTeeth(lowerTeeth),
    ];

    setTeeth(initialTeeth);
    teethRef.current =
      initialTeeth;

    setSelectedTooth(null);
    setSurface("VESTIBULAR");
    setActiveTab("dentist");
    setIsSaved(false);
    setIsOfflineDraft(false);
    setIsAutoSaving(false);

    saveVersionRef.current += 1;

    toothIdsRef.current = {};

    if (saveTimerRef.current) {
      clearTimeout(
        saveTimerRef.current
      );
    }

    if (storageKey) {
      try {
        window.localStorage.removeItem(
          storageKey
        );
      } catch (error) {
        console.error(
          "Erro ao limpar rascunho:",
          error
        );
      }
    }
  }

  function goToTooth(
    direction: -1 | 1
  ) {
    if (selectedIndex < 0) {
      return;
    }

    const nextIndex =
      selectedIndex +
      direction;

    if (
      nextIndex < 0 ||
      nextIndex >= teeth.length
    ) {
      return;
    }

    setSelectedTooth(
      teeth[nextIndex].number
    );

    setActiveTab("dentist");
  }

  async function saveExam() {
    if (!examId || !patientId) {
      console.error(
        "Não foi possível salvar: exame ou paciente não informado.",
        {
          examId,
          patientId,
        }
      );

      return;
    }

    if (saveTimerRef.current) {
      clearTimeout(
        saveTimerRef.current
      );
    }

    try {
      setIsAutoSaving(true);
      setIsSaved(false);

      let allSuccessful = true;

      for (const tooth of teethRef.current) {
        const success =
          await persistTooth(
            tooth
          );

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
    } catch (error) {
      console.error(
        "Erro ao salvar exame periodontal:",
        error
      );

      setIsSaved(false);
      setIsOfflineDraft(true);
    } finally {
      setIsAutoSaving(false);
    }
  }

  async function handleFinalizeExam() {
    if (!examId || !patientId) {
      console.error(
        "Não foi possível finalizar: exame ou paciente não informado."
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
          // Não impede a finalização.
        }
      }
    } catch (error) {
      console.error(
        "Erro ao finalizar exame periodontal:",
        error
      );
    }
  }

  const saving =
    isCreatingTooth ||
    isUpdatingTooth ||
    isSavingSite ||
    isFinalizingExam ||
    isAutoSaving;

  const canSave =
    Boolean(examId && patientId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>
                Avaliação periodontal
              </CardTitle>

              <p className="mt-1 text-sm text-text-secondary">
                Registre os dados clínicos
                dente por dente ou consulte o
                periodontograma completo.
              </p>

              {!canSave && (
                <p className="mt-2 text-xs font-medium text-error">
                  Este exame não recebeu
                  examId/patientId. O salvamento
                  no banco está indisponível.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isAutoSaving ? (
                <Badge
                  variant="secondary"
                  className="gap-1"
                >
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Salvando...
                </Badge>
              ) : isOfflineDraft ? (
                <Badge
                  variant="secondary"
                  className="gap-1"
                >
                  <CloudOff className="h-3 w-3" />
                  Rascunho salvo
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
                disabled={!canSave || saving}
                className={
                  canSave && !saving
                    ? "cursor-pointer"
                    : ""
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
                  !canSave ||
                  saving
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
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-background/50 p-2 sm:flex-row">
            <Button
              type="button"
              variant={
                activeTab === "dentist"
                  ? "primary"
                  : "ghost"
              }
              onClick={() =>
                setActiveTab("dentist")
              }
              className="flex-1"
            >
              Avaliação do dente
            </Button>

            <Button
              type="button"
              variant={
                activeTab === "chart"
                  ? "primary"
                  : "ghost"
              }
              onClick={() =>
                setActiveTab("chart")
              }
              className="flex-1"
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Periodontograma
            </Button>
          </div>
        </CardContent>
      </Card>

      {activeTab === "chart" && (
        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="space-y-6"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Sítios examinados
                </p>

                <p className="mt-2 text-2xl font-bold text-text-primary">
                  {examinedSites}
                </p>

                <p className="mt-1 text-xs text-text-secondary">
                  sítios com PS registrada
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Sangramento à sondagem
                </p>

                <p className="mt-2 text-2xl font-bold text-error">
                  {bleedingPercentage.toFixed(1)}
                  %
                </p>

                <p className="mt-1 text-xs text-text-secondary">
                  {bleedingSites} sítios
                  positivos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Placa / biofilme
                </p>

                <p className="mt-2 text-2xl font-bold text-primary">
                  {plaquePercentage.toFixed(1)}
                  %
                </p>

                <p className="mt-1 text-xs text-text-secondary">
                  {plaqueSites} sítios
                  positivos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Dentes avaliados
                </p>

                <p className="mt-2 text-2xl font-bold text-text-primary">
                  {
                    teeth.filter(
                      (tooth) =>
                        tooth.status !==
                        "AUSENTE"
                    ).length
                  }
                </p>

                <p className="mt-1 text-xs text-text-secondary">
                  dentes presentes/implantes
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="flex gap-3 p-5">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

              <div>
                <p className="font-semibold text-text-primary">
                  Como ler esta tabela
                </p>

                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  Cada dente possui três
                  sítios por face: M (mesial),
                  C (central) e D (distal).
                  Na linha PS, o valor superior
                  é o vestibular e o inferior é
                  o lingual. SS indica
                  sangramento à sondagem e PI
                  indica presença de
                  placa/biofilme.
                </p>

                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  A porcentagem de sangramento
                  é calculada automaticamente
                  sobre os sítios que possuem
                  PS registrada.
                </p>
              </div>
            </CardContent>
          </Card>

          <PeriodontalTable
            teeth={teeth}
            onSelectTooth={(number) => {
              setSelectedTooth(number);
              setActiveTab("dentist");
            }}
          />
        </motion.div>
      )}

      {activeTab === "dentist" && (
        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  Odontograma periodontal
                </CardTitle>

                <p className="mt-1 text-sm text-text-secondary">
                  Selecione um dente para
                  iniciar a avaliação
                  periodontal.
                </p>
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto pb-4">
                <div className="mx-auto min-w-[850px] space-y-8">
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
                            key={tooth.number}
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
                            key={tooth.number}
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

                <Card>
                  <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle>
                          Sondagem periodontal
                        </CardTitle>

                        <p className="mt-1 text-sm text-text-secondary">
                          Registre PS e
                          recessão em
                          cada sítio. O
                          NIC é
                          calculado
                          automaticamente.
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
                              PS
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
                                  ][
                                    point
                                  ];

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

                    <div className="mt-4 rounded-lg border border-border bg-background/50 p-3 text-xs text-text-secondary">
                      <strong className="text-text-primary">
                        NIC:
                      </strong>{" "}
                      PS + recessão. Se a
                      margem gengival estiver
                      coronal ao JCE, registre
                      a recessão com valor
                      negativo.
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      Marcadores clínicos
                    </CardTitle>

                    <p className="mt-1 text-sm text-text-secondary">
                      Sangramento à sondagem,
                      placa/biofilme e
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
                                    à sondagem
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
                                    Placa /
                                    biofilme
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
                        <label className="mb-2 block text-sm font-medium text-text-primary">
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
        </motion.div>
      )}
    </div>
  );
}

export default Odontogram;

