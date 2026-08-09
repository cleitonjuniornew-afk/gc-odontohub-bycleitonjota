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

function Odontogram({
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

  useEffect(() => {
    if (!storageKey) {
      setHasLoadedDraft(true);
      return;
    }

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

  async function persistTooth(
    tooth: Tooth
  ) {
    if (!examId || !patientId) {
      return;
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
          plaque:
            hasPlaque,
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

    if (isSavingExam) return;

    try {
      setIsSavingExam(true);
      setIsSaved(false);

      for (const tooth of teeth) {
        await persistTooth(tooth);
      }

      setIsSaved(true);
      setIsOfflineDraft(false);

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

export default Odontogram;
