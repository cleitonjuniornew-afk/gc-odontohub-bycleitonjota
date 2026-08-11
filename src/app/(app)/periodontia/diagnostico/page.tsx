"use client";

import { useMemo, useState } from "react";

type YesNo = "sim" | "nao" | "nao_informado";

type Extent = "Localizada" | "Generalizada";

type Distribution =
  | "Nenhuma"
  | "Padrão molar/incisivo";

type Stage = "I" | "II" | "III" | "IV" | "Não determinado";

type Grade = "A" | "B" | "C" | "Não determinado";

type Answers = {
  interdentalCAL: YesNo;
  freeSurfaceCAL: YesNo;
  nonPeriodontalCause: boolean;

  bleeding: YesNo;
  plaque: YesNo;
  calculus: YesNo;

  maximumCAL: string;
  maximumPD: string;
  radiographicBoneLoss: string;

  boneLossPattern:
    | "horizontal"
    | "vertical"
    | "mista"
    | "nao_informado";

  teethAffectedPercentage: string;
  teethLostPeriodontitis: string;

  furcation:
    | "nenhuma"
    | "classe_I"
    | "classe_II"
    | "classe_III"
    | "nao_informado";

  verticalBoneLoss: string;

  mobility:
    | "nenhuma"
    | "grau_1"
    | "grau_2"
    | "grau_3"
    | "nao_informado";

  ridgeDefect:
    | "nenhum"
    | "moderado"
    | "grave"
    | "nao_informado";

  masticatoryDysfunction: YesNo;
  secondaryOcclusalTrauma: YesNo;
  occlusalCollapse: YesNo;

  remainingTeeth: string;
  remainingPairs: string;

  molarIncisorPattern: boolean;

  longitudinalProgression:
    | "sem_perda"
    | "menor_2mm"
    | "maior_igual_2mm"
    | "nao_informado";

  boneLossAgeRatio: string;

  smoking:
    | "nao_fumante"
    | "menos_10"
    | "10_ou_mais"
    | "nao_informado";

  diabetes:
    | "nao"
    | "hba1c_menor_7"
    | "hba1c_maior_igual_7"
    | "nao_informado";

  acuteCondition:
    | "nenhuma"
    | "abscesso"
    | "endo_perio"
    | "necrosante"
    | "outra";

  progressionKnown: YesNo;
};

type DiagnosisResult = {
  condition: string;
  stage: Stage;
  grade: Grade;
  extent: Extent | "Não determinado";
  distribution: Distribution;
  prognosis: string;
  warnings: string[];
  explanation: string;
};

const initialAnswers: Answers = {
  interdentalCAL: "nao_informado",
  freeSurfaceCAL: "nao_informado",
  nonPeriodontalCause: false,

  bleeding: "nao_informado",
  plaque: "nao_informado",
  calculus: "nao_informado",

  maximumCAL: "",
  maximumPD: "",
  radiographicBoneLoss: "",

  boneLossPattern: "nao_informado",

  teethAffectedPercentage: "",
  teethLostPeriodontitis: "",

  furcation: "nao_informado",
  verticalBoneLoss: "",

  mobility: "nao_informado",

  ridgeDefect: "nao_informado",

  masticatoryDysfunction: "nao_informado",
  secondaryOcclusalTrauma: "nao_informado",
  occlusalCollapse: "nao_informado",

  remainingTeeth: "",
  remainingPairs: "",

  molarIncisorPattern: false,

  longitudinalProgression: "nao_informado",

  boneLossAgeRatio: "",

  smoking: "nao_informado",

  diabetes: "nao_informado",

  acuteCondition: "nenhuma",

  progressionKnown: "nao_informado",
};

function numberValue(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value.replace(",", "."));

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

