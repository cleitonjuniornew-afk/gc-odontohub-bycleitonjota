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

function hasAnySiteData(tooth: Tooth) {
  return Object.values(tooth.sites).some((surface) =>
    Object.values(surface).some(
      (site) =>
        site.probingDepth !== null ||
        site.gingivalRecession !== null ||
        site.bleeding ||
        site.plaque ||
        site.suppuration
    )
  );
}

function toothHasBleeding(tooth: Tooth) {
  return Object.values(tooth.sites).some((surface) =>
    Object.values(surface).some((site) => site.bleeding)
  );
}

function toothHasPlaque(tooth: Tooth) {
  return Object.values(tooth.sites).some((surface) =>
    Object.values(surface).some((site) => site.plaque)
  );
}

function toothHasSuppuration(tooth: Tooth) {
  return Object.values(tooth.sites).some((surface) =>
    Object.values(surface).some((site) => site.suppuration)
  );
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
  const hasBleeding = toothHasBleeding(tooth);
  const hasPlaque = toothHasPlaque(tooth);
  const hasSuppuration = toothHasSuppuration(tooth);

  const statusClass =
    tooth.status === "AUSENTE"
      ? "border-red-500/70 bg-red-500/10 opacity-60"
      : tooth.status === "IMPLANTE"
        ? "border-blue-400 bg-blue-400/10"
        : selected
          ? "border-amber-400 bg-amber-400/10 shadow-[0_0_22px_rgba(245,158,11,0.25)]"
          : hasBleeding
            ? "border-red-400/70 bg-red-400/5"
            : "border-slate-500 bg-slate-900/40 hover:border-amber-400/60";

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
            ? "text-amber-400"
            : "text-slate-400"
        }`}
      >
        {tooth.number}
      </span>

      <span
        className={`relative flex h-16 w-11 items-center justify-center rounded-[45%] border-2 transition-all ${statusClass}`}
      >
        {tooth.status === "AUSENTE" ? (
          <>
            <span className="absolute h-9 w-0.5 rotate-45 rounded-full bg-red-500" />
            <span className="absolute h-9 w-0.5 -rotate-45 rounded-full bg-red-500" />
          </>
        ) : tooth.status === "IMPLANTE" ? (
          <span className="flex h-8 w-6 items-center justify-center rounded-sm border border-blue-400">
            <span className="h-6 w-0.5 bg-blue-400" />
          </span>
        ) : (
          <>
            <span className="h-8 w-7 rounded-[45%] border border-slate-500 bg-slate-800/50" />

            {hasBleeding && (
              <span className="absolute bottom-1 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
            )}

            {hasPlaque && (
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
            )}

            {hasSuppuration && (
              <span className="absolute left-1 top-1 h-1.5 w-1.5 rounded-full bg-blue-400" />
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
      className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 text-center text-sm font-semibold text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
    />
  );
}

function ResultCell({
  value,
  alert = false,
}: {
  value: number | null;
  alert?: boolean;
}) {
  return (
    <div
      className={`flex h-10 min-w-[52px] items-center justify-center rounded-lg border text-sm font-bold ${
        value === null
          ? "border-slate-700 bg-slate-950 text-slate-600"
          : alert
            ? "border-red-500/60 bg-red-500/10 text-red-400"
            : "border-slate-700 bg-slate-900 text-white"
      }`}
    >
      {value ?? "—"}
    </div>
  );
}

function pointLabel(point: Point) {
  if (point === "MESIAL") return "M";
  if (point === "CENTRAL") return "C";
  return "D";
}

function pointName(point: Point) {
  if (point === "MESIAL") return "Mesial";
  if (point === "CENTRAL") return "Central";
  return "Distal";
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
    : `gc-odontohub-periodontia-draft-${patientId ?? "local"}`;

  const [teeth, setTeeth] = useState<Tooth[]>(() => [
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
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveVersionRef = useRef(0);

  const selected = useMemo(
    () =>
      teeth.find(
        (tooth) => tooth.number === selectedTooth
      ),
    [teeth, selectedTooth]
  );

  const selectedIndex = useMemo(
    () =>
      teeth.findIndex(
        (tooth) => tooth.number === selectedTooth
      ),
    [teeth, selectedTooth]
  );

  /*
   * ==========================================================
   * RECUPERAR RASCUNHO LOCAL
   * ==========================================================
   */

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(
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
          typeof parsed?.selectedTooth === "number"
        ) {
          setSelectedTooth(parsed.selectedTooth);
        }

        if (
          parsed?.surface === "VESTIBULAR" ||
          parsed?.surface === "LINGUAL"
        ) {
          setSurface(parsed.surface);
        }

        setIsOfflineDraft(true);
        setIsSaved(false);
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

  /*
   * ==========================================================
   * SALVAMENTO LOCAL AUTOMÁTICO
   * ==========================================================
   */

  useEffect(() => {
    if (!hasLoadedDraft) return;

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          teeth,
          selectedTooth,
          surface,
          updatedAt: new Date().toISOString(),
        })
      );

      setIsOfflineDraft(true);
      setIsSaved(false);
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

  function updateObservation(value: string) {
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

  /*
   * ==========================================================
   * SALVAR UM DENTE NO SUPABASE
   * ==========================================================
   */

  async function persistTooth(tooth: Tooth) {
    if (!examId || !patientId) {
      return true;
    }

    try {
      const savedTooth = await createTooth({
        examId,
        toothNumber: tooth.number,
        status: tooth.status,
      });

      const hasSuppuration =
        toothHasSuppuration(tooth);

      const hasPlaque =
        toothHasPlaque(tooth);

      await updateTooth({
        id: savedTooth.id,
        input: {
          status: tooth.status,
          mobility: tooth.mobility,
          furcationBuccal:
            tooth.buccalFurcation,
          furcationLingual:
            tooth.lingualFurcation,
          suppuration: hasSuppuration,
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
            tooth.sites[currentSurface][point];

          const cal = calculateCAL(site);

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
            bleeding: site.bleeding,
            plaque: site.plaque,
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

  /*
   * ==========================================================
   * AUTOSAVE SUPABASE
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
      clearTimeout(saveTimerRef.current);
    }

    const toothToSave = teeth.find(
      (tooth) =>
        tooth.number === selectedTooth
    );

    if (!toothToSave) return;

    const currentVersion =
      saveVersionRef.current;

    saveTimerRef.current = setTimeout(
      async () => {
        if (
          currentVersion !==
          saveVersionRef.current
        ) {
          return;
        }

        const success =
          await persistTooth(toothToSave);

        if (success) {
          setIsSaved(true);
          setIsOfflineDraft(false);
        }
      },
      900
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

  /*
   * ==========================================================
   * SALVAR EXAME
   * ==========================================================
   */

  async function saveExam() {
    if (!hasLoadedDraft) return;
    if (isSavingExam) return;

    /*
     * Sempre salva localmente.
     */

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          teeth,
          selectedTooth,
          surface,
          updatedAt: new Date().toISOString(),
        })
      );

      setIsSaved(true);
      setIsOfflineDraft(false);
    } catch (error) {
      console.error(
        "ERRO AO SALVAR RASCUNHO:",
        error
      );
    }

    /*
     * Se houver conexão com o exame,
     * sincroniza também com Supabase.
     */

    if (!examId || !patientId) {
      return;
    }

    try {
      setIsSavingExam(true);

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

  /*
   * ==========================================================
   * FINALIZAR EXAME
   * ==========================================================
   */

  async function handleFinalizeExam() {
    if (!examId || !patientId) {
      await saveExam();
      return;
    }

    try {
      setIsSavingExam(true);

      for (const tooth of teeth) {
        await persistTooth(tooth);
      }

      await finalizeExam(examId);

      setIsSaved(true);
      setIsOfflineDraft(false);

      try {
        window.localStorage.removeItem(
          storageKey
        );
      } catch {
        // Não impede a finalização.
      }
    } catch (error) {
      console.error(
        "ERRO AO FINALIZAR EXAME PERIODONTAL:",
        error
      );

      setIsSaved(false);
      setIsOfflineDraft(true);
    } finally {
      setIsSavingExam(false);
    }
  }

  /*
   * ==========================================================
   * LIMPAR
   * ==========================================================
   */

  function resetOdontogram() {
    const confirmed =
      window.confirm(
        "Deseja realmente limpar todos os dados deste exame?"
      );

    if (!confirmed) return;

    setTeeth([
      ...createTeeth(upperTeeth),
      ...createTeeth(lowerTeeth),
    ]);

    setSelectedTooth(null);
    setSurface("VESTIBULAR");
    setIsSaved(false);
    setIsOfflineDraft(false);
    saveVersionRef.current += 1;

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

  /*
   * ==========================================================
   * NAVEGAÇÃO
   * ==========================================================
   */

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

  /*
   * ==========================================================
   * TABELA PERIODONTAL
   * ==========================================================
   */

  function PeriodontalTable() {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>
                  Periodontograma — visão geral
                </CardTitle>

                <p className="mt-1 text-sm text-slate-400">
                  Todos os dentes ficam aqui o tempo
                  todo. Clique em um dente para editar.
                </p>
              </div>

              <Badge
                variant="secondary"
                className="hidden sm:flex"
              >
                Planilha clínica
              </Badge>
            </div>

            <div className="rounded-lg border border-blue-400/20 bg-blue-400/5 px-3 py-2 text-xs text-slate-300">
              <span className="font-semibold text-blue-300">
                Como usar:
              </span>{" "}
              selecione o dente, preencha os valores
              de M, C e D e acompanhe automaticamente
              os resultados nesta tabela.
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full min-w-[1050px] border-collapse">
              <thead>
                <tr className="bg-slate-950">
                  <th
                    rowSpan={2}
                    className="sticky left-0 z-10 border-b border-r border-slate-800 bg-slate-950 px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400"
                  >
                    Dente
                  </th>

                  {teeth.map((tooth) => (
                    <th
                      key={tooth.number}
                      colSpan={3}
                      className={`border-b border-slate-800 px-2 py-2 text-center text-xs font-bold ${
                        selectedTooth === tooth.number
                          ? "bg-amber-400/10 text-amber-400"
                          : "text-slate-300"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedTooth(
                            tooth.number
                          )
                        }
                        className="w-full"
                      >
                        {tooth.number}
                      </button>
                    </th>
                  ))}
                </tr>

                <tr className="bg-slate-900">
                  {teeth.map((tooth) =>
                    points.map((point) => (
                      <th
                        key={`${tooth.number}-${point}`}
                        className="border-b border-r border-slate-800 px-2 py-2 text-center text-[10px] font-bold text-slate-500"
                      >
                        {pointLabel(point)}
                      </th>
                    ))
                  )}
                </tr>
              </thead>

              <tbody>
                <tr className="border-b border-slate-800">
                  <td className="sticky left-0 z-10 border-r border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-white">
                    Profundidade
                  </td>

                  {teeth.map((tooth) =>
                    points.map((point) => {
                      const value =
                        tooth.sites.VESTIBULAR[
                          point
                        ].probingDepth;

                      return (
                        <td
                          key={`${tooth.number}-pd-${point}`}
                          className="border-r border-slate-800 bg-slate-950 p-1"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedTooth(
                                tooth.number
                              )
                            }
                            className="w-full"
                          >
                            <ResultCell
                              value={value}
                              alert={
                                value !== null &&
                                value >= 4
                              }
                            />
                          </button>
                        </td>
                      );
                    })
                  )}
                </tr>

                <tr className="border-b border-slate-800">
                  <td className="sticky left-0 z-10 border-r border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-white">
                    Recessão
                  </td>

                  {teeth.map((tooth) =>
                    points.map((point) => {
                      const value =
                        tooth.sites.VESTIBULAR[
                          point
                        ].gingivalRecession;

                      return (
                        <td
                          key={`${tooth.number}-rec-${point}`}
                          className="border-r border-slate-800 bg-slate-950 p-1"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedTooth(
                                tooth.number
                              )
                            }
                            className="w-full"
                          >
                            <ResultCell
                              value={value}
                            />
                          </button>
                        </td>
                      );
                    })
                  )}
                </tr>

                <tr className="border-b border-slate-800">
                  <td className="sticky left-0 z-10 border-r border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-white">
                    NIC
                  </td>

                  {teeth.map((tooth) =>
                    points.map((point) => {
                      const site =
                        tooth.sites.VESTIBULAR[
                          point
                        ];

                      const cal =
                        calculateCAL(site);

                      return (
                        <td
                          key={`${tooth.number}-cal-${point}`}
                          className="border-r border-slate-800 bg-slate-950 p-1"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedTooth(
                                tooth.number
                              )
                            }
                            className="w-full"
                          >
                            <ResultCell
                              value={cal}
                              alert={
                                cal !== null &&
                                cal >= 4
                              }
                            />
                          </button>
                        </td>
                      );
                    })
                  )}
                </tr>

                <tr>
                  <td className="sticky left-0 z-10 border-r border-slate-800 bg-slate-950 px-3 py-2 text-xs font-bold text-white">
                    Sinais
                  </td>

                  {teeth.map((tooth) =>
                    points.map((point) => {
                      const site =
                        tooth.sites.VESTIBULAR[
                          point
                        ];

                      return (
                        <td
                          key={`${tooth.number}-sign-${point}`}
                          className="border-r border-slate-800 bg-slate-950 p-1"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedTooth(
                                tooth.number
                              )
                            }
                            className="flex h-10 w-full items-center justify-center gap-1 rounded-lg"
                          >
                            {site.bleeding && (
                              <span
                                title="Sangramento"
                                className="h-2.5 w-2.5 rounded-full bg-red-500"
                              />
                            )}

                            {site.plaque && (
                              <span
                                title="Placa"
                                className="h-2.5 w-2.5 rounded-full bg-amber-400"
                              />
                            )}

                            {site.suppuration && (
                              <span
                                title="Supuração"
                                className="h-2.5 w-2.5 rounded-full bg-blue-400"
                              />
                            )}

                            {!site.bleeding &&
                              !site.plaque &&
                              !site.suppuration && (
                                <span className="text-slate-700">
                                  —
                                </span>
                              )}
                          </button>
                        </td>
                      );
                    })
                  )}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              Sangramento
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              Placa
            </span>

            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
              Supuração
            </span>

            <span className="ml-auto">
              M = Mesial · C = Central · D = Distal
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  /*
   * ==========================================================
   * ÁREA DIDÁTICA
   * ==========================================================
   */

  function EducationalGuide() {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-400" />

            <CardTitle>
              Entenda o exame periodontal
            </CardTitle>
          </div>

          <p className="mt-1 text-sm text-slate-400">
            Uma explicação simples para você revisar
            durante o atendimento e, quando quiser,
            explicar ao paciente.
          </p>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="font-bold text-white">
                Profundidade de sondagem
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                É a medida da margem da gengiva até o
                fundo do sulco ou bolsa periodontal.
                Quanto maior a medida, maior atenção
                clínica ela merece.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="font-bold text-white">
                Recessão gengival
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Mostra quanto a gengiva se afastou da
                posição esperada, deixando parte do
                dente mais exposta.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="font-bold text-white">
                NIC
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                É uma medida usada para acompanhar a
                perda de inserção periodontal. Neste
                sistema, ela é calculada a partir da
                profundidade e da recessão cadastradas.
              </p>
            </div>

            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <h4 className="font-bold text-red-400">
                Sangramento
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Indica sangramento à sondagem naquele
                ponto. É um sinal clínico importante
                para avaliar a condição gengival.
              </p>
            </div>

            <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
              <h4 className="font-bold text-amber-400">
                Placa
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Registra a presença de biofilme dental
                naquele sítio.
              </p>
            </div>

            <div className="rounded-xl border border-blue-400/20 bg-blue-400/5 p-4">
              <h4 className="font-bold text-blue-400">
                Supuração
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Registra a presença de secreção
                purulenta no local avaliado.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="font-bold text-white">
                Mobilidade
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Indica o grau de movimentação do dente
                durante a avaliação clínica.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="font-bold text-white">
                Furca
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Avalia o comprometimento da região onde
                as raízes de dentes multirradiculares se
                dividem.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <h4 className="font-bold text-white">
                M · C · D
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Cada dente é dividido em três pontos:
                mesial, central e distal. Assim você
                consegue registrar a condição de
                diferentes áreas do mesmo dente.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-blue-400/20 bg-blue-400/5 p-4">
            <p className="text-sm leading-6 text-slate-300">
              <strong className="text-blue-300">
                Dica para explicar ao paciente:
              </strong>{" "}
              “Nós estamos medindo diferentes pontos
              ao redor dos dentes para verificar como
              está a gengiva e o suporte do dente.
              Essas medidas ajudam a identificar onde
              existe alteração e acompanhar a evolução
              do tratamento.”
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const saving =
    isSavingExam ||
    isCreatingTooth ||
    isUpdatingTooth ||
    isSavingSite ||
    isFinalizingExam;

  return (
    <div className="space-y-6">
      {/* ======================================================
          CABEÇALHO
      ======================================================= */}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>
                Odontograma periodontal
              </CardTitle>

              <p className="mt-1 text-sm text-slate-400">
                Registre a avaliação dente por dente
                e acompanhe todo o periodontograma em
                uma única tabela.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isOfflineDraft ? (
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
                onClick={resetOdontogram}
                disabled={saving}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Limpar
              </Button>

              <Button
                type="button"
                onClick={saveExam}
                disabled={saving}
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
                onClick={handleFinalizeExam}
                disabled={
                  saving ||
                  isFinalizingExam
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
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

              <div>
                <p className="font-semibold text-emerald-300">
                  Salvamento automático ativado
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Cada alteração fica guardada
                  automaticamente neste navegador.
                  Você pode atualizar a página sem perder
                  o que já preencheu.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ======================================================
          ODONTOGRAMA
      ======================================================= */}

      <Card>
        <CardHeader>
          <CardTitle>
            Odontograma
          </CardTitle>

          <p className="mt-1 text-sm text-slate-400">
            Clique em qualquer dente para preencher
            sua avaliação.
          </p>
        </CardHeader>

        <CardContent>
          <div className="w-full overflow-x-auto pb-3">
            <div className="mx-auto min-w-[850px] space-y-8">
              <div>
                <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
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

              <div className="mx-auto h-px max-w-4xl bg-slate-800" />

              <div>
                <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
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

      {/* ======================================================
          TABELA FIXA
      ======================================================= */}

      <PeriodontalTable />

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
            {/* CABEÇALHO DO DENTE */}

            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle>
                        Dente {selected.number}
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

                    <p className="mt-1 text-sm text-slate-400">
                      Preencha primeiro os dados
                      clínicos. Os resultados aparecem
                      automaticamente na tabela acima.
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
                      1. Sondagem periodontal
                    </CardTitle>

                    <p className="mt-1 text-sm text-slate-400">
                      Digite as medidas de cada ponto
                      do dente. M = mesial, C = central
                      e D = distal.
                    </p>
                  </div>

                  <div className="flex rounded-lg border border-slate-700 p-1">
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
                      <tr className="border-b border-slate-800">
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Medida
                        </th>

                        {points.map(
                          (point) => (
                            <th
                              key={point}
                              className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                            >
                              {pointName(
                                point
                              )}{" "}
                              (
                              {pointLabel(
                                point
                              )}
                              )
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      <tr className="border-b border-slate-800/70">
                        <td className="px-3 py-3 text-sm font-semibold text-white">
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

                      <tr className="border-b border-slate-800/70">
                        <td className="px-3 py-3 text-sm font-semibold text-white">
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
                        <td className="px-3 py-3 text-sm font-semibold text-blue-300">
                          NIC calculado
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
                                className="px-3 py-3"
                              >
                                <ResultCell
                                  value={
                                    cal
                                  }
                                  alert={
                                    cal !==
                                      null &&
                                    cal >= 4
                                  }
                                />
                              </td>
                            );
                          }
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 rounded-xl border border-blue-400/20 bg-blue-400/5 p-3">
                  <p className="text-xs leading-5 text-slate-400">
                    <strong className="text-blue-300">
                      O que significa?
                    </strong>{" "}
                    A profundidade mostra a medida
                    encontrada pela sondagem. A recessão
                    mostra a exposição da raiz. O NIC é
                    calculado automaticamente pelo sistema
                    com os valores cadastrados.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* MARCADORES */}

            <Card>
              <CardHeader>
                <CardTitle>
                  2. Marcadores clínicos
                </CardTitle>

                <p className="mt-1 text-sm text-slate-400">
                  Registre o que foi encontrado em cada
                  ponto.
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
                          className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-semibold text-white">
                              {pointName(
                                point
                              )}
                            </span>

                            {site.bleeding && (
                              <CircleAlert className="h-4 w-4 text-red-400" />
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
                                  ? "border-red-500/50 bg-red-500/10 text-red-400"
                                  : "border-slate-700 text-slate-400 hover:border-amber-400/40"
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
                                  ? "border-amber-400/50 bg-amber-400/10 text-amber-400"
                                  : "border-slate-700 text-slate-400 hover:border-amber-400/40"
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
                                  ? "border-blue-400/50 bg-blue-400/10 text-blue-400"
                                  : "border-slate-700 text-slate-400 hover:border-amber-400/40"
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
                  3. Mobilidade e furca
                </CardTitle>

                <p className="mt-1 text-sm text-slate-400">
                  Registre outras características
                  clínicas importantes do dente.
                </p>
              </CardHeader>

              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-white">
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
                      className="h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none focus:border-amber-400"
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
                    <label className="mb-2 block text-sm font-medium text-white">
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
                    <label className="mb-2 block text-sm font-medium text-white">
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
                  4. Observações clínicas
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
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================
          GUIA DIDÁTICO
      ======================================================= */}

      <EducationalGuide />
    </div>
  );
}

/*
 * IMPORTANTE:
 * O page.tsx atual importa:
 *
 * import Odontogram from "./components/odontogram";
 *
 * Por isso precisamos manter o DEFAULT EXPORT.
 */

export default Odontogram;

