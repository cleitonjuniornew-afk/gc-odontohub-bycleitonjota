"use client";

import { useEffect, useMemo, useState } from "react";
import {
AlertTriangle,
CheckCircle2,
ClipboardCheck,
Info,
Save,
Stethoscope,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type YesNo = "sim" | "nao" | "nao_informado";

type SmokingStatus =
| "nao_fuma"
| "fumante"
| "ex_fumante"
| "nao_informado";

type DiabetesStatus =
| "nao"
| "sim"
| "nao_informado";

type DiabetesControl =
| "controlado"
| "nao_controlado"
| "nao_informado";

type BoneLossPattern =
| "nenhuma"
| "horizontal"
| "vertical"
| "mista";

type Stage =
| "I"
| "II"
| "III"
| "IV"
| "Não determinado";

type Grade =
| "A"
| "B"
| "C"
| "Não determinado";

type Extent =
| "Localizada"
| "Generalizada"
| "Não determinado";

type Distribution =
| "Nenhuma"
| "Padrão molar/incisivo"
| "Não determinado";

type Prognosis =
| "Favorável"
| "Questionável"
| "Desfavorável"
| "Reservado"
| "Sem prognóstico determinado";

type AcuteCondition =
| "abscesso_periodontal"
| "lesao_endo_periodontal"
| "gengivite_ulcerativa"
| "periodontite_ulcerativa";

type DiagnosticForm = {
bleeding: YesNo;
plaque: YesNo;
calculus: YesNo;
clinicalAttachmentLoss: YesNo;
radiographicBoneLoss: YesNo;

maximumProbingDepth: string;
maximumCAL: string;
radiographicBoneLossPercent: string;
teethLostToPeriodontitis: string;
affectedTeethPercent: string;

mobility: YesNo;
furcation: YesNo;
furcationClassIIOrIII: YesNo;
verticalBoneLoss: YesNo;

masticatoryDysfunction: YesNo;
secondaryOcclusalTrauma: YesNo;
ridgeDefectModerate: YesNo;
ridgeDefectSevere: YesNo;
occlusalCollapse: YesNo;
complexRehabilitation: YesNo;
remainingTeeth: string;

boneLossPattern: BoneLossPattern;

smoking: SmokingStatus;
cigarettesPerDay: string;

diabetes: DiabetesStatus;
diabetesControl: DiabetesControl;
hba1c: string;

progressionEvidence: YesNo;
boneLossFiveYears: string;
calFiveYears: string;
patientAge: string;

acuteConditions: AcuteCondition[];

prognosis: Prognosis;
};

type DiagnosisResult = {
condition:
| "Periodonto clinicamente saudável"
| "Gengivite"
| "Periodontite"
| "Condição aguda necessita avaliação específica"
| "Dados insuficientes";

stage: Stage;
grade: Grade;
extent: Extent;
distribution: Distribution;
prognosis: Prognosis;
modifiers: string[];
warnings: string[];
canClassify: boolean;
};

const STORAGE_KEY = "gc-odontohub-periodontal-diagnostico";

const initialForm: DiagnosticForm = {
bleeding: "nao_informado",
plaque: "nao_informado",
calculus: "nao_informado",
clinicalAttachmentLoss: "nao_informado",
radiographicBoneLoss: "nao_informado",

maximumProbingDepth: "",
maximumCAL: "",
radiographicBoneLossPercent: "",
teethLostToPeriodontitis: "",
affectedTeethPercent: "",

mobility: "nao_informado",
furcation: "nao_informado",
furcationClassIIOrIII: "nao_informado",
verticalBoneLoss: "nao_informado",

masticatoryDysfunction: "nao_informado",
secondaryOcclusalTrauma: "nao_informado",
ridgeDefectModerate: "nao_informado",
ridgeDefectSevere: "nao_informado",
occlusalCollapse: "nao_informado",
complexRehabilitation: "nao_informado",
remainingTeeth: "",

boneLossPattern: "nenhuma",

smoking: "nao_informado",
cigarettesPerDay: "",

diabetes: "nao_informado",
diabetesControl: "nao_informado",
hba1c: "",

progressionEvidence: "nao_informado",
boneLossFiveYears: "",
calFiveYears: "",
patientAge: "",

acuteConditions: [],

prognosis: "Sem prognóstico determinado",
};

function numberValue(value: string): number | null {
if (!value.trim()) {
return null;
}

const parsed = Number(value.replace(",", "."));

return Number.isFinite(parsed) ? parsed : null;
}

function yes(value: YesNo): boolean {
return value === "sim";
}

function calculateStage(form: DiagnosticForm): Stage {
const cal = numberValue(form.maximumCAL);
const probingDepth = numberValue(form.maximumProbingDepth);
const teethLost = numberValue(form.teethLostToPeriodontitis);
const remainingTeeth = numberValue(form.remainingTeeth);

const hasCal =
form.clinicalAttachmentLoss === "sim" &&
cal !== null;

const hasBoneLoss =
form.radiographicBoneLoss === "sim" &&
numberValue(form.radiographicBoneLossPercent) !== null;

const boneLoss = numberValue(
form.radiographicBoneLossPercent
);

if (!hasCal && !hasBoneLoss) {
return "Não determinado";
}

/*

* A lógica abaixo segue a tabela fornecida para o projeto:
*
* Estágio I:
* CAL 1–2 mm / perda óssea <15%
*
* Estágio II:
* CAL 3–4 mm / perda óssea 15–33%
*
* Estágio III:
* CAL >=5 mm / perda óssea até terço médio/apical,
* associado aos critérios de complexidade.
*
* Estágio IV:
* critérios do estágio III + comprometimento funcional/
* necessidade de reabilitação complexa.
*
* Quando faltam dados essenciais, não inventamos a classificação.
  */

const stageIV =
form.complexRehabilitation === "sim" ||
form.masticatoryDysfunction === "sim" ||
form.secondaryOcclusalTrauma === "sim" ||
form.ridgeDefectSevere === "sim" ||
form.occlusalCollapse === "sim" ||
(remainingTeeth !== null && remainingTeeth < 20) ||
(teethLost !== null && teethLost >= 5);

if (
stageIV &&
(cal !== null && cal >= 5 ||
(boneLoss !== null && boneLoss > 33))
) {
return "IV";
}

const stageIII =
(cal !== null && cal >= 5) ||
(probingDepth !== null && probingDepth >= 6) ||
form.verticalBoneLoss === "sim" ||
form.furcationClassIIOrIII === "sim" ||
form.ridgeDefectModerate === "sim";

if (stageIII) {
return "III";
}

if (
(cal !== null && cal >= 3 && cal <= 4) ||
(boneLoss !== null && boneLoss >= 15 && boneLoss <= 33) ||
(probingDepth !== null && probingDepth === 5)
) {
return "II";
}

if (
(cal !== null && cal >= 1 && cal <= 2) ||
(boneLoss !== null && boneLoss > 0 && boneLoss < 15) ||
(probingDepth !== null && probingDepth <= 4)
) {
return "I";
}

return "Não determinado";
}

function calculateGrade(form: DiagnosticForm): Grade {
const progression = form.progressionEvidence;

const boneLossFiveYears = numberValue(
form.boneLossFiveYears
);

const calFiveYears = numberValue(
form.calFiveYears
);

const age = numberValue(form.patientAge);
const currentBoneLoss = numberValue(
form.radiographicBoneLossPercent
);

if (
progression === "sim" &&
(boneLossFiveYears !== null ||
calFiveYears !== null)
) {
if (
(boneLossFiveYears !== null &&
boneLossFiveYears >= 2) ||
(calFiveYears !== null &&
calFiveYears >= 2)
) {
return "C";
}
}

if (
age !== null &&
age > 0 &&
currentBoneLoss !== null
) {
const ratio = currentBoneLoss / age;

```
if (ratio > 1) {
  return "C";
}

if (ratio >= 0.25) {
  return "B";
}

if (ratio < 0.25) {
  return "A";
}
```

}

/*

* Tabagismo e diabetes são modificadores de risco.
* Não transformamos automaticamente "fumante" em Grau C.
  */
  if (
  form.smoking === "fumante" &&
  numberValue(form.cigarettesPerDay) !== null &&
  (numberValue(form.cigarettesPerDay) ?? 0) >= 10
  ) {
  return "C";
  }

if (
form.diabetes === "sim" &&
form.diabetesControl === "nao_controlado"
) {
return "C";
}

if (
form.diabetes === "sim" &&
form.diabetesControl === "controlado"
) {
return "B";
}

if (
progression === "nao" &&
(boneLossFiveYears !== null ||
calFiveYears !== null)
) {
return "A";
}

return "Não determinado";
}

function calculateDiagnosis(
form: DiagnosticForm
): DiagnosisResult {
const warnings: string[] = [];
const modifiers: string[] = [];

const hasAcuteCondition =
form.acuteConditions.length > 0;

if (hasAcuteCondition) {
warnings.push(
"Existe uma condição periodontal aguda selecionada. Ela deve ser avaliada separadamente antes de concluir a classificação periodontal."
);
}

if (form.smoking === "fumante") {
modifiers.push("Tabagismo");
}

if (form.diabetes === "sim") {
modifiers.push(
form.diabetesControl === "nao_controlado"
? "Diabetes com controle metabólico não informado/insuficiente"
: "Diabetes"
);
}

if (form.mobility === "sim") {
modifiers.push("Mobilidade dentária");
}

if (form.furcation === "sim") {
modifiers.push("Envolvimento de furca");
}

if (form.suppuration) {
modifiers.push("Supuração");
}

const cal = numberValue(form.maximumCAL);
const probingDepth = numberValue(
form.maximumProbingDepth
);
const boneLoss = numberValue(
form.radiographicBoneLossPercent
);

const hasPeriodontitisEvidence =
form.clinicalAttachmentLoss === "sim" &&
cal !== null &&
cal >= 1;

if (!hasPeriodontitisEvidence) {
const hasGingivalInflammation =
form.bleeding === "sim" ||
form.plaque === "sim" ||
form.calculus === "sim";

```
if (hasGingivalInflammation) {
  return {
    condition: hasAcuteCondition
      ? "Condição aguda necessita avaliação específica"
      : "Gengivite",
    stage: "Não determinado",
    grade: "Não determinado",
    extent: "Não determinado",
    distribution: "Não determinado",
    prognosis: form.prognosis,
    modifiers,
    warnings: [
      ...warnings,
      "Não há dados suficientes que sustentem periodontite.",
    ],
    canClassify: !hasAcuteCondition,
  };
}

return {
  condition: hasAcuteCondition
    ? "Condição aguda necessita avaliação específica"
    : "Periodonto clinicamente saudável",
  stage: "Não determinado",
  grade: "Não determinado",
  extent: "Não determinado",
  distribution: "Não determinado",
  prognosis: form.prognosis,
  modifiers,
  warnings,
  canClassify: !hasAcuteCondition,
};
```

}

if (
cal === null ||
form.radiographicBoneLoss === "nao_informado"
) {
warnings.push(
"São necessários dados clínicos e radiográficos adicionais para determinar a classificação definitiva."
);
}

if (
form.affectedTeethPercent.trim() === ""
) {
warnings.push(
"Informe a porcentagem de dentes afetados para determinar a extensão."
);
}

if (
form.progressionEvidence === "nao_informado"
) {
warnings.push(
"A evidência de progressão não foi informada. O grau permanece indeterminado."
);
}

const stage = calculateStage(form);
const grade = calculateGrade(form);

const affectedPercent = numberValue(
form.affectedTeethPercent
);

let extent: Extent = "Não determinado";

if (affectedPercent !== null) {
extent =
affectedPercent < 30
? "Localizada"
: "Generalizada";
}

let distribution: Distribution =
"Nenhuma";

if (
form.boneLossPattern !== "nenhuma" &&
affectedPercent !== null
) {
distribution =
affectedPercent < 30
? "Nenhuma"
: "Padrão molar/incisivo";
}

const canClassify =
warnings.length === 0 &&
stage !== "Não determinado" &&
grade !== "Não determinado" &&
extent !== "Não determinado";

if (probingDepth === null) {
warnings.push(
"A profundidade máxima de sondagem não foi informada."
);
}

if (boneLoss === null) {
warnings.push(
"A perda óssea radiográfica percentual não foi informada."
);
}

return {
condition: "Periodontite",
stage,
grade,
extent,
distribution,
prognosis: form.prognosis,
modifiers,
warnings,
canClassify,
};
}

function OptionButton({
selected,
children,
onClick,
}: {
selected: boolean;
children: React.ReactNode;
onClick: () => void;
}) {
return (
<button
type="button"
onClick={onClick}
className={[
"rounded-lg border px-3 py-2 text-sm transition",
selected
? "border-primary bg-primary/10 text-primary"
: "border-border bg-background text-text-secondary hover:border-primary/40 hover:text-text-primary",
].join(" ")}
>
{children} </button>
);
}

function YesNoField({
label,
value,
onChange,
}: {
label: string;
value: YesNo;
onChange: (value: YesNo) => void;
}) {
return ( <div className="space-y-2"> <Label>{label}</Label>

```
  <div className="flex flex-wrap gap-2">
    <OptionButton
      selected={value === "sim"}
      onClick={() => onChange("sim")}
    >
      Sim
    </OptionButton>

    <OptionButton
      selected={value === "nao"}
      onClick={() => onChange("nao")}
    >
      Não
    </OptionButton>

    <OptionButton
      selected={value === "nao_informado"}
      onClick={() => onChange("nao_informado")}
    >
      Não informado
    </OptionButton>
  </div>
</div>
```

);
}

function NumericField({
label,
value,
onChange,
suffix,
placeholder,
}: {
label: string;
value: string;
onChange: (value: string) => void;
suffix?: string;
placeholder?: string;
}) {
return ( <div className="space-y-2"> <Label>{label}</Label>

```
  <div className="flex items-center gap-2">
    <Input
      type="number"
      min="0"
      step="0.1"
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      placeholder={placeholder ?? "0"}
    />

    {suffix && (
      <span className="shrink-0 text-sm text-text-muted">
        {suffix}
      </span>
    )}
  </div>
</div>
```

);
}

export default function DiagnosticoPeriodontalPage() {
const [form, setForm] =
useState<DiagnosticForm>(initialForm);

const [saved, setSaved] = useState(false);

useEffect(() => {
try {
const raw = window.localStorage.getItem(
STORAGE_KEY
);

```
  if (!raw) {
    return;
  }

  const parsed = JSON.parse(raw) as Partial<DiagnosticForm>;

  setForm({
    ...initialForm,
    ...parsed,
  });
} catch (error) {
  console.error(
    "Erro ao carregar diagnóstico periodontal:",
    error
  );
}
```

}, []);

useEffect(() => {
const timer = window.setTimeout(() => {
try {
window.localStorage.setItem(
STORAGE_KEY,
JSON.stringify(form)
);

```
    setSaved(true);
  } catch (error) {
    console.error(
      "Erro ao salvar diagnóstico periodontal:",
      error
    );
  }
}, 500);

return () => {
  window.clearTimeout(timer);
};
```

}, [form]);

const result = useMemo(
() => calculateDiagnosis(form),
[form]
);

function update<K extends keyof DiagnosticForm>(
field: K,
value: DiagnosticForm[K]
) {
setForm((current) => ({
...current,
[field]: value,
}));

```
setSaved(false);
```

}

function toggleAcuteCondition(
condition: AcuteCondition
) {
setForm((current) => {
const exists =
current.acuteConditions.includes(condition);

```
  return {
    ...current,
    acuteConditions: exists
      ? current.acuteConditions.filter(
          (item) => item !== condition
        )
      : [
          ...current.acuteConditions,
          condition,
        ],
  };
});

setSaved(false);
```

}

function clearForm() {
const confirmed = window.confirm(
"Deseja limpar todos os dados do diagnóstico periodontal?"
);

```
if (!confirmed) {
  return;
}

setForm(initialForm);
setSaved(false);

try {
  window.localStorage.removeItem(
    STORAGE_KEY
  );
} catch (error) {
  console.error(
    "Erro ao limpar diagnóstico:",
    error
  );
}
```

}

return ( <div className="space-y-6">
<PageHeader
title="Diagnóstico Periodontal"
description="Sistema de apoio à avaliação e classificação periodontal."
action={ <div className="flex items-center gap-2">
{saved && ( <span className="hidden items-center gap-1 text-xs text-text-muted sm:flex"> <CheckCircle2 className="h-3.5 w-3.5" />
Salvo automaticamente </span>
)}

```
        <Button
          variant="ghost"
          onClick={clearForm}
        >
          Limpar
        </Button>
      </div>
    }
  />

  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
    {/* FORMULÁRIO */}
    <div className="space-y-6">
      {/* CONDIÇÃO GENGIVAL */}
      <Card>
        <CardHeader>
          <CardTitle>
            1. Condição periodontal
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-5 sm:grid-cols-2">
          <YesNoField
            label="Sangramento à sondagem"
            value={form.bleeding}
            onChange={(value) =>
              update("bleeding", value)
            }
          />

          <YesNoField
            label="Biofilme"
            value={form.plaque}
            onChange={(value) =>
              update("plaque", value)
            }
          />

          <YesNoField
            label="Cálculo"
            value={form.calculus}
            onChange={(value) =>
              update("calculus", value)
            }
          />

          <YesNoField
            label="Perda de inserção clínica"
            value={
              form.clinicalAttachmentLoss
            }
            onChange={(value) =>
              update(
                "clinicalAttachmentLoss",
                value
              )
            }
          />

          <YesNoField
            label="Perda óssea radiográfica"
            value={
              form.radiographicBoneLoss
            }
            onChange={(value) =>
              update(
                "radiographicBoneLoss",
                value
              )
            }
          />

          <YesNoField
            label="Mobilidade dentária"
            value={form.mobility}
            onChange={(value) =>
              update("mobility", value)
            }
          />

          <YesNoField
            label="Envolvimento de furca"
            value={form.furcation}
            onChange={(value) =>
              update("furcation", value)
            }
          />

          <YesNoField
            label="Furca classe II ou III"
            value={
              form.furcationClassIIOrIII
            }
            onChange={(value) =>
              update(
                "furcationClassIIOrIII",
                value
              )
            }
          />
        </CardContent>
      </Card>

      {/* MEDIDAS */}
      <Card>
        <CardHeader>
          <CardTitle>
            2. Dados clínicos e radiográficos
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-5 sm:grid-cols-2">
          <NumericField
            label="Maior profundidade de sondagem"
            value={
              form.maximumProbingDepth
            }
            onChange={(value) =>
              update(
                "maximumProbingDepth",
                value
              )
            }
            suffix="mm"
            placeholder="Ex.: 6"
          />

          <NumericField
            label="Maior perda de inserção clínica"
            value={form.maximumCAL}
            onChange={(value) =>
              update("maximumCAL", value)
            }
            suffix="mm"
            placeholder="Ex.: 5"
          />

          <NumericField
            label="Maior perda óssea radiográfica"
            value={
              form.radiographicBoneLossPercent
            }
            onChange={(value) =>
              update(
                "radiographicBoneLossPercent",
                value
              )
            }
            suffix="%"
            placeholder="Ex.: 35"
          />

          <NumericField
            label="Dentes perdidos por periodontite"
            value={
              form.teethLostToPeriodontitis
            }
            onChange={(value) =>
              update(
                "teethLostToPeriodontitis",
                value
              )
            }
            suffix="dentes"
          />

          <NumericField
            label="Percentual de dentes afetados"
            value={
              form.affectedTeethPercent
            }
            onChange={(value) =>
              update(
                "affectedTeethPercent",
                value
              )
            }
            suffix="%"
            placeholder="Ex.: 40"
          />

          <NumericField
            label="Número de dentes remanescentes"
            value={form.remainingTeeth}
            onChange={(value) =>
              update(
                "remainingTeeth",
                value
              )
            }
            suffix="dentes"
          />
        </CardContent>
      </Card>

      {/* COMPLEXIDADE */}
      <Card>
        <CardHeader>
          <CardTitle>
            3. Complexidade e fatores locais
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <YesNoField
            label="Perda óssea vertical/angular"
            value={form.verticalBoneLoss}
            onChange={(value) =>
              update(
                "verticalBoneLoss",
                value
              )
            }
          />

          <YesNoField
            label="Defeito de rebordo moderado"
            value={
              form.ridgeDefectModerate
            }
            onChange={(value) =>
              update(
                "ridgeDefectModerate",
                value
              )
            }
          />

          <YesNoField
            label="Defeito de rebordo grave"
            value={
              form.ridgeDefectSevere
            }
            onChange={(value) =>
              update(
                "ridgeDefectSevere",
                value
              )
            }
          />

          <YesNoField
            label="Disfunção mastigatória"
            value={
              form.masticatoryDysfunction
            }
            onChange={(value) =>
              update(
                "masticatoryDysfunction",
                value
              )
            }
          />

          <YesNoField
            label="Trauma oclusal secundário"
            value={
              form.secondaryOcclusalTrauma
            }
            onChange={(value) =>
              update(
                "secondaryOcclusalTrauma",
                value
              )
            }
          />

          <YesNoField
            label="Colapso oclusal"
            value={form.occlusalCollapse}
            onChange={(value) =>
              update(
                "occlusalCollapse",
                value
              )
            }
          />

          <YesNoField
            label="Necessidade de reabilitação complexa"
            value={
              form.complexRehabilitation
            }
            onChange={(value) =>
              update(
                "complexRehabilitation",
                value
              )
            }
          />

          <div className="space-y-2">
            <Label>
              Padrão da perda óssea
            </Label>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["nenhuma", "Nenhuma"],
                  [
                    "horizontal",
                    "Horizontal",
                  ],
                  [
                    "vertical",
                    "Vertical/angular",
                  ],
                  ["mista", "Mista"],
                ] as const
              ).map(([value, label]) => (
                <OptionButton
                  key={value}
                  selected={
                    form.boneLossPattern ===
                    value
                  }
                  onClick={() =>
                    update(
                      "boneLossPattern",
                      value
                    )
                  }
                >
                  {label}
                </OptionButton>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GRAU */}
      <Card>
        <CardHeader>
          <CardTitle>
            4. Progressão e grau
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <YesNoField
            label="Existe evidência de progressão da doença?"
            value={
              form.progressionEvidence
            }
            onChange={(value) =>
              update(
                "progressionEvidence",
                value
              )
            }
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <NumericField
              label="Perda óssea radiográfica em 5 anos"
              value={
                form.boneLossFiveYears
              }
              onChange={(value) =>
                update(
                  "boneLossFiveYears",
                  value
                )
              }
              suffix="mm"
            />

            <NumericField
              label="Perda de inserção em 5 anos"
              value={form.calFiveYears}
              onChange={(value) =>
                update(
                  "calFiveYears",
                  value
                )
              }
              suffix="mm"
            />

            <NumericField
              label="Idade do paciente"
              value={form.patientAge}
              onChange={(value) =>
                update(
                  "patientAge",
                  value
                )
              }
              suffix="anos"
            />
          </div>

          <div className="rounded-lg border border-border bg-background/50 p-4 text-sm text-text-secondary">
            O grau não deve ser definido
            apenas por tabagismo ou diabetes.
            Esses fatores funcionam como
            modificadores de risco.
          </div>
        </CardContent>
      </Card>

      {/* FATORES MODIFICADORES */}
      <Card>
        <CardHeader>
          <CardTitle>
            5. Fatores modificadores
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Tabagismo</Label>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  [
                    "nao_fuma",
                    "Não fuma",
                  ],
                  [
                    "fumante",
                    "Fumante",
                  ],
                  [
                    "ex_fumante",
                    "Ex-fumante",
                  ],
                  [
                    "nao_informado",
                    "Não informado",
                  ],
                ] as const
              ).map(([value, label]) => (
                <OptionButton
                  key={value}
                  selected={
                    form.smoking ===
                    value
                  }
                  onClick={() =>
                    update(
                      "smoking",
                      value
                    )
                  }
                >
                  {label}
                </OptionButton>
              ))}
            </div>
          </div>

          {form.smoking === "fumante" && (
            <NumericField
              label="Cigarros por dia"
              value={
                form.cigarettesPerDay
              }
              onChange={(value) =>
                update(
                  "cigarettesPerDay",
                  value
                )
              }
              suffix="cigarros/dia"
            />
          )}

          <div className="space-y-2">
            <Label>Diabetes</Label>

            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["nao", "Não"],
                  ["sim", "Sim"],
                  [
                    "nao_informado",
                    "Não informado",
                  ],
                ] as const
              ).map(([value, label]) => (
                <OptionButton
                  key={value}
                  selected={
                    form.diabetes ===
                    value
                  }
                  onClick={() =>
                    update(
                      "diabetes",
                      value
                    )
                  }
                >
                  {label}
                </OptionButton>
              ))}
            </div>
          </div>

          {form.diabetes === "sim" && (
            <div className="space-y-2">
              <Label>
                Controle metabólico
              </Label>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    [
                      "controlado",
                      "Controlado",
                    ],
                    [
                      "nao_controlado",
                      "Não controlado",
                    ],
                    [
                      "nao_informado",
                      "Não informado",
                    ],
                  ] as const
                ).map(
                  ([value, label]) => (
                    <OptionButton
                      key={value}
                      selected={
                        form.diabetesControl ===
                        value
                      }
                      onClick={() =>
                        update(
                          "diabetesControl",
                          value
                        )
                      }
                    >
                      {label}
                    </OptionButton>
                  )
                )}
              </div>

              <NumericField
                label="HbA1c"
                value={form.hba1c}
                onChange={(value) =>
                  update(
                    "hba1c",
                    value
                  )
                }
                suffix="%"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* CONDIÇÕES AGUDAS */}
      <Card>
        <CardHeader>
          <CardTitle>
            6. Condições periodontais agudas
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {(
            [
              [
                "abscesso_periodontal",
                "Abscesso periodontal",
              ],
              [
                "lesao_endo_periodontal",
                "Lesão endo-periodontal",
              ],
              [
                "gengivite_ulcerativa",
                "Gengivite ulcerativa",
              ],
              [
                "periodontite_ulcerativa",
                "Periodontite ulcerativa",
              ],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                toggleAcuteCondition(
                  value
                )
              }
              className={[
                "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition",
                form.acuteConditions.includes(
                  value
                )
                  ? "border-warning bg-warning/10 text-text-primary"
                  : "border-border hover:border-warning/40",
              ].join(" ")}
            >
              <span>{label}</span>

              {form.acuteConditions.includes(
                value
              ) && (
                <CheckCircle2 className="h-4 w-4 text-warning" />
              )}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* PROGNÓSTICO */}
      <Card>
        <CardHeader>
          <CardTitle>
            7. Prognóstico geral
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(
              [
                "Favorável",
                "Questionável",
                "Desfavorável",
                "Reservado",
                "Sem prognóstico determinado",
              ] as Prognosis[]
            ).map((value) => (
              <OptionButton
                key={value}
                selected={
                  form.prognosis ===
                  value
                }
                onClick={() =>
                  update(
                    "prognosis",
                    value
                  )
                }
              >
                {value}
              </OptionButton>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* RESULTADO */}
    <div className="xl:sticky xl:top-6 xl:self-start">
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Stethoscope className="h-5 w-5" />
            </div>

            <div>
              <CardTitle>
                Diagnóstico Periodontal
              </CardTitle>

              <p className="mt-1 text-xs text-text-muted">
                Resultado baseado nos dados
                informados
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">
              Diagnóstico
            </p>

            <p className="mt-1 text-xl font-semibold text-text-primary">
              {result.condition}
            </p>
          </div>

          {result.condition ===
            "Periodontite" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border p-3">
                  <p className="text-xs text-text-muted">
                    Estágio
                  </p>

                  <p className="mt-1 text-2xl font-bold text-primary">
                    {result.stage}
                  </p>
                </div>

                <div className="rounded-xl border border-border p-3">
                  <p className="text-xs text-text-muted">
                    Grau
                  </p>

                  <p className="mt-1 text-2xl font-bold text-primary">
                    {result.grade}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-lg bg-background p-3">
                  <p className="text-xs text-text-muted">
                    Extensão
                  </p>

                  <p className="mt-1 font-medium text-text-primary">
                    {result.extent}
                  </p>
                </div>

                <div className="rounded-lg bg-background p-3">
                  <p className="text-xs text-text-muted">
                    Distribuição
                  </p>

                  <p className="mt-1 font-medium text-text-primary">
                    {result.distribution}
                  </p>
                </div>

                <div className="rounded-lg bg-background p-3">
                  <p className="text-xs text-text-muted">
                    Prognóstico
                  </p>

                  <p className="mt-1 font-medium text-text-primary">
                    {result.prognosis}
                  </p>
                </div>
              </div>
            </>
          )}

          {result.modifiers.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-text-muted">
                Fatores modificadores
              </p>

              <div className="flex flex-wrap gap-2">
                {result.modifiers.map(
                  (modifier) => (
                    <Badge
                      key={modifier}
                      variant="warning"
                    >
                      {modifier}
                    </Badge>
                  )
                )}
              </div>
            </div>
          )}

          {result.canClassify ? (
            <div className="flex gap-2 rounded-lg border border-success/20 bg-success/5 p-3 text-sm text-text-secondary">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />

              <p>
                Os dados preenchidos permitem
                apresentar esta classificação
                como resultado de apoio.
              </p>
            </div>
          ) : (
            <div className="flex gap-2 rounded-lg border border-warning/20 bg-warning/5 p-3 text-sm text-text-secondary">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />

              <div>
                <p className="font-medium text-text-primary">
                  Dados insuficientes
                </p>

                <p className="mt-1">
                  Não é possível determinar
                  a classificação definitiva
                  com os dados informados.
                </p>
              </div>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div className="space-y-2">
              {result.warnings.map(
                (warning) => (
                  <div
                    key={warning}
                    className="flex gap-2 rounded-lg border border-border bg-background p-3 text-xs text-text-secondary"
                  >
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />

                    <span>{warning}</span>
                  </div>
                )
              )}
            </div>
          )}

          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Save className="h-3.5 w-3.5" />

              <span>
                Alterações salvas automaticamente
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

            <p className="text-xs leading-relaxed text-text-secondary">
              Este módulo é uma ferramenta de
              apoio à decisão clínica. A
              classificação deve ser confirmada
              pelo cirurgião-dentista mediante
              avaliação clínica, radiográfica e
              histórico do paciente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</div>

);
}