function calculateDiagnosis(data: Answers): DiagnosisResult {
  const warnings: string[] = [];

  const maximumCAL = numberValue(data.maximumCAL);
  const maximumPD = numberValue(data.maximumPD);
  const boneLoss = numberValue(data.radiographicBoneLoss);
  const affectedPercentage = numberValue(data.teethAffectedPercentage);
  const teethLost = numberValue(data.teethLostPeriodontitis);
  const verticalBoneLoss = numberValue(data.verticalBoneLoss);
  const remainingTeeth = numberValue(data.remainingTeeth);
  const remainingPairs = numberValue(data.remainingPairs);
  const boneLossAgeRatio = numberValue(data.boneLossAgeRatio);

  const hasInterdentalCAL = data.interdentalCAL === "sim";
  const hasFreeSurfaceCAL = data.freeSurfaceCAL === "sim";

  const hasPDOver3 = maximumPD !== null && maximumPD > 3;

  const periodontalCase =
    (hasInterdentalCAL && !data.nonPeriodontalCause) ||
    (hasFreeSurfaceCAL &&
      maximumCAL !== null &&
      maximumCAL >= 3 &&
      hasPDOver3 &&
      !data.nonPeriodontalCause);

  if (data.nonPeriodontalCause) {
    warnings.push(
      "Foi indicada uma possível causa não periodontal para a perda de inserção. A classificação de periodontite deve ser confirmada após excluir essa causa."
    );
  }

  if (data.acuteCondition !== "nenhuma") {
    warnings.push(
      "Existe uma condição periodontal aguda associada. Ela deve ser registrada e avaliada separadamente."
    );
  }

  if (!periodontalCase) {
    if (
      data.interdentalCAL === "nao" &&
      data.freeSurfaceCAL === "nao"
    ) {
      if (data.bleeding === "sim") {
        return {
          condition: "Gengivite",
          stage: "Não determinado",
          grade: "Não determinado",
          extent: "Não determinado",
          distribution: "Nenhuma",
          prognosis: "Favorável com controle dos fatores etiológicos",
          warnings,
          explanation:
            "Não foram identificados critérios suficientes para classificar o caso como periodontite. Foi relatado sangramento à sondagem, compatível com inflamação gengival.",
        };
      }

      return {
        condition: "Saúde periodontal — sem critérios informados de periodontite",
        stage: "Não determinado",
        grade: "Não determinado",
        extent: "Não determinado",
        distribution: "Nenhuma",
        prognosis: "Favorável",
        warnings,
        explanation:
          "Com os dados informados, não foram identificados critérios suficientes para classificar o caso como periodontite.",
      };
    }

    return {
      condition: "Dados insuficientes para classificação definitiva",
      stage: "Não determinado",
      grade: "Não determinado",
      extent: "Não determinado",
      distribution: "Nenhuma",
      prognosis: "Não determinado",
      warnings: [
        ...warnings,
        "É necessário confirmar a presença de perda de inserção clínica e/ou os demais critérios diagnósticos.",
      ],
      explanation:
        "Os dados fornecidos não permitem estabelecer com segurança se o paciente atende aos critérios de caso de periodontite.",
    };
  }

  if (maximumCAL === null && boneLoss === null) {
    return {
      condition: "Periodontite — estágio não determinado",
      stage: "Não determinado",
      grade: "Não determinado",
      extent: "Não determinado",
      distribution: data.molarIncisorPattern
        ? "Padrão molar/incisivo"
        : "Nenhuma",
      prognosis: "Não determinado",
      warnings: [
        ...warnings,
        "Informe a maior perda de inserção clínica e/ou a perda óssea radiográfica para determinar o estágio.",
      ],
      explanation:
        "O caso apresenta dados compatíveis com periodontite, mas não há informações quantitativas suficientes para estabelecer o estágio.",
    };
  }

  /*
   * ESTÁGIO
   *
   * A classificação considera gravidade e complexidade.
   * O sistema primeiro identifica o estágio mínimo pela gravidade
   * e posteriormente eleva o estágio quando existem características
   * de complexidade compatíveis.
   */

  let stage: Stage = "I";

  if (
    (maximumCAL !== null && maximumCAL >= 5) ||
    (boneLoss !== null && boneLoss > 33) ||
    (teethLost !== null && teethLost >= 5)
  ) {
    stage = "III";
  } else if (
    (maximumCAL !== null && maximumCAL >= 3) ||
    (boneLoss !== null && boneLoss >= 15) ||
    (teethLost !== null && teethLost >= 1)
  ) {
    stage = "II";
  } else {
    stage = "I";
  }

  /*
   * COMPLEXIDADE PARA ESTÁGIO III
   */

  const complexityIII =
    (maximumPD !== null && maximumPD >= 6) ||
    (verticalBoneLoss !== null && verticalBoneLoss >= 3) ||
    data.furcation === "classe_II" ||
    data.furcation === "classe_III" ||
    data.ridgeDefect === "moderado";

  if (complexityIII && stage !== "IV") {
    stage = "III";
  }

  /*
   * COMPLEXIDADE PARA ESTÁGIO IV
   */

  const complexStageIV =
    data.masticatoryDysfunction === "sim" ||
    data.secondaryOcclusalTrauma === "sim" ||
    data.ridgeDefect === "grave" ||
    data.occlusalCollapse === "sim" ||
    (remainingTeeth !== null && remainingTeeth < 20) ||
    (remainingPairs !== null && remainingPairs < 10);

  if (stage === "III" && complexStageIV) {
    stage = "IV";
  }

  /*
   * EXTENSÃO
   */

  let extent: Extent | "Não determinado" = "Não determinado";

  if (affectedPercentage !== null) {
    extent = affectedPercentage < 30 ? "Localizada" : "Generalizada";
  }

  /*
   * DISTRIBUIÇÃO
   */

  const distribution: Distribution = data.molarIncisorPattern
    ? "Padrão molar/incisivo"
    : "Nenhuma";

  /*
   * GRAU
   */

  let grade: Grade = "B";

  if (data.longitudinalProgression === "sem_perda") {
    grade = "A";
  }

  if (data.longitudinalProgression === "menor_2mm") {
    grade = "B";
  }

  if (data.longitudinalProgression === "maior_igual_2mm") {
    grade = "C";
  }

  if (
    data.longitudinalProgression === "nao_informado" &&
    boneLossAgeRatio !== null
  ) {
    if (boneLossAgeRatio < 0.25) {
      grade = "A";
    } else if (boneLossAgeRatio <= 1) {
      grade = "B";
    } else {
      grade = "C";
    }
  }

  /*
   * MODIFICADORES DE GRAU
   */

  if (data.smoking === "10_ou_mais") {
    grade = "C";
  }

  if (data.diabetes === "hba1c_maior_igual_7") {
    grade = "C";
  }

  /*
   * PROGNÓSTICO
   */

  let prognosis = "Favorável";

  if (stage === "I" || stage === "II") {
    prognosis =
      "Favorável, desde que haja controle do biofilme, tratamento adequado e manutenção periodontal.";
  }

  if (stage === "III") {
    prognosis =
      "Reservado — requer tratamento periodontal, controle dos fatores de risco e manutenção rigorosa.";
  }

  if (stage === "IV") {
    prognosis =
      "Reservado/desfavorável — requer avaliação individual dos dentes e planejamento periodontal e reabilitador.";
  }

  if (data.mobility === "grau_3") {
    prognosis =
      "Reservado — mobilidade acentuada deve ser avaliada individualmente.";
  }

  if (data.furcation === "classe_III") {
    prognosis =
      "Reservado — envolvimento de furca avançado exige avaliação individual do elemento.";
  }

  /*
   * DADOS AUSENTES IMPORTANTES
   */

  if (affectedPercentage === null) {
    warnings.push(
      "A extensão localizada/generalizada não pôde ser determinada porque a porcentagem de dentes acometidos não foi informada."
    );
  }

  if (data.longitudinalProgression === "nao_informado" && boneLossAgeRatio === null) {
    warnings.push(
      "Não há dados suficientes para estabelecer diretamente a velocidade de progressão. O Grau B foi mantido como classificação provisória."
    );
  }

  if (data.smoking === "nao_informado") {
    warnings.push("Status de tabagismo não informado.");
  }

  if (data.diabetes === "nao_informado") {
    warnings.push("Status de diabetes não informado.");
  }

  return {
    condition: "Periodontite",
    stage,
    grade,
    extent,
    distribution,
    prognosis,
    warnings,
    explanation:
      "O sistema identificou critérios compatíveis com periodontite e aplicou uma classificação inicial utilizando os dados clínicos, radiográficos, de complexidade e fatores modificadores informados. A classificação definitiva deve ser confirmada pelo cirurgião-dentista.",
  };
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-text-primary">
          {title}
        </h2>

        {description ? (
          <p className="mt-1 text-sm leading-6 text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>

      {children}
    </section>
  );
}

function RadioGroup({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
              selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-text-primary hover:bg-muted"
            }`}
          >
            <span className="mr-2">
              {selected ? "●" : "○"}
            </span>

            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function InputNumber({
  label,
  value,
  onChange,
  unit,
  placeholder = "0",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-text-primary">
        {label}
      </span>

      <div className="flex">
        <input
          type="number"
          min="0"
          step="0.1"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-l-xl border border-border bg-background px-4 py-3 text-sm text-text-primary outline-none focus:border-primary"
        />

        {unit ? (
          <span className="flex items-center rounded-r-xl border border-l-0 border-border bg-muted px-4 text-sm text-text-secondary">
            {unit}
          </span>
        ) : null}
      </div>
    </label>
  );
}

function ResultItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-text-primary">
        {value}
      </p>
    </div>
  );
}

export default function DiagnosticoPeriodontalPage() {
  const [data, setData] = useState<Answers>(initialAnswers);
  const [generated, setGenerated] = useState(false);

  const result = useMemo(
    () => calculateDiagnosis(data),
    [data]
  );

  function update<K extends keyof Answers>(
    key: K,
    value: Answers[K]
  ) {
    setData((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function reset() {
    setData(initialAnswers);
    setGenerated(false);
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <div className="mb-3 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Periodontia
          </div>

          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
            Diagnóstico periodontal
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
            Ferramenta de apoio à classificação periodontal a partir dos
            achados clínicos, radiográficos e fatores modificadores.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            <Section
              title="1. Critério de caso de periodontite"
              description="Informe se existe perda de inserção clínica compatível com periodontite."
            >
              <div className="space-y-5">
                <div>
                  <p className="mb-3 text-sm font-medium text-text-primary">
                    Perda de inserção clínica interdental detectável em pelo
                    menos dois dentes não adjacentes?
                  </p>

                  <RadioGroup
                    value={data.interdentalCAL}
                    onChange={(value) =>
                      update(
                        "interdentalCAL",
                        value as YesNo
                      )
                    }
                    options={[
                      { label: "Sim", value: "sim" },
                      { label: "Não", value: "nao" },
                      {
                        label: "Não informado",
                        value: "nao_informado",
                      },
                    ]}
                  />
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-text-primary">
                    Perda de inserção em faces livres ≥ 3 mm com bolsa > 3
                    mm em pelo menos dois dentes?
                  </p>

                  <RadioGroup
                    value={data.freeSurfaceCAL}
                    onChange={(value) =>
                      update(
                        "freeSurfaceCAL",
                        value as YesNo
                      )
                    }
                    options={[
                      { label: "Sim", value: "sim" },
                      { label: "Não", value: "nao" },
                      {
                        label: "Não informado",
                        value: "nao_informado",
                      },
                    ]}
                  />
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-text-primary">
                    A perda de inserção pode ser atribuída a uma causa não
                    periodontal?
                  </p>

                  <RadioGroup
                    value={data.nonPeriodontalCause ? "sim" : "nao"}
                    onChange={(value) =>
                      update(
                        "nonPeriodontalCause",
                        value === "sim"
                      )
                    }
                    options={[
                      { label: "Não", value: "nao" },
                      { label: "Sim", value: "sim" },
                    ]}
                  />

                  <p className="mt-2 text-xs leading-5 text-text-muted">
                    Exemplos incluem recessão traumática, cárie cervical,
                    situações relacionadas ao terceiro molar, lesão
                    endodôntica drenando pelo periodonto marginal e fratura
                    radicular vertical.
                  </p>
                </div>
              </div>
            </Section>

            <Section
              title="2. Inflamação periodontal"
              description="Achados clínicos relacionados à atividade inflamatória."
            >
              <div className="space-y-5">
                <div>
                  <p className="mb-3 text-sm font-medium text-text-primary">
                    Sangramento à sondagem?
                  </p>

                  <RadioGroup
                    value={data.bleeding}
                    onChange={(value) =>
                      update("bleeding", value as YesNo)
                    }
                    options={[
                      { label: "Sim", value: "sim" },
                      { label: "Não", value: "nao" },
                      {
                        label: "Não informado",
                        value: "nao_informado",
                      },
                    ]}
                  />
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-text-primary">
                    Biofilme dental presente?
                  </p>

                  <RadioGroup
                    value={data.plaque}
                    onChange={(value) =>
                      update("plaque", value as YesNo)
                    }
                    options={[
                      { label: "Sim", value: "sim" },
                      { label: "Não", value: "nao" },
                      {
                        label: "Não informado",
                        value: "nao_informado",
                      },
                    ]}
                  />
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-text-primary">
                    Cálculo dental presente?
                  </p>

                  <RadioGroup
                    value={data.calculus}
                    onChange={(value) =>
                      update("calculus", value as YesNo)
                    }
                    options={[
                      { label: "Sim", value: "sim" },
                      { label: "Não", value: "nao" },
                      {
                        label: "Não informado",
                        value: "nao_informado",
                      },
                    ]}
                  />
                </div>
              </div>
            </Section>

            <Section
              title="3. Gravidade"
              description="Valores máximos observados no exame periodontal."
            >
              <div className="grid gap-4 md:grid-cols-3">
                <InputNumber
                  label="Maior perda de inserção clínica"
                  value={data.maximumCAL}
                  onChange={(value) =>
                    update("maximumCAL", value)
                  }
                  unit="mm"
                />

                <InputNumber
                  label="Maior profundidade de sondagem"
                  value={data.maximumPD}
                  onChange={(value) =>
                    update("maximumPD", value)
                  }
                  unit="mm"
                />

                <InputNumber
                  label="Maior perda óssea radiográfica"
                  value={data.radiographicBoneLoss}
                  onChange={(value) =>
                    update(
                      "radiographicBoneLoss",
                      value
                    )
                  }
                  unit="%"
                />
              </div>

              <div className="mt-5">
                <p className="mb-3 text-sm font-medium text-text-primary">
                  Padrão predominante da perda óssea
                </p>

                <RadioGroup
                  value={data.boneLossPattern}
                  onChange={(value) =>
                    update(
                      "boneLossPattern",
                      value as Answers["boneLossPattern"]
                    )
                  }
                  options={[
                    {
                      label: "Horizontal",
                      value: "horizontal",
                    },
                    {
                      label: "Vertical / angular",
                      value: "vertical",
                    },
                    {
                      label: "Mista",
                      value: "mista",
                    },
                    {
                      label: "Não informado",
                      value: "nao_informado",
                    },
                  ]}
                />
              </div>
            </Section>

            <Section
              title="4. Extensão e distribuição"
              description="Dados utilizados como descritores da periodontite."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <InputNumber
                  label="Porcentagem de dentes acometidos"
                  value={data.teethAffectedPercentage}
                  onChange={(value) =>
                    update(
                      "teethAffectedPercentage",
                      value
                    )
                  }
                  unit="%"
                  placeholder="Ex.: 45"
                />

                <InputNumber
                  label="Dentes perdidos por periodontite"
                  value={data.teethLostPeriodontitis}
                  onChange={(value) =>
                    update(
                      "teethLostPeriodontitis",
                      value
                    )
                  }
                  unit="dentes"
                  placeholder="Ex.: 2"
                />
              </div>

              <div className="mt-5">
                <p className="mb-3 text-sm font-medium text-text-primary">
                  Existe padrão molar/incisivo?
                </p>

                <RadioGroup
                  value={
                    data.molarIncisorPattern
                      ? "sim"
                      : "nao"
                  }
                  onChange={(value) =>
                    update(
                      "molarIncisorPattern",
                      value === "sim"
                    )
                  }
                  options={[
                    { label: "Sim", value: "sim" },
                    { label: "Não", value: "nao" },
                  ]}
                />
              </div>
            </Section>

            <Section
              title="5. Complexidade"
              description="Características que podem elevar a classificação de estágio."
            >
              <div className="space-y-5">
                <InputNumber
                  label="Perda óssea vertical"
                  value={data.verticalBoneLoss}
                  onChange={(value) =>
                    update(
                      "verticalBoneLoss",
                      value
                    )
                  }
                  unit="mm"
                />

                <div>
                  <p className="mb-3 text-sm font-medium text-text-primary">
                    Envolvimento de furca
                  </p>

                  <RadioGroup
                    value={data.furcation}
                    onChange={(value) =>
                      update(
                        "furcation",
                        value as Answers["furcation"]
                      )
                    }
                    options={[
                      {
                        label: "Nenhuma",
                        value: "nenhuma",
                      },
                      {
                        label: "Classe I",
                        value: "classe_I",
                      },
                      {
                        label: "Classe II",
                        value: "classe_II",
                      },
                      {
                        label: "Classe III",
                        value: "classe_III",
                      },
                      {
                        label: "Não informado",
                        value: "nao_informado",
                      },
                    ]}
                  />
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-text-primary">
                    Mobilidade dentária
                  </p>

                  <RadioGroup
                    value={data.mobility}
                    onChange={(value) =>
                      update(
                        "mobility",
                        value as Answers["mobility"]
                      )
                    }
                    options={[
                      {
                        label: "Nenhuma",
                        value: "nenhuma",
                      },
                      {
                        label: "Grau 1",
                        value: "grau_1",
                      },
                      {
                        label: "Grau 2",
                        value: "grau_2",
                      },
                      {
                        label: "Grau 3",
                        value: "grau_3",
                      },
                      {
                        label: "Não informado",
                        value: "nao_informado",
                      },
                    ]}
                  />
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-text-primary">
                    Defeito de rebordo
                  </p>

                  <RadioGroup
                    value={data.ridgeDefect}
                    onChange={(value) =>
                      update(
                        "ridgeDefect",
                        value as Answers["ridgeDefect"]
                      )
                    }
                    options={[
                      {
                        label: "Nenhum",
                        value: "nenhum",
                      },
                      {
                        label: "Moderado",
                        value: "moderado",
                      },
                      {
                        label: "Grave",
                        value: "grave",
                      },
                      {
                        label: "Não informado",
                        value: "nao_informado",
                      },
                    ]}
                  />
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-text-primary">
                    Disfunção mastigatória?
                  </p>

                  <RadioGroup
                    value={data.masticatoryDysfunction}
                    onChange={(value) =>
                      update(
                        "masticatoryDysfunction",
                        value as YesNo
                      )
                    }
                    options={[
                      { label: "Sim", value: "sim" },
                      { label: "Não", value: "nao" },
                      {
                        label: "Não informado",
                        value: "nao_informado",
                      },
                    ]}
                  />
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-text-primary">
                    Trauma oclusal secundário associado à mobilidade ≥ 2?
                  </p>

                  <RadioGroup
                    value={data.secondaryOcclusalTrauma}
                    onChange={(value) =>
                      update(
                        "secondaryOcclusalTrauma",
                        value as YesNo
                      )
                    }
                    options={[
                      { label: "Sim", value: "sim" },
                      { label: "Não", value: "nao" },
                      {
                        label: "Não informado",
                        value: "nao_informado",
                      },
                    ]}
                  />
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-text-primary">
                    Colapso oclusal?
                  </p>

                  <RadioGroup
                    value={data.occlusalCollapse}
                    onChange={(value) =>
                      update(
                        "occlusalCollapse",
                        value as YesNo
                      )
                    }
                    options={[
                      { label: "Sim", value: "sim" },
                      { label: "Não", value: "nao" },
                      {
                        label: "Não informado",
                        value: "nao_informado",
                      },
                    ]}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <InputNumber
                    label="Dentes remanescentes"
                    value={data.remainingTeeth}
                    onChange={(value) =>
                      update(
                        "remainingTeeth",
                        value
                      )
                    }
                    unit="dentes"
                  />

                  <InputNumber
                    label="Pares de dentes remanescentes"
                    value={data.remainingPairs}
                    onChange={(value) =>
                      update(
                        "remainingPairs",
                        value
                      )
                    }
                    unit="pares"
                  />
                </div>
              </div>
            </Section>

            <Section
              title="6. Grau — progressão"
              description="Use dados longitudinais quando disponíveis."
            >
              <div>
                <p className="mb-3 text-sm font-medium text-text-primary">
                  Evidência direta de progressão em 5 anos
                </p>

                <RadioGroup
                  value={data.longitudinalProgression}
                  onChange={(value) =>
                    update(
                      "longitudinalProgression",
                      value as Answers["longitudinalProgression"]
                    )
                  }
                  options={[
                    {
                      label: "Sem evidência de perda",
                      value: "sem_perda",
                    },
                    {
                      label: "Menos de 2 mm",
                      value: "menor_2mm",
                    },
                    {
                      label: "≥ 2 mm",
                      value: "maior_igual_2mm",
                    },
                    {
                      label: "Não informado",
                      value: "nao_informado",
                    },
                  ]}
                />
              </div>

              <div className="mt-5">
                <InputNumber
                  label="Relação % perda óssea / idade"
                  value={data.boneLossAgeRatio}
                  onChange={(value) =>
                    update(
                      "boneLossAgeRatio",
                      value
                    )
                  }
                  placeholder="Ex.: 0,5"
                />
              </div>
            </Section>

            <Section
              title="7. Fatores modificadores"
              description="Principais fatores de risco utilizados na classificação do grau."
            >
              <div className="space-y-5">
                <div>
                  <p className="mb-3 text-sm font-medium text-text-primary">
                    Tabagismo
                  </p>

                  <RadioGroup
                    value={data.smoking}
                    onChange={(value) =>
                      update(
                        "smoking",
                        value as Answers["smoking"]
                      )
                    }
                    options={[
                      {
                        label: "Não fumante",
                        value: "nao_fumante",
                      },
                      {
                        label: "< 10 cigarros/dia",
                        value: "menos_10",
                      },
                      {
                        label: "≥ 10 cigarros/dia",
                        value: "10_ou_mais",
                      },
                      {
                        label: "Não informado",
                        value: "nao_informado",
                      },
                    ]}
                  />
                </div>

                <div>
                  <p className="mb-3 text-sm font-medium text-text-primary">
                    Diabetes / HbA1c
                  </p>

                  <RadioGroup
                    value={data.diabetes}
                    onChange={(value) =>
                      update(
                        "diabetes",
                        value as Answers["diabetes"]
                      )
                    }
                    options={[
                      {
                        label: "Sem diabetes / normoglicêmico",
                        value: "nao",
                      },
                      {
                        label: "Diabetes — HbA1c < 7%",
                        value: "hba1c_menor_7",
                      },
                      {
                        label: "Diabetes — HbA1c ≥ 7%",
                        value: "hba1c_maior_igual_7",
                      },
                      {
                        label: "Não informado",
                        value: "nao_informado",
                      },
                    ]}
                  />
                </div>
              </div>
            </Section>

            <Section
              title="8. Condições associadas"
              description="Registre condições que exigem consideração específica."
            >
              <div>
                <p className="mb-3 text-sm font-medium text-text-primary">
                  Existe condição periodontal aguda ou outra condição
                  associada?
                </p>

                <RadioGroup
                  value={data.acuteCondition}
                  onChange={(value) =>
                    update(
                      "acuteCondition",
                      value as Answers["acuteCondition"]
                    )
                  }
                  options={[
                    {
                      label: "Nenhuma",
                      value: "nenhuma",
                    },
                    {
                      label: "Abscesso periodontal",
                      value: "abscesso",
                    },
                    {
                      label: "Lesão endo-periodontal",
                      value: "endo_perio",
                    },
                    {
                      label: "Condição necrosante",
                      value: "necrosante",
                    },
                    {
                      label: "Outra",
                      value: "outra",
                    },
                  ]}
                />
              </div>
            </Section>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setGenerated(true)}
                className="flex-1 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Gerar diagnóstico
              </button>

              <button
                type="button"
                onClick={reset}
                className="rounded-xl border border-border bg-card px-5 py-3 font-semibold text-text-primary transition hover:bg-muted"
              >
                Limpar formulário
              </button>
            </div>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Resultado
                </div>

                <h2 className="mt-1 text-xl font-bold text-text-primary">
                  Classificação periodontal
                </h2>
              </div>

              {!generated ? (
                <div className="rounded-xl border border-border bg-muted p-4">
                  <p className="text-sm leading-6 text-text-secondary">
                    Preencha os dados clínicos e radiográficos e clique em
                    <strong> Gerar diagnóstico</strong>.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <ResultItem
                    label="Condição"
                    value={result.condition}
                  />

                  <ResultItem
                    label="Estágio"
                    value={result.stage}
                  />

                  <ResultItem
                    label="Grau"
                    value={result.grade}
                  />

                  <ResultItem
                    label="Extensão"
                    value={result.extent}
                  />

                  <ResultItem
                    label="Distribuição"
                    value={result.distribution}
                  />

                  <ResultItem
                    label="Prognóstico geral"
                    value={result.prognosis}
                  />

                  <div className="rounded-xl border border-border bg-muted p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Interpretação
                    </p>

                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      {result.explanation}
                    </p>
                  </div>

                  {result.warnings.length > 0 ? (
                    <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-warning">
                        Atenção
                      </p>

                      <ul className="mt-2 space-y-2">
                        {result.warnings.map(
                          (warning, index) => (
                            <li
                              key={`${warning}-${index}`}
                              className="text-sm leading-5 text-text-secondary"
                            >
                              • {warning}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  ) : null}

                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      Apoio à decisão clínica
                    </p>

                    <p className="mt-2 text-xs leading-5 text-text-secondary">
                      Este resultado organiza os dados informados e não
                      substitui o diagnóstico clínico realizado pelo
                      cirurgião-dentista.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
