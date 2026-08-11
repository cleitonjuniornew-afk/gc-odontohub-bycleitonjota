"use client";

import { useEffect, useMemo, useState } from "react";

/* =========================================================
   TIPOS
========================================================= */

type YesNo = "sim" | "nao" | "nao-informado";

type Grade = "A" | "B" | "C";

type Stage = 1 | 2 | 3 | 4 | null;

type Extent = "Localizada" | "Generalizada" | "Não determinado";

type GingivalCondition =
  | "saude"
  | "gengivite"
  | "periodontite"
  | "necrotizante"
  | "sistemica"
  | "inconclusivo";

type Data = {
  /* Identificação */
  patientName: string;
  age: number | null;

  /* Exame */
  completeExam: YesNo;
  radiographicExam: YesNo;

  /* =====================================================
     DEFINIÇÃO DO CASO
  ===================================================== */

  interdentalCALTeeth: number;
  freeSurfaceCALTeeth: number;

  probingDepthFreeSurface: number;

  /* Possíveis causas não periodontais */
  traumaticRecession: boolean;
  cervicalCaries: boolean;
  secondMolarThirdMolar: boolean;
  endodonticLesion: boolean;
  verticalRootFracture: boolean;

  /* =====================================================
     INFLAMAÇÃO / GENGIVITE
  ===================================================== */

  bleedingOnProbing: boolean;
  plaquePresent: boolean;
  gingivalInflammation: boolean;

  /* =====================================================
     NECROTIZANTE
  ===================================================== */

  papillaryNecrosis: boolean;
  spontaneousBleeding: boolean;
  severePain: boolean;
  pseudomembrane: boolean;
  rapidDestruction: boolean;

  /* =====================================================
     DOENÇA SISTÊMICA
  ===================================================== */

  systemicDisease: boolean;
  systemicDiseaseName: string;

  /* =====================================================
     ESTÁGIO
  ===================================================== */

  maximumCAL: number | null;
  maximumProbingDepth: number | null;
  radiographicBoneLossPercent: number | null;

  boneLossMiddleApicalThird: boolean;
  verticalBoneLoss3mm: boolean;

  furcationII: boolean;
  furcationIII: boolean;

  moderateRidgeDefect: boolean;

  toothLossDueToPeriodontitis: number;

  /* =====================================================
     ESTÁGIO IV
  ===================================================== */

  chewingDysfunction: boolean;
  secondaryOcclusalTraumaMobility2: boolean;
  severeRidgeDefect: boolean;
  occlusalCollapse: boolean;

  remainingTeeth: number;

  /* =====================================================
     EXTENSÃO
  ===================================================== */

  affectedTeeth: number;
  presentTeeth: number;

  molarIncisorPattern: boolean;

  /* =====================================================
     GRAU
  ===================================================== */

  directProgressionAvailable: boolean;
  boneLoss5Years: number | null;

  boneLossAgeRatio: number | null;

  destructionBiofilm:
    | "nao-avaliado"
    | "baixa"
    | "compativel"
    | "excede";

  /* =====================================================
     MODIFICADORES
  ===================================================== */

  smoker: boolean;
  cigarettesPerDay: number;

  diabetes: boolean;
  hba1c: number | null;

  /* =====================================================
     PROGNÓSTICO
  ===================================================== */

  oralHygiene:
    | "nao-avaliado"
    | "boa"
    | "regular"
    | "ruim";

  adherence:
    | "nao-avaliado"
    | "boa"
    | "regular"
    | "ruim";

  maintenancePossible:
    | "nao-avaliado"
    | "sim"
    | "nao";
};

type DiagnosisResult = {
  condition: GingivalCondition;
  diagnosis: string;

  stage: Stage;
  grade: Grade | null;

  extent: Extent;

  prognosis: string;

  confidence: "alta" | "moderada" | "baixa";

  reasons: string[];
  warnings: string[];
  missing: string[];

  gradeReason: string[];
  stageReason: string[];
};

/* =========================================================
   VALORES INICIAIS
========================================================= */

const STORAGE_KEY =
  "gc-odontohub-periodontia-diagnostico-v1";

const initialData: Data = {
  patientName: "",
  age: null,

  completeExam: "nao-informado",
  radiographicExam: "nao-informado",

  interdentalCALTeeth: 0,
  freeSurfaceCALTeeth: 0,

  probingDepthFreeSurface: 0,

  traumaticRecession: false,
  cervicalCaries: false,
  secondMolarThirdMolar: false,
  endodonticLesion: false,
  verticalRootFracture: false,

  bleedingOnProbing: false,
  plaquePresent: false,
  gingivalInflammation: false,

  papillaryNecrosis: false,
  spontaneousBleeding: false,
  severePain: false,
  pseudomembrane: false,
  rapidDestruction: false,

  systemicDisease: false,
  systemicDiseaseName: "",

  maximumCAL: null,
  maximumProbingDepth: null,
  radiographicBoneLossPercent: null,

  boneLossMiddleApicalThird: false,
  verticalBoneLoss3mm: false,

  furcationII: false,
  furcationIII: false,

  moderateRidgeDefect: false,

  toothLossDueToPeriodontitis: 0,

  chewingDysfunction: false,
  secondaryOcclusalTraumaMobility2: false,
  severeRidgeDefect: false,
  occlusalCollapse: false,

  remainingTeeth: 32,

  affectedTeeth: 0,
  presentTeeth: 32,

  molarIncisorPattern: false,

  directProgressionAvailable: false,
  boneLoss5Years: null,

  boneLossAgeRatio: null,

  destructionBiofilm: "nao-avaliado",

  smoker: false,
  cigarettesPerDay: 0,

  diabetes: false,
  hba1c: null,

  oralHygiene: "nao-avaliado",
  adherence: "nao-avaliado",
  maintenancePossible: "nao-avaliado",
};

/* =========================================================
   COMPONENTES PEQUENOS
========================================================= */

function Section({
  number,
  title,
  description,
  children,
}: {
  number: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <div className="sectionHeader">
        <div className="sectionNumber">{number}</div>

        <div>
          <h2>{title}</h2>

          {description && (
            <p className="sectionDescription">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`checkboxRow ${
        disabled ? "disabled" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) =>
          onChange(e.target.checked)
        }
      />

      <span>{label}</span>
    </label>
  );
}

function RadioGroup({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
}) {
  return (
    <div className="radioGroup">
      {options.map((option) => (
        <label
          className={`radioOption ${
            value === option.value
              ? "selected"
              : ""
          }`}
          key={option.value}
        >
          <input
            type="radio"
            value={option.value}
            checked={
              value === option.value
            }
            onChange={(e) =>
              onChange(e.target.value)
            }
          />

          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  help,
}: {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  help?: string;
}) {
  return (
    <div className="field">
      <label>{label}</label>

      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value ?? ""}
        onChange={(e) => {
          if (e.target.value === "") {
            onChange(null);
            return;
          }

          onChange(Number(e.target.value));
        }}
      />

      {help && (
        <span className="help">
          {help}
        </span>
      )}
    </div>
  );
}

/* =========================================================
   MOTOR DE DIAGNÓSTICO
========================================================= */

function calculateDiagnosis(
  data: Data
): DiagnosisResult {
  const reasons: string[] = [];
  const warnings: string[] = [];
  const missing: string[] = [];
  const gradeReason: string[] = [];
  const stageReason: string[] = [];

  /*
   * -------------------------------------------------------
   * 1. EXAME
   * -------------------------------------------------------
   */

  if (data.completeExam !== "sim") {
    missing.push(
      "Confirmação de que o exame periodontal está completo."
    );
  }

  /*
   * -------------------------------------------------------
   * 2. CAUSAS NÃO PERIODONTAIS
   * -------------------------------------------------------
   */

  const nonPeriodontalCause =
    data.traumaticRecession ||
    data.cervicalCaries ||
    data.secondMolarThirdMolar ||
    data.endodonticLesion ||
    data.verticalRootFracture;

  /*
   * -------------------------------------------------------
   * 3. DEFINIÇÃO DO CASO
   * -------------------------------------------------------
   */

  const interdentalCriterion =
    data.interdentalCALTeeth >= 2;

  const freeSurfaceCriterion =
    data.freeSurfaceCALTeeth >= 2 &&
    data.probingDepthFreeSurface > 3;

  const periodontitisCase =
    !nonPeriodontalCause &&
    (
      interdentalCriterion ||
      freeSurfaceCriterion
    );

  /*
   * -------------------------------------------------------
   * 4. NECROTIZANTE
   * -------------------------------------------------------
   */

  const necrotizingPattern =
    data.papillaryNecrosis &&
    (
      data.spontaneousBleeding ||
      data.severePain
    ) &&
    (
      data.pseudomembrane ||
      data.rapidDestruction
    );

  if (necrotizingPattern) {
    return {
      condition: "necrotizante",

      diagnosis:
        "Doença periodontal necrotizante — suspeita clínica",

      stage: null,

      grade: null,

      extent: "Não determinado",

      prognosis:
        "Necessita avaliação clínica específica",

      confidence: "moderada",

      reasons: [
        "Foram informados sinais compatíveis com padrão necrotizante.",
        "Há necrose papilar associada a manifestações clínicas compatíveis.",
      ],

      warnings: [
        "Confirmar clinicamente o diagnóstico e investigar fatores predisponentes.",
      ],

      missing,

      gradeReason: [],

      stageReason: [],
    };
  }

  /*
   * -------------------------------------------------------
   * 5. MANIFESTAÇÃO SISTÊMICA
   * -------------------------------------------------------
   */

  if (
    data.systemicDisease &&
    !periodontitisCase
  ) {
    return {
      condition: "sistemica",

      diagnosis:
        "Manifestação periodontal associada a condição sistêmica — avaliar",

      stage: null,

      grade: null,

      extent: "Não determinado",

      prognosis:
        "Depende da condição sistêmica e do quadro periodontal",

      confidence: "moderada",

      reasons: [
        data.systemicDiseaseName
          ? `Condição informada: ${data.systemicDiseaseName}.`
          : "Foi informada a presença de condição sistêmica.",
      ],

      warnings: [
        "Não classificar automaticamente como periodontite convencional sem avaliar a condição sistêmica.",
      ],

      missing,

      gradeReason: [],

      stageReason: [],
    };
  }

  /*
   * -------------------------------------------------------
   * 6. NÃO É PERIODONTITE
   * -------------------------------------------------------
   */

  if (!periodontitisCase) {
    if (
      data.gingivalInflammation ||
      data.bleedingOnProbing
    ) {
      reasons.push(
        "Há sinais clínicos de inflamação gengival."
      );

      if (data.plaquePresent) {
        reasons.push(
          "Há presença de biofilme."
        );
      }

      return {
        condition: "gengivite",

        diagnosis:
          "Gengivite — quadro compatível com os dados informados",

        stage: null,

        grade: null,

        extent: "Não determinado",

        prognosis:
          data.oralHygiene === "ruim"
            ? "Favorável com controle de biofilme, se houver adesão"
            : "Favorável",

        confidence:
          data.completeExam === "sim"
            ? "moderada"
            : "baixa",

        reasons,

        warnings: nonPeriodontalCause
          ? [
              "Há fatores que podem explicar perda de inserção por causa não periodontal.",
            ]
          : [],

        missing,

        gradeReason: [],

        stageReason: [],
      };
    }

    return {
      condition: "saude",

      diagnosis:
        "Saúde periodontal — sem critérios informados para periodontite",

      stage: null,

      grade: null,

      extent: "Não determinado",

      prognosis: "Favorável",

      confidence:
        data.completeExam === "sim"
          ? "moderada"
          : "baixa",

      reasons: [
        "Não foram preenchidos critérios suficientes para caracterizar periodontite.",
        "Também não foram informados sinais suficientes de inflamação gengival.",
      ],

      warnings: [],

      missing,

      gradeReason: [],

      stageReason: [],
    };
  }

  /*
   * -------------------------------------------------------
   * 7. ESTÁGIO
   * -------------------------------------------------------
   */

  let stage: Stage = 1;

  const cal =
    data.maximumCAL ?? 0;

  const probingDepth =
    data.maximumProbingDepth ?? 0;

  const boneLoss =
    data.radiographicBoneLossPercent ?? 0;

  /*
   * Estágio I
   *
   * CAL 1–2 mm
   * perda óssea <15%
   */

  stage = 1;

  if (
    cal >= 3 ||
    boneLoss >= 15 ||
    probingDepth >= 5
  ) {
    stage = 2;
  }

  /*
   * Estágio III
   *
   * CAL ≥5
   * ou perda óssea até terço médio/apical
   * ou PS ≥6
   * ou perda vertical ≥3
   * ou furca II/III
   */

  if (
    cal >= 5 ||
    data.boneLossMiddleApicalThird ||
    probingDepth >= 6 ||
    data.verticalBoneLoss3mm ||
    data.furcationII ||
    data.furcationIII
  ) {
    stage = 3;
  }

  /*
   * Complexidade de estágio IV
   */

  const stageIVComplexity =
    data.chewingDysfunction ||
    data.secondaryOcclusalTraumaMobility2 ||
    data.severeRidgeDefect ||
    data.occlusalCollapse ||
    data.remainingTeeth < 20 ||
    data.toothLossDueToPeriodontitis >= 5;

  if (
    stage === 3 &&
    stageIVComplexity
  ) {
    stage = 4;
  }

  /*
   * -------------------------------------------------------
   * EXPLICAÇÃO DO ESTÁGIO
   * -------------------------------------------------------
   */

  if (cal >= 5) {
    stageReason.push(
      `Maior CAL informado: ${cal} mm.`
    );
  }

  if (
    cal >= 3 &&
    cal < 5
  ) {
    stageReason.push(
      `Maior CAL informado: ${cal} mm, compatível pelo menos com estágio II.`
    );
  }

  if (boneLoss >= 15) {
    stageReason.push(
      `Perda óssea radiográfica informada: ${boneLoss}%.`
    );
  }

  if (probingDepth >= 6) {
    stageReason.push(
      `Profundidade de sondagem máxima: ${probingDepth} mm.`
    );
  }

  if (data.verticalBoneLoss3mm) {
    stageReason.push(
      "Foi informado defeito ósseo vertical ≥3 mm."
    );
  }

  if (
    data.furcationII ||
    data.furcationIII
  ) {
    stageReason.push(
      "Foi informada lesão de furca classe II/III."
    );
  }

  if (
    data.boneLossMiddleApicalThird
  ) {
    stageReason.push(
      "Foi informada perda óssea atingindo o terço médio/apical."
    );
  }

  if (
    stage === 4 &&
    data.chewingDysfunction
  ) {
    stageReason.push(
      "Foi informada disfunção mastigatória."
    );
  }

  if (
    stage === 4 &&
    data.secondaryOcclusalTraumaMobility2
  ) {
    stageReason.push(
      "Foi informado trauma oclusal secundário associado a mobilidade ≥2."
    );
  }

  if (
    stage === 4 &&
    data.severeRidgeDefect
  ) {
    stageReason.push(
      "Foi informado defeito de rebordo grave."
    );
  }

  if (
    stage === 4 &&
    data.occlusalCollapse
  ) {
    stageReason.push(
      "Foi informado colapso oclusal."
    );
  }

  if (
    stage === 4 &&
    data.remainingTeeth < 20
  ) {
    stageReason.push(
      `Foram informados ${data.remainingTeeth} dentes remanescentes.`
    );
  }

  /*
   * -------------------------------------------------------
   * 8. EXTENSÃO
   * -------------------------------------------------------
   */

  let extent: Extent = "Não determinado";

  if (
    data.presentTeeth > 0
  ) {
    const percentage =
      (
        data.affectedTeeth /
        data.presentTeeth
      ) * 100;

    extent =
      percentage < 30
        ? "Localizada"
        : "Generalizada";

    reasons.push(
      `${data.affectedTeeth} de ${data.presentTeeth} dentes afetados (${percentage.toFixed(
        1
      )}%).`
    );
  } else {
    missing.push(
      "Número de dentes presentes."
    );
  }

  if (data.molarIncisorPattern) {
    extent =
      extent === "Generalizada"
        ? "Generalizada — padrão molar/incisivo"
        : "Localizada — padrão molar/incisivo";
  }

  /*
   * -------------------------------------------------------
   * 9. GRAU
   * -------------------------------------------------------
   */

  let grade: Grade = "B";

  /*
   * Por padrão, Grau B.
   */

  gradeReason.push(
    "Na ausência de evidência suficiente para Grau A ou C, o caso é inicialmente considerado Grau B."
  );

  /*
   * Evidência direta
   */

  if (
    data.directProgressionAvailable &&
    data.boneLoss5Years !== null
  ) {
    const loss =
      data.boneLoss5Years;

    if (loss === 0) {
      grade = "A";

      gradeReason.push(
        "Não foi informada perda óssea nos últimos 5 anos → Grau A."
      );
    } else if (loss < 2) {
      grade = "B";

      gradeReason.push(
        `Perda óssea em 5 anos de ${loss} mm → Grau B.`
      );
    } else {
      grade = "C";

      gradeReason.push(
        `Perda óssea em 5 anos de ${loss} mm → Grau C.`
      );
    }
  }

  /*
   * Evidência indireta
   */

  else if (
    !data.directProgressionAvailable &&
    data.boneLossAgeRatio !== null
  ) {
    const ratio =
      data.boneLossAgeRatio;

    if (ratio < 0.25) {
      grade = "A";

      gradeReason.push(
        `Relação perda óssea/idade = ${ratio.toFixed(
          2
        )} → Grau A.`
      );
    } else if (ratio <= 1) {
      grade = "B";

      gradeReason.push(
        `Relação perda óssea/idade = ${ratio.toFixed(
          2
        )} → Grau B.`
      );
    } else {
      grade = "C";

      gradeReason.push(
        `Relação perda óssea/idade = ${ratio.toFixed(
          2
        )} → Grau C.`
      );
    }
  }

  /*
   * Fenótipo de destruição
   */

  if (
    data.destructionBiofilm ===
    "baixa"
  ) {
    if (grade !== "C") {
      grade = "A";
    }

    gradeReason.push(
      "Destruição informada como baixa em relação ao biofilme."
    );
  }

  if (
    data.destructionBiofilm ===
    "excede"
  ) {
    grade = "C";

    gradeReason.push(
      "Destruição informada como excedendo o esperado para o biofilme → Grau C."
    );
  }

  /*
   * -------------------------------------------------------
   * 10. TABAGISMO
   * -------------------------------------------------------
   */

  if (data.smoker) {
    if (
      data.cigarettesPerDay >= 10
    ) {
      grade = "C";

      gradeReason.push(
        "Tabagismo ≥10 cigarros/dia → modificador para Grau C."
      );
    } else {
      if (grade === "A") {
        grade = "B";
      }

      gradeReason.push(
        "Tabagismo <10 cigarros/dia → modificador de risco."
      );
    }
  }

  /*
   * -------------------------------------------------------
   * 11. DIABETES
   * -------------------------------------------------------
   */

  if (
    data.diabetes &&
    data.hba1c !== null
  ) {
    if (data.hba1c >= 7) {
      grade = "C";

      gradeReason.push(
        `HbA1c ${data.hba1c}% → modificador para Grau C.`
      );
    } else {
      if (grade === "A") {
        grade = "B";
      }

      gradeReason.push(
        `Diabetes com HbA1c ${data.hba1c}% → fator modificador.`
      );
    }
  }

  /*
   * -------------------------------------------------------
   * 12. PROGNÓSTICO
   * -------------------------------------------------------
   */

  let prognosis =
    "Favorável";

  if (
    stage === 4 ||
    grade === "C"
  ) {
    prognosis =
      "Reservado";

    warnings.push(
      "Há maior complexidade e/ou maior risco de progressão."
    );
  } else if (
    stage === 3
  ) {
    prognosis =
      "Cauteloso";

    warnings.push(
      "O estágio elevado exige avaliação individual dos dentes."
    );
  } else if (
    data.oralHygiene === "ruim" ||
    data.adherence === "ruim"
  ) {
    prognosis =
      "Questionável";

    warnings.push(
      "Controle de biofilme e/ou adesão insuficiente pode comprometer o resultado."
    );
  }

  if (
    data.maintenancePossible ===
    "nao"
  ) {
    prognosis =
      "Reservado";

    warnings.push(
      "Foi informado que a manutenção periodontal adequada pode não ser possível."
    );
  }

  /*
   * -------------------------------------------------------
   * 13. CONFIANÇA
   * -------------------------------------------------------
   */

  let confidence:
    | "alta"
    | "moderada"
    | "baixa" =
    "alta";

  if (
    data.completeExam !== "sim"
  ) {
    confidence = "baixa";
  } else if (
    data.radiographicExam !== "sim"
  ) {
    confidence = "moderada";

    warnings.push(
      "Exame radiográfico não confirmado."
    );
  }

  if (
    data.maximumCAL === null
  ) {
    missing.push(
      "Maior CAL."
    );
  }

  if (
    data.maximumProbingDepth === null
  ) {
    missing.push(
      "Maior profundidade de sondagem."
    );
  }

  if (
    data.radiographicBoneLossPercent ===
    null
  ) {
    missing.push(
      "Percentual de perda óssea radiográfica."
    );
  }

  /*
   * -------------------------------------------------------
   * 14. RESULTADO FINAL
   * -------------------------------------------------------
   */

  const diagnosis =
    `Periodontite — estágio ${stage}, grau ${grade}, ${extent.toLowerCase()}`;

  reasons.unshift(
    "Os critérios informados são compatíveis com periodontite."
  );

  if (
    data.interdentalCALTeeth >= 2
  ) {
    reasons.push(
      `Perda de inserção interdental informada em ${data.interdentalCALTeeth} dentes não adjacentes.`
    );
  }

  if (
    data.freeSurfaceCALTeeth >= 2 &&
    data.probingDepthFreeSurface > 3
  ) {
    reasons.push(
      "Foi informado critério de perda de inserção em face livre associado a profundidade de sondagem >3 mm."
    );
  }

  return {
    condition: "periodontite",

    diagnosis,

    stage,

    grade,

    extent,

    prognosis,

    confidence,

    reasons,

    warnings,

    missing,

    gradeReason,

    stageReason,
  };
}

/* =========================================================
   PÁGINA
========================================================= */

export default function DiagnosticoPeriodontalPage() {
  const [data, setData] =
    useState<Data>(initialData);

  const [saved, setSaved] =
    useState(false);

  const [showResult, setShowResult] =
    useState(true);

  /*
   * -------------------------------------------------------
   * CARREGAR
   * -------------------------------------------------------
   */

  useEffect(() => {
    try {
      const savedData =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (savedData) {
        setData({
          ...initialData,
          ...JSON.parse(savedData),
        });
      }
    } catch {
      // ignora erro de leitura
    }
  }, []);

  /*
   * -------------------------------------------------------
   * SALVAR AUTOMATICAMENTE
   * -------------------------------------------------------
   */

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );

      setSaved(true);

      const timer =
        setTimeout(() => {
          setSaved(false);
        }, 1500);

      return () =>
        clearTimeout(timer);
    } catch {
      setSaved(false);
    }
  }, [data]);

  /*
   * -------------------------------------------------------
   * ATUALIZAR CAMPO
   * -------------------------------------------------------
   */

  function update<K extends keyof Data>(
    field: K,
    value: Data[K]
  ) {
    setData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /*
   * -------------------------------------------------------
   * RESULTADO
   * -------------------------------------------------------
   */

  const result = useMemo(
    () => calculateDiagnosis(data),
    [data]
  );

  /*
   * -------------------------------------------------------
   * LIMPAR
   * -------------------------------------------------------
   */

  function clearForm() {
    const confirmed =
      window.confirm(
        "Deseja apagar todos os dados deste diagnóstico?"
      );

    if (!confirmed) return;

    setData(initialData);

    localStorage.removeItem(
      STORAGE_KEY
    );
  }

  /*
   * -------------------------------------------------------
   * NAVEGAÇÃO
   * -------------------------------------------------------
   */

  function goToPeriodontogram() {
    window.location.href =
      "/periodontia";
  }

  return (
    <main className="page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="topbar">

        <div className="headerLeft">

          <button
            className="backButton"
            onClick={
              goToPeriodontogram
            }
          >
            ←
          </button>

          <div>
            <div className="eyebrow">
              PERIODONTIA
            </div>

            <h1>
              Diagnóstico periodontal
            </h1>

            <p>
              Classificação clínica automática
              baseada nos dados informados.
            </p>
          </div>

        </div>

        <div className="headerActions">

          {saved && (
            <span className="saved">
              ✓ Salvo
            </span>
          )}

          <button
            className="secondaryButton"
            onClick={clearForm}
          >
            Limpar
          </button>

        </div>

      </header>

      {/* =================================================
          NAVEGAÇÃO
      ================================================= */}

      <nav className="moduleNav">

        <button
          className="moduleButton"
          onClick={
            goToPeriodontogram
          }
        >
          Periodontograma
        </button>

        <button className="moduleButton active">
          Diagnóstico
        </button>

      </nav>

      <div className="layout">

        {/* =================================================
            FORMULÁRIO
        ================================================= */}

        <div className="form">

          {/* ===============================================
              1 — IDENTIFICAÇÃO
          =============================================== */}

          <Section
            number={1}
            title="Identificação"
            description="Informações básicas do paciente e do exame."
          >

            <div className="grid two">

              <div className="field">

                <label>
                  Paciente
                </label>

                <input
                  type="text"
                  value={
                    data.patientName
                  }
                  placeholder="Nome do paciente"
                  onChange={(e) =>
                    update(
                      "patientName",
                      e.target.value
                    )
                  }
                />

              </div>

              <NumberField
                label="Idade"
                value={data.age}
                min={0}
                max={120}
                onChange={(value) =>
                  update(
                    "age",
                    value
                  )
                }
                help="Necessária para alguns cálculos de Grau."
              />

            </div>

            <div className="question">

              <label>
                O exame periodontal está completo?
              </label>

              <RadioGroup
                value={
                  data.completeExam
                }
                onChange={(value) =>
                  update(
                    "completeExam",
                    value as YesNo
                  )
                }
                options={[
                  {
                    value:
                      "sim",
                    label:
                      "Sim",
                  },
                  {
                    value:
                      "nao",
                    label:
                      "Não",
                  },
                  {
                    value:
                      "nao-informado",
                    label:
                      "Ainda não informado",
                  },
                ]}
              />

            </div>

            <div className="question">

              <label>
                Exame radiográfico disponível?
              </label>

              <RadioGroup
                value={
                  data.radiographicExam
                }
                onChange={(value) =>
                  update(
                    "radiographicExam",
                    value as YesNo
                  )
                }
                options={[
                  {
                    value:
                      "sim",
                    label:
                      "Sim",
                  },
                  {
                    value:
                      "nao",
                    label:
                      "Não",
                  },
                  {
                    value:
                      "nao-informado",
                    label:
                      "Ainda não informado",
                  },
                ]}
              />

            </div>

          </Section>

          {/* ===============================================
              2 — DEFINIÇÃO DO CASO
          =============================================== */}

          <Section
            number={2}
            title="Definição do caso"
            description="Primeiro determine se existem critérios para periodontite."
          >

            <NumberField
              label="Quantos dentes não adjacentes apresentam CAL interdental compatível com perda de inserção?"
              value={
                data.interdentalCALTeeth
              }
              min={0}
              max={32}
              onChange={(value) =>
                update(
                  "interdentalCALTeeth",
                  value ?? 0
                )
              }
              help="Informe o número de dentes que atende ao critério clínico."
            />

            <NumberField
              label="Quantos dentes apresentam CAL em face livre ≥3 mm associado a profundidade de sondagem >3 mm?"
              value={
                data.freeSurfaceCALTeeth
              }
              min={0}
              max={32}
              onChange={(value) =>
                update(
                  "freeSurfaceCALTeeth",
                  value ?? 0
                )
              }
            />

            <NumberField
              label="Profundidade de sondagem nesses sítios de face livre"
              value={
                data.probingDepthFreeSurface
              }
              min={0}
              step={0.5}
              onChange={(value) =>
                update(
                  "probingDepthFreeSurface",
                  value ?? 0
                )
              }
              help="Usado para verificar o critério de face livre."
            />

            <div className="subTitle">
              A perda de inserção pode ser explicada por outra causa?
            </div>

            <div className="checkList">

              <Checkbox
                label="Recessão gengival de origem traumática"
                checked={
                  data.traumaticRecession
                }
                onChange={(value) =>
                  update(
                    "traumaticRecession",
                    value
                  )
                }
              />

              <Checkbox
                label="Cárie cervical"
                checked={
                  data.cervicalCaries
                }
                onChange={(value) =>
                  update(
                    "cervicalCaries",
                    value
                  )
                }
              />

              <Checkbox
                label="Distal do segundo molar relacionada ao terceiro molar"
                checked={
                  data.secondMolarThirdMolar
                }
                onChange={(value) =>
                  update(
                    "secondMolarThirdMolar",
                    value
                  )
                }
              />

              <Checkbox
                label="Lesão endodôntica com envolvimento periodontal"
                checked={
                  data.endodonticLesion
                }
                onChange={(value) =>
                  update(
                    "endodonticLesion",
                    value
                  )
                }
              />

              <Checkbox
                label="Fratura radicular vertical"
                checked={
                  data.verticalRootFracture
                }
                onChange={(value) =>
                  update(
                    "verticalRootFracture",
                    value
                  )
                }
              />

            </div>

          </Section>

          {/* ===============================================
              3 — GENGIVA
          =============================================== */}

          <Section
            number={3}
            title="Condição gengival"
            description="Avalie sinais clínicos de inflamação."
          >

            <div className="checkList">

              <Checkbox
                label="Sangramento à sondagem"
                checked={
                  data.bleedingOnProbing
                }
                onChange={(value) =>
                  update(
                    "bleedingOnProbing",
                    value
                  )
                }
              />

              <Checkbox
                label="Presença de biofilme"
                checked={
                  data.plaquePresent
                }
                onChange={(value) =>
                  update(
                    "plaquePresent",
                    value
                  )
                }
              />

              <Checkbox
                label="Inflamação gengival clinicamente evidente"
                checked={
                  data.gingivalInflammation
                }
                onChange={(value) =>
                  update(
                    "gingivalInflammation",
                    value
                  )
                }
              />

            </div>

          </Section>

          {/* ===============================================
              4 — NECROTIZANTE / SISTÊMICA
          =============================================== */}

          <Section
            number={4}
            title="Diagnóstico diferencial"
            description="Verifique padrões que exigem classificação específica."
          >

            <div className="subTitle">
              Possíveis características necrotizantes
            </div>

            <div className="checkList">

              <Checkbox
                label="Necrose de papila"
                checked={
                  data.papillaryNecrosis
                }
                onChange={(value) =>
                  update(
                    "papillaryNecrosis",
                    value
                  )
                }
              />

              <Checkbox
                label="Sangramento espontâneo"
                checked={
                  data.spontaneousBleeding
                }
                onChange={(value) =>
                  update(
                    "spontaneousBleeding",
                    value
                  )
                }
              />

              <Checkbox
                label="Dor intensa"
                checked={
                  data.severePain
                }
                onChange={(value) =>
                  update(
                    "severePain",
                    value
                  )
                }
              />

              <Checkbox
                label="Pseudomembrana"
                checked={
                  data.pseudomembrane
                }
                onChange={(value) =>
                  update(
                    "pseudomembrane",
                    value
                  )
                }
              />

              <Checkbox
                label="Destruição tecidual rápida"
                checked={
                  data.rapidDestruction
                }
                onChange={(value) =>
                  update(
                    "rapidDestruction",
                    value
                  )
                }
              />

            </div>

            <div className="divider" />

            <div className="subTitle">
              Condição sistêmica relevante
            </div>

            <Checkbox
              label="Existe doença/condição sistêmica que possa estar relacionada ao quadro periodontal?"
              checked={
                data.systemicDisease
              }
              onChange={(value) =>
                update(
                  "systemicDisease",
                  value
                )
              }
            />

            {data.systemicDisease && (
              <div className="field">

                <label>
                  Qual condição?
                </label>

                <input
                  type="text"
                  value={
                    data.systemicDiseaseName
                  }
                  onChange={(e) =>
                    update(
                      "systemicDiseaseName",
                      e.target.value
                    )
                  }
                  placeholder="Descreva a condição"
                />

              </div>
            )}

          </Section>

          {/* ===============================================
              5 — ESTÁGIO
          =============================================== */}

          <Section
            number={5}
            title="Estágio — gravidade"
            description="Informe os maiores valores encontrados no exame."
          >

            <div className="grid two">

              <NumberField
                label="Maior CAL — mm"
                value={
                  data.maximumCAL
                }
                min={0}
                step={0.5}
                onChange={(value) =>
                  update(
                    "maximumCAL",
                    value
                  )
                }
              />

              <NumberField
                label="Maior profundidade de sondagem — mm"
                value={
                  data.maximumProbingDepth
                }
                min={0}
                step={0.5}
                onChange={(value) =>
                  update(
                    "maximumProbingDepth",
                    value
                  )
                }
              />

            </div>

            <NumberField
              label="Maior perda óssea radiográfica — %"
              value={
                data.radiographicBoneLossPercent
              }
              min={0}
              max={100}
              step={0.1}
              onChange={(value) =>
                update(
                  "radiographicBoneLossPercent",
                  value
                )
              }
              help="Informe a maior perda óssea radiográfica observada."
            />

            <div className="subTitle">
              Características de complexidade
            </div>

            <div className="checkList">

              <Checkbox
                label="Perda óssea atingindo o terço médio/apical"
                checked={
                  data.boneLossMiddleApicalThird
                }
                onChange={(value) =>
                  update(
                    "boneLossMiddleApicalThird",
                    value
                  )
                }
              />

              <Checkbox
                label="Perda óssea vertical ≥3 mm"
                checked={
                  data.verticalBoneLoss3mm
                }
                onChange={(value) =>
                  update(
                    "verticalBoneLoss3mm",
                    value
                  )
                }
              />

              <Checkbox
                label="Furca classe II"
                checked={
                  data.furcationII
                }
                onChange={(value) =>
                  update(
                    "furcationII",
                    value
                  )
                }
              />

              <Checkbox
                label="Furca classe III"
                checked={
                  data.furcationIII
                }
                onChange={(value) =>
                  update(
                    "furcationIII",
                    value
                  )
                }
              />

              <Checkbox
                label="Defeito de rebordo moderado"
                checked={
                  data.moderateRidgeDefect
                }
                onChange={(value) =>
                  update(
                    "moderateRidgeDefect",
                    value
                  )
                }
              />

            </div>

            <NumberField
              label="Número de dentes perdidos devido à periodontite"
              value={
                data.toothLossDueToPeriodontitis
              }
              min={0}
              max={32}
              onChange={(value) =>
                update(
                  "toothLossDueToPeriodontitis",
                  value ?? 0
                )
              }
            />

          </Section>

          {/* ===============================================
              6 — ESTÁGIO IV
          =============================================== */}

          <Section
            number={6}
            title="Complexidade — possibilidade de estágio IV"
            description="Marque somente características realmente presentes."
          >

            <div className="checkList">

              <Checkbox
                label="Disfunção mastigatória"
                checked={
                  data.chewingDysfunction
                }
                onChange={(value) =>
                  update(
                    "chewingDysfunction",
                    value
                  )
                }
              />

              <Checkbox
                label="Trauma oclusal secundário associado a mobilidade ≥2"
                checked={
                  data.secondaryOcclusalTraumaMobility2
                }
                onChange={(value) =>
                  update(
                    "secondaryOcclusalTraumaMobility2",
                    value
                  )
                }
              />

              <Checkbox
                label="Defeito de rebordo grave"
                checked={
                  data.severeRidgeDefect
                }
                onChange={(value) =>
                  update(
                    "severeRidgeDefect",
                    value
                  )
                }
              />

              <Checkbox
                label="Colapso oclusal / alteração importante da função"
                checked={
                  data.occlusalCollapse
                }
                onChange={(value) =>
                  update(
                    "occlusalCollapse",
                    value
                  )
                }
              />

            </div>

            <div className="grid two">

              <NumberField
                label="Dentes remanescentes"
                value={
                  data.remainingTeeth
                }
                min={0}
                max={32}
                onChange={(value) =>
                  update(
                    "remainingTeeth",
                    value ?? 0
                  )
                }
                help="O sistema sinaliza <20 dentes."
              />

              <NumberField
                label="Dentes afetados pela periodontite"
                value={
                  data.affectedTeeth
                }
                min={0}
                max={32}
                onChange={(value) =>
                  update(
                    "affectedTeeth",
                    value ?? 0
                  )
                }
              />

            </div>

            <NumberField
              label="Total de dentes presentes"
              value={
                data.presentTeeth
              }
              min={1}
              max={32}
              onChange={(value) =>
                update(
                  "presentTeeth",
                  value ?? 32
                )
              }
            />

          </Section>

          {/* ===============================================
              7 — EXTENSÃO
          =============================================== */}

          <Section
            number={7}
            title="Extensão e padrão"
            description="A extensão é calculada automaticamente pelo número de dentes afetados."
          >

            <div className="extentPreview">

              <div>
                <strong>
                  Dentes afetados
                </strong>

                <span>
                  {data.affectedTeeth}
                </span>
              </div>

              <div>
                <strong>
                  Dentes presentes
                </strong>

                <span>
                  {data.presentTeeth}
                </span>
              </div>

              <div>
                <strong>
                  Percentual
                </strong>

                <span>
                  {data.presentTeeth > 0
                    ? `${(
                        (data.affectedTeeth /
                          data.presentTeeth) *
                        100
                      ).toFixed(1)}%`
                    : "—"}
                </span>
              </div>

            </div>

            <Checkbox
              label="Padrão molar/incisivo"
              checked={
                data.molarIncisorPattern
              }
              onChange={(value) =>
                update(
                  "molarIncisorPattern",
                  value
                )
              }
            />

            <div className="infoBox">
              <strong>
                Regra utilizada
              </strong>

              <p>
                Menos de 30% dos dentes
                afetados → localizada.
                A partir de 30% → generalizada.
                O padrão molar/incisivo é
                registrado separadamente.
              </p>
            </div>

          </Section>

          {/* ===============================================
              8 — GRAU
          =============================================== */}

          <Section
            number={8}
            title="Grau — progressão"
            description="O sistema prioriza evidência direta quando disponível."
          >

            <Checkbox
              label="Tenho dados longitudinais confiáveis para avaliar progressão"
              checked={
                data.directProgressionAvailable
              }
              onChange={(value) =>
                update(
                  "directProgressionAvailable",
                  value
                )
              }
            />

            {data.directProgressionAvailable ? (

              <NumberField
                label="Perda óssea nos últimos 5 anos — mm"
                value={
                  data.boneLoss5Years
                }
                min={0}
                step={0.1}
                onChange={(value) =>
                  update(
                    "boneLoss5Years",
                    value
                  )
                }
                help="0 = A | <2 mm = B | ≥2 mm = C"
              />

            ) : (

              <NumberField
                label="Relação perda óssea / idade"
                value={
                  data.boneLossAgeRatio
                }
                min={0}
                step={0.01}
                onChange={(value) =>
                  update(
                    "boneLossAgeRatio",
                    value
                  )
                }
                help="<0,25 = A | 0,25–1,0 = B | >1,0 = C"
              />

            )}

            <div className="field">

              <label>
                Destruição periodontal em relação ao biofilme
              </label>

              <select
                value={
                  data.destructionBiofilm
                }
                onChange={(e) =>
                  update(
                    "destructionBiofilm",
                    e.target.value as Data[
                      "destructionBiofilm"
                    ]
                  )
                }
              >

                <option value="nao-avaliado">
                  Não avaliado
                </option>

                <option value="baixa">
                  Destruição baixa em relação ao biofilme
                </option>

                <option value="compativel">
                  Destruição compatível com o biofilme
                </option>

                <option value="excede">
                  Destruição excede o esperado para o biofilme
                </option>

              </select>

            </div>

          </Section>

          {/* ===============================================
              9 — TABAGISMO / DIABETES
          =============================================== */}

          <Section
            number={9}
            title="Fatores modificadores"
            description="Fatores que podem modificar a classificação do grau."
          >

            <div className="subTitle">
              Tabagismo
            </div>

            <Checkbox
              label="Paciente é fumante"
              checked={
                data.smoker
              }
              onChange={(value) =>
                update(
                  "smoker",
                  value
                )
              }
            />

            {data.smoker && (
              <NumberField
                label="Cigarros por dia"
                value={
                  data.cigarettesPerDay
                }
                min={0}
                onChange={(value) =>
                  update(
                    "cigarettesPerDay",
                    value ?? 0
                  )
                }
                help="<10 e ≥10 cigarros/dia são considerados separadamente."
              />
            )}

            <div className="divider" />

            <div className="subTitle">
              Diabetes
            </div>

            <Checkbox
              label="Paciente possui diabetes"
              checked={
                data.diabetes
              }
              onChange={(value) =>
                update(
                  "diabetes",
                  value
                )
              }
            />

            {data.diabetes && (
              <NumberField
                label="HbA1c — %"
                value={
                  data.hba1c
                }
                min={0}
                max={20}
                step={0.1}
                onChange={(value) =>
                  update(
                    "hba1c",
                    value
                  )
                }
                help="<7% e ≥7% são considerados separadamente."
              />
            )}

          </Section>

          {/* ===============================================
              10 — PROGNÓSTICO
          =============================================== */}

          <Section
            number={10}
            title="Prognóstico e manutenção"
            description="Informações clínicas adicionais para a estimativa geral."
          >

            <div className="field">

              <label>
                Controle de higiene oral
              </label>

              <select
                value={
                  data.oralHygiene
                }
                onChange={(e) =>
                  update(
                    "oralHygiene",
                    e.target.value as Data[
                      "oralHygiene"
                    ]
                  )
                }
              >

                <option value="nao-avaliado">
                  Não avaliado
                </option>

                <option value="boa">
                  Boa
                </option>

                <option value="regular">
                  Regular
                </option>

                <option value="ruim">
                  Ruim
                </option>

              </select>

            </div>

            <div className="field">

              <label>
                Adesão esperada ao tratamento/manutenção
              </label>

              <select
                value={
                  data.adherence
                }
                onChange={(e) =>
                  update(
                    "adherence",
                    e.target.value as Data[
                      "adherence"
                    ]
                  )
                }
              >

                <option value="nao-avaliado">
                  Não avaliado
                </option>

                <option value="boa">
                  Boa
                </option>

                <option value="regular">
                  Regular
                </option>

                <option value="ruim">
                  Ruim
                </option>

              </select>

            </div>

            <div className="field">

              <label>
                A manutenção periodontal adequada é possível?
              </label>

              <select
                value={
                  data.maintenancePossible
                }
                onChange={(e) =>
                  update(
                    "maintenancePossible",
                    e.target.value as Data[
                      "maintenancePossible"
                    ]
                  )
                }
              >

                <option value="nao-avaliado">
                  Não avaliado
                </option>

                <option value="sim">
                  Sim
                </option>

                <option value="nao">
                  Não
                </option>

              </select>

            </div>

          </Section>

        </div>

        {/* =================================================
            RESULTADO
        ================================================= */}

        <aside className="resultColumn">

          <div className="resultCard">

            <div className="resultHeader">

              <div>
                <span className="resultEyebrow">
                  RESULTADO AUTOMÁTICO
                </span>

                <h2>
                  {result.condition ===
                  "periodontite"
                    ? "Classificação periodontal"
                    : "Resultado clínico"}
                </h2>
              </div>

              <button
                className="collapseButton"
                onClick={() =>
                  setShowResult(
                    !showResult
                  )
                }
              >
                {showResult
                  ? "Ocultar"
                  : "Mostrar"}
              </button>

            </div>

            {showResult && (
              <>

                <div
                  className={`mainDiagnosis ${result.condition}`}
                >
                  <span>
                    Diagnóstico
                  </span>

                  <strong>
                    {result.diagnosis}
                  </strong>
                </div>

                <div className="resultGrid">

                  <div className="resultMetric">

                    <span>
                      Estágio
                    </span>

                    <strong>
                      {result.stage
                        ? result.stage
                        : "—"}
                    </strong>

                  </div>

                  <div className="resultMetric">

                    <span>
                      Grau
                    </span>

                    <strong>
                      {result.grade
                        ? result.grade
                        : "—"}
                    </strong>

                  </div>

                  <div className="resultMetric">

                    <span>
                      Extensão
                    </span>

                    <strong>
                      {result.extent}
                    </strong>

                  </div>

                  <div className="resultMetric">

                    <span>
                      Prognóstico
                    </span>

                    <strong>
                      {result.prognosis}
                    </strong>

                  </div>

                </div>

                <div className="confidence">

                  <span>
                    Confiabilidade do preenchimento
                  </span>

                  <strong>
                    {result.confidence ===
                      "alta" &&
                      "Alta"}

                    {result.confidence ===
                      "moderada" &&
                      "Moderada"}

                    {result.confidence ===
                      "baixa" &&
                      "Baixa"}
                  </strong>

                </div>

                {/* =====================================
                    POR QUE?
                ===================================== */}

                <div className="resultSection">

                  <h3>
                    Por que o sistema chegou a esse resultado?
                  </h3>

                  {result.reasons.length ===
                  0 ? (
                    <p className="muted">
                      Preencha os dados clínicos.
                    </p>
                  ) : (
                    <ul className="reasonList">
                      {result.reasons.map(
                        (
                          reason,
                          index
                        ) => (
                          <li
                            key={
                              `${reason}-${index}`
                            }
                          >
                            <span>
                              ✓
                            </span>

                            {reason}
                          </li>
                        )
                      )}
                    </ul>
                  )}

                </div>

                {/* =====================================
                    ESTÁGIO
                ===================================== */}

                {result.stage && (
                  <div className="resultSection">

                    <h3>
                      Critérios de estágio
                    </h3>

                    {result.stageReason
                      .length === 0 ? (
                      <p className="muted">
                        Nenhum critério específico informado.
                      </p>
                    ) : (
                      <ul className="reasonList">
                        {result.stageReason.map(
                          (
                            reason,
                            index
                          ) => (
                            <li
                              key={
                                `${reason}-${index}`
                              }
                            >
                              <span>
                                ✓
                              </span>

                              {reason}
                            </li>
                          )
                        )}
                      </ul>
                    )}

                  </div>
                )}

                {/* =====================================
                    GRAU
                ===================================== */}

                {result.grade && (
                  <div className="resultSection">

                    <h3>
                      Critérios de grau
                    </h3>

                    <ul className="reasonList">

                      {result.gradeReason.map(
                        (
                          reason,
                          index
                        ) => (
                          <li
                            key={
                              `${reason}-${index}`
                            }
                          >
                            <span>
                              ✓
                            </span>

                            {reason}
                          </li>
                        )
                      )}

                    </ul>

                  </div>
                )}

                {/* =====================================
                    ALERTAS
                ===================================== */}

                {result.warnings.length >
                  0 && (
                  <div className="warningBox">

                    <h3>
                      Atenção
                    </h3>

                    {result.warnings.map(
                      (
                        warning,
                        index
                      ) => (
                        <p
                          key={
                            `${warning}-${index}`
                          }
                        >
                          ⚠ {warning}
                        </p>
                      )
                    )}

                  </div>
                )}

                {/* =====================================
                    DADOS FALTANTES
                ===================================== */}

                {result.missing.length >
                  0 && (
                  <div className="missingBox">

                    <h3>
                      Dados ainda não informados
                    </h3>

                    <ul>
                      {result.missing.map(
                        (
                          item,
                          index
                        ) => (
                          <li
                            key={
                              `${item}-${index}`
                            }
                          >
                            {item}
                          </li>
                        )
                      )}
                    </ul>

                  </div>
                )}

                <div className="disclaimer">

                  <strong>
                    Ferramenta de apoio clínico
                  </strong>

                  <p>
                    Este resultado é calculado
                    exclusivamente a partir das
                    informações preenchidas nesta
                    ficha. A classificação e o
                    diagnóstico devem ser confirmados
                    pelo profissional responsável,
                    considerando exame clínico,
                    radiográfico e demais informações
                    pertinentes.
                  </p>

                </div>

              </>
            )}

          </div>

        </aside>

      </div>

      {/* =================================================
          ESTILOS
      ================================================= */}

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background: #f5f7fa;
          color: #101828;
          padding-bottom: 60px;
        }

        .topbar {
          min-height: 82px;
          background: #ffffff;
          border-bottom: 1px solid #eaecf0;
          padding: 18px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .headerLeft {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .backButton {
          width: 40px;
          height: 40px;
          border: 1px solid #d0d5dd;
          border-radius: 9px;
          background: #ffffff;
          cursor: pointer;
          font-size: 20px;
          color: #344054;
        }

        .backButton:hover {
          background: #f9fafb;
        }

        .eyebrow {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #667085;
          margin-bottom: 3px;
        }

        h1 {
          margin: 0;
          font-size: 25px;
          line-height: 1.2;
          font-weight: 750;
        }

        .headerLeft p {
          margin: 5px 0 0;
          color: #667085;
          font-size: 13px;
        }

        .headerActions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .saved {
          font-size: 13px;
          color: #027a48;
          font-weight: 600;
        }

        .secondaryButton {
          border: 1px solid #d0d5dd;
          background: #ffffff;
          color: #344054;
          border-radius: 8px;
          padding: 9px 13px;
          font-size: 13px;
          cursor: pointer;
        }

        .secondaryButton:hover {
          background: #f9fafb;
        }

        .moduleNav {
          height: 52px;
          padding: 0 28px;
          background: #ffffff;
          border-bottom: 1px solid #eaecf0;
          display: flex;
          align-items: stretch;
          gap: 6px;
        }

        .moduleButton {
          border: 0;
          background: transparent;
          color: #667085;
          padding: 0 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 2px solid transparent;
        }

        .moduleButton:hover {
          color: #344054;
        }

        .moduleButton.active {
          color: #175cd3;
          border-bottom-color: #175cd3;
        }

        .layout {
          max-width: 1500px;
          margin: 0 auto;
          padding: 24px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 410px;
          gap: 22px;
          align-items: start;
        }

        .form {
          min-width: 0;
        }

        .card {
          background: #ffffff;
          border: 1px solid #eaecf0;
          border-radius: 12px;
          padding: 22px;
          margin-bottom: 16px;
          box-shadow:
            0 1px 2px rgba(16, 24, 40, 0.03);
        }

        .sectionHeader {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 20px;
        }

        .sectionNumber {
          flex: 0 0 auto;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #eef4ff;
          color: #175cd3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 800;
        }

        .card h2 {
          margin: 1px 0 0;
          font-size: 17px;
          line-height: 1.3;
        }

        .sectionDescription {
          margin: 4px 0 0;
          color: #667085;
          font-size: 12px;
          line-height: 1.5;
        }

        .grid {
          display: grid;
          gap: 16px;
        }

        .grid.two {
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
        }

        .field {
          margin-top: 16px;
        }

        .field:first-child {
          margin-top: 0;
        }

        .field label,
        .question > label {
          display: block;
          margin-bottom: 7px;
          color: #344054;
          font-size: 13px;
          font-weight: 650;
          line-height: 1.45;
        }

        input[type="text"],
        input[type="number"],
        select {
          width: 100%;
          min-height: 40px;
          border: 1px solid #d0d5dd;
          border-radius: 8px;
          background: #ffffff;
          color: #101828;
          padding: 9px 11px;
          font-size: 13px;
          outline: none;
          transition:
            border-color 0.15s,
            box-shadow 0.15s;
        }

        input[type="text"]:focus,
        input[type="number"]:focus,
        select:focus {
          border-color: #84adff;
          box-shadow:
            0 0 0 3px
            rgba(23, 92, 211, 0.08);
        }

        .help {
          display: block;
          margin-top: 5px;
          color: #667085;
          font-size: 11px;
          line-height: 1.45;
        }

        .question {
          margin-top: 20px;
        }

        .radioGroup {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .radioOption {
          min-height: 38px;
          border: 1px solid #d0d5dd;
          border-radius: 8px;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 12px;
          color: #475467;
          background: #ffffff;
        }

        .radioOption.selected {
          border-color: #84adff;
          background: #f5f8ff;
          color: #175cd3;
        }

        .radioOption input {
          margin: 0;
        }

        .subTitle {
          margin-top: 22px;
          margin-bottom: 10px;
          font-size: 13px;
          font-weight: 700;
          color: #344054;
        }

        .checkList {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .checkboxRow {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 8px 0;
          color: #344054;
          font-size: 13px;
          line-height: 1.45;
          cursor: pointer;
        }

        .checkboxRow input {
          margin-top: 2px;
          flex: 0 0 auto;
          width: 15px;
          height: 15px;
          accent-color: #175cd3;
        }

        .checkboxRow.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .divider {
          height: 1px;
          background: #eaecf0;
          margin: 22px 0;
        }

        .infoBox {
          margin-top: 18px;
          padding: 12px 14px;
          border-radius: 9px;
          background: #f8fafc;
          border: 1px solid #eaecf0;
        }

        .infoBox strong {
          display: block;
          font-size: 12px;
          margin-bottom: 4px;
        }

        .infoBox p {
          margin: 0;
          color: #667085;
          font-size: 12px;
          line-height: 1.5;
        }

        .extentPreview {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 16px;
        }

        .extentPreview > div {
          border: 1px solid #eaecf0;
          background: #f9fafb;
          border-radius: 9px;
          padding: 12px;
        }

        .extentPreview strong {
          display: block;
          font-size: 11px;
          color: #667085;
          margin-bottom: 5px;
        }

        .extentPreview span {
          display: block;
          font-size: 18px;
          font-weight: 750;
          color: #101828;
        }

        /* ============================================
           RESULTADO
        ============================================ */

        .resultColumn {
          position: sticky;
          top: 16px;
        }

        .resultCard {
          background: #ffffff;
          border: 1px solid #eaecf0;
          border-radius: 12px;
          overflow: hidden;
          box-shadow:
            0 2px 6px
            rgba(16, 24, 40, 0.04);
        }

        .resultHeader {
          padding: 18px;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          border-bottom: 1px solid #eaecf0;
        }

        .resultEyebrow {
          display: block;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #667085;
          margin-bottom: 4px;
        }

        .resultHeader h2 {
          margin: 0;
          font-size: 17px;
        }

        .collapseButton {
          align-self: flex-start;
          border: 0;
          background: #f2f4f7;
          color: #475467;
          border-radius: 7px;
          padding: 6px 9px;
          font-size: 11px;
          cursor: pointer;
        }

        .mainDiagnosis {
          margin: 16px;
          border-radius: 10px;
          padding: 16px;
          background: #f8fafc;
          border: 1px solid #eaecf0;
        }

        .mainDiagnosis.periodontite {
          background: #f5f8ff;
          border-color: #c7d7fe;
        }

        .mainDiagnosis.gengivite {
          background: #fffaeb;
          border-color: #fedf89;
        }

        .mainDiagnosis.saude {
          background: #ecfdf3;
          border-color: #abefc6;
        }

        .mainDiagnosis span {
          display: block;
          color: #667085;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 800;
          margin-bottom: 5px;
        }

        .mainDiagnosis strong {
          display: block;
          font-size: 15px;
          line-height: 1.4;
        }

        .resultGrid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 8px;
          padding: 0 16px;
        }

        .resultMetric {
          border: 1px solid #eaecf0;
          border-radius: 9px;
          padding: 11px;
          min-width: 0;
        }

        .resultMetric span {
          display: block;
          color: #667085;
          font-size: 10px;
          margin-bottom: 4px;
        }

        .resultMetric strong {
          display: block;
          color: #101828;
          font-size: 14px;
          line-height: 1.35;
          word-break: break-word;
        }

        .confidence {
          margin: 14px 16px 0;
          padding: 10px 12px;
          border-radius: 8px;
          background: #f9fafb;
          display: flex;
          justify-content: space-between;
          gap: 10px;
          font-size: 11px;
        }

        .confidence span {
          color: #667085;
        }

        .confidence strong {
          color: #344054;
        }

        .resultSection {
          margin: 16px;
          padding-top: 16px;
          border-top: 1px solid #eaecf0;
        }

        .resultSection h3,
        .warningBox h3,
        .missingBox h3 {
          margin: 0 0 10px;
          font-size: 13px;
        }

        .reasonList {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .reasonList li {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          font-size: 11px;
          color: #475467;
          line-height: 1.5;
        }

        .reasonList li span {
          color: #039855;
          font-weight: 800;
          flex: 0 0 auto;
        }

        .muted {
          color: #98a2b3;
          font-size: 11px;
        }

        .warningBox {
          margin: 16px;
          padding: 13px;
          border-radius: 9px;
          background: #fffaeb;
          border: 1px solid #fedf89;
        }

        .warningBox h3 {
          color: #92400e;
        }

        .warningBox p {
          margin: 5px 0 0;
          color: #92400e;
          font-size: 11px;
          line-height: 1.5;
        }

        .missingBox {
          margin: 16px;
          padding: 13px;
          border-radius: 9px;
          background: #f8f9fc;
          border: 1px solid #eaecf0;
        }

        .missingBox ul {
          margin: 0;
          padding-left: 17px;
        }

        .missingBox li {
          color: #667085;
          font-size: 11px;
          margin: 5px 0;
        }

        .disclaimer {
          margin: 16px;
          padding: 13px;
          background: #f8fafc;
          border: 1px solid #eaecf0;
          border-radius: 9px;
        }

        .disclaimer strong {
          display: block;
          font-size: 11px;
          margin-bottom: 5px;
        }

        .disclaimer p {
          margin: 0;
          color: #667085;
          font-size: 10px;
          line-height: 1.55;
        }

        @media (max-width: 1100px) {

          .layout {
            grid-template-columns: 1fr;
          }

          .resultColumn {
            position: static;
            order: -1;
          }

        }

        @media (max-width: 700px) {

          .topbar {
            padding: 15px;
            align-items: flex-start;
          }

          .headerActions {
            flex-direction: column;
            align-items: flex-end;
          }

          .moduleNav {
            padding: 0 15px;
          }

          .layout {
            padding: 14px;
          }

          .card {
            padding: 16px;
          }

          .grid.two {
            grid-template-columns: 1fr;
          }

          .extentPreview {
            grid-template-columns: 1fr;
          }

          .resultGrid {
            grid-template-columns: 1fr;
          }

          h1 {
            font-size: 20px;
          }

        }

      `}</style>

    </main>
  );
}
