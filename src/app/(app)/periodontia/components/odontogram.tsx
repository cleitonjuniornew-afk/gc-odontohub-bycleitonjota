"use client";

import React, { useCallback, useMemo, useState } from "react";

/* ============================================================================
TIPOS
============================================================================ */

export type ToothStatus = "PRESENTE" | "AUSENTE" | "IMPLANTE";

export type SiteKey = "vm" | "vc" | "vd" | "lm" | "lc" | "ld";

export interface SiteData {
mg: number | null;
ps: number | null;
bop: boolean;
plaque: boolean;
suppuration: boolean;
}

export interface ToothData {
number: number;
status: ToothStatus;
mobility: number;
buccalFurcation: number;
lingualFurcation: number;
sites: Record<SiteKey, SiteData>;
}

export interface OdontogramProps {
initialTeeth?: ToothData[];
onChange?: (teeth: ToothData[]) => void;

/**

* Caminho das imagens dos dentes.
*
* Exemplo:
* public/periodontia/11v.png
* public/periodontia/11l.png
*
* No navegador:
* /periodontia/11v.png
  */
  teethImageBasePath?: string;

className?: string;
}

/* ============================================================================
ARCADA
============================================================================ */

const UPPER_ARCH = [
18, 17, 16, 15, 14, 13, 12, 11,
21, 22, 23, 24, 25, 26, 27, 28,
];

const LOWER_ARCH = [
48, 47, 46, 45, 44, 43, 42, 41,
31, 32, 33, 34, 35, 36, 37, 38,
];

/* ============================================================================
SÍTIOS PERIODONTAIS
============================================================================ */

const VESTIBULAR_SITES: SiteKey[] = ["vm", "vc", "vd"];

const LINGUAL_SITES: SiteKey[] = ["lm", "lc", "ld"];

const SITE_LABEL: Record<SiteKey, string> = {
vm: "MV",
vc: "V",
vd: "DV",
lm: "ML",
lc: "L",
ld: "DL",
};

/* ============================================================================
CORES DE PROFUNDIDADE
============================================================================ */

const SEVERITY = {
healthy: "#3FB27F",
mild: "#E0B33B",
moderate: "#E08A3B",
severe: "#E24C4C",
};

function severityColor(ps: number | null) {
const value = ps ?? 0;

if (value <= 3) {
return SEVERITY.healthy;
}

if (value <= 5) {
return SEVERITY.mild;
}

if (value <= 7) {
return SEVERITY.moderate;
}

return SEVERITY.severe;
}

/* ============================================================================
GRUPO DENTÁRIO
============================================================================ */

type ToothGroup =
| "incisor"
| "canine"
| "premolar"
| "molar";

function getToothGroup(fdi: number): ToothGroup {
const last = fdi % 10;

if (last === 1 || last === 2) {
return "incisor";
}

if (last === 3) {
return "canine";
}

if (last === 4 || last === 5) {
return "premolar";
}

return "molar";
}

function hasFurca(group: ToothGroup) {
return group === "premolar" || group === "molar";
}

/* ============================================================================
DADOS INICIAIS
============================================================================ */

function emptySite(): SiteData {
return {
mg: null,
ps: null,
bop: false,
plaque: false,
suppuration: false,
};
}

function createDefaultTooth(number: number): ToothData {
return {
number,
status: "PRESENTE",
mobility: 0,
buccalFurcation: 0,
lingualFurcation: 0,
sites: {
vm: emptySite(),
vc: emptySite(),
vd: emptySite(),
lm: emptySite(),
lc: emptySite(),
ld: emptySite(),
},
};
}

function createDefaultTeeth(): ToothData[] {
return [...UPPER_ARCH, ...LOWER_ARCH].map(createDefaultTooth);
}

/* ============================================================================
NÍVEL DE INSERÇÃO
============================================================================ */

function computeNI(site: SiteData): number | null {
if (site.ps === null) {
return null;
}

const mg = site.mg ?? 0;

return site.ps - mg;
}

/* ============================================================================
RESUMO
============================================================================ */

function computeSummary(teeth: ToothData[]) {
let psSum = 0;
let psCount = 0;

let niSum = 0;
let niCount = 0;

let siteCount = 0;
let bopCount = 0;
let plaqueCount = 0;

for (const tooth of teeth) {
if (tooth.status === "AUSENTE") {
continue;
}

```
const sites = [
  ...VESTIBULAR_SITES,
  ...LINGUAL_SITES,
];

for (const key of sites) {
  const site = tooth.sites[key];

  const measured =
    site.ps !== null ||
    site.mg !== null;

  if (!measured) {
    continue;
  }

  siteCount++;

  if (site.ps !== null) {
    psSum += site.ps;
    psCount++;
  }

  const ni = computeNI(site);

  if (ni !== null) {
    niSum += ni;
    niCount++;
  }

  if (site.bop) {
    bopCount++;
  }

  if (site.plaque) {
    plaqueCount++;
  }
}
```

}

return {
avgPS: psCount > 0 ? psSum / psCount : 0,

```
avgNI:
  niCount > 0
    ? niSum / niCount
    : 0,

bopPercent:
  siteCount > 0
    ? (bopCount / siteCount) * 100
    : 0,

plaquePercent:
  siteCount > 0
    ? (plaqueCount / siteCount) * 100
    : 0,
```

};
}

/* ============================================================================
INPUT NUMÉRICO
============================================================================ */

function MiniNumberInput({
value,
onChange,
placeholder,
allowNegative = false,
colorHint,
ariaLabel,
}: {
value: number | null;
onChange: (value: number | null) => void;
placeholder: string;
allowNegative?: boolean;
colorHint?: string;
ariaLabel: string;
}) {
return (
<input
type="number"
aria-label={ariaLabel}
value={value ?? ""}
placeholder={placeholder}
min={allowNegative ? -9 : 0}
max={12}
step={1}
disabled={false}
onFocus={(event) => {
event.currentTarget.select();
}}
onChange={(event) => {
const raw = event.target.value;

```
    if (raw === "") {
      onChange(null);
      return;
    }

    const number = Number(raw);

    if (Number.isNaN(number)) {
      return;
    }

    const minimum = allowNegative ? -9 : 0;
    const maximum = 12;

    const limited = Math.max(
      minimum,
      Math.min(maximum, number)
    );

    onChange(limited);
  }}
  className={[
    "w-8 h-6",
    "text-[10px]",
    "text-center",
    "rounded-sm",
    "bg-[#0B1220]",
    "border border-slate-700",
    "text-slate-100",
    "focus:outline-none",
    "focus:ring-1",
    "focus:ring-amber-400/70",
    "[appearance:textfield]",
    "[&::-webkit-outer-spin-button]:appearance-none",
    "[&::-webkit-inner-spin-button]:appearance-none",
  ].join(" ")}
  style={{
    borderColor: colorHint ?? undefined,
    color: colorHint ?? undefined,
  }}
/>
```

);
}

/* ============================================================================
COLUNA DO SÍTIO
============================================================================ */

function SiteColumn({
site,
label,
onChange,
disabled,
}: {
site: SiteData;
label: string;
onChange: (patch: Partial<SiteData>) => void;
disabled?: boolean;
}) {
const ni = computeNI(site);

const psColor =
site.ps !== null
? severityColor(site.ps)
: undefined;

return (
<div
className={[
"flex",
"flex-col",
"items-center",
"gap-1",
disabled
? "opacity-30 pointer-events-none"
: "",
].join(" ")}
> <span
     className="
       text-[8px]
       font-medium
       text-slate-500
     "
   >
{label} </span>

```
  <MiniNumberInput
    ariaLabel={`Margem gengival ${label}`}
    value={site.mg}
    placeholder="MG"
    allowNegative
    onChange={(value) => {
      onChange({
        mg: value,
      });
    }}
  />

  <MiniNumberInput
    ariaLabel={`Profundidade de sondagem ${label}`}
    value={site.ps}
    placeholder="PS"
    colorHint={psColor}
    onChange={(value) => {
      onChange({
        ps: value,
      });
    }}
  />

  {ni !== null && (
    <span
      className="text-[8px] font-semibold"
      style={{
        color: severityColor(site.ps),
      }}
    >
      NI {ni}
    </span>
  )}

  <button
    type="button"
    title="Sangramento à sondagem"
    aria-label={`Sangramento ${label}`}
    aria-pressed={site.bop}
    onClick={() => {
      onChange({
        bop: !site.bop,
      });
    }}
    className={[
      "w-3 h-3",
      "rounded-full",
      "border",
      "transition-colors",
      site.bop
        ? "bg-[#E24C4C] border-[#E24C4C]"
        : "bg-transparent border-slate-600",
    ].join(" ")}
  />

  <button
    type="button"
    title="Placa"
    aria-label={`Placa ${label}`}
    aria-pressed={site.plaque}
    onClick={() => {
      onChange({
        plaque: !site.plaque,
      });
    }}
    className={[
      "w-3 h-3",
      "rounded-sm",
      "border",
      "transition-colors",
      site.plaque
        ? "bg-[#E0B33B] border-[#E0B33B]"
        : "bg-transparent border-slate-600",
    ].join(" ")}
  />

  <button
    type="button"
    title="Supuração"
    aria-label={`Supuração ${label}`}
    aria-pressed={site.suppuration}
    onClick={() => {
      onChange({
        suppuration: !site.suppuration,
      });
    }}
    className={[
      "w-3 h-3",
      "rotate-45",
      "border",
      "transition-colors",
      site.suppuration
        ? "bg-[#C9A5E8] border-[#C9A5E8]"
        : "bg-transparent border-slate-600",
    ].join(" ")}
  />
</div>
```

);
}

/* ============================================================================
IMAGEM DO DENTE
============================================================================ */

function ToothImage({
number,
surface,
status,
basePath,
}: {
number: number;
surface: "v" | "l";
status: ToothStatus;
basePath: string;
}) {
if (status === "AUSENTE") {
return (
<div
className="
w-12
h-20
flex
items-center
justify-center
text-2xl
text-red-500/70
select-none
"
aria-label={`Dente ${number} ausente`}
>
× </div>
);
}

const imagePath =
`${basePath}/${number}${surface}.png`;

return (
<img
src={imagePath}
alt={`Dente ${number} — ${
        surface === "v"
          ? "vista vestibular"
          : "vista lingual"
      }`}
width={48}
height={80}
className="
w-12
h-20
object-contain
select-none
pointer-events-none
"
style={
status === "IMPLANTE"
? {
filter:
"grayscale(0.4) saturate(0.6) brightness(1.08) contrast(1.05)",
}
: undefined
}
draggable={false}
/>
);
}

/* ============================================================================
CONTROLES DO DENTE
============================================================================ */

function ToothControls({
tooth,
onUpdate,
}: {
tooth: ToothData;
onUpdate: (patch: Partial<ToothData>) => void;
}) {
const group = getToothGroup(tooth.number);

return ( <div className="flex flex-col items-center gap-2">
<select
aria-label={`Status do dente ${tooth.number}`}
value={tooth.status}
onChange={(event) => {
onUpdate({
status:
event.target.value as ToothStatus,
});
}}
className="
text-[8px]
bg-[#0B1220]
border border-slate-700
rounded-sm
text-slate-200
px-1
py-1
w-14
"
> <option value="PRESENTE">Pres.</option> <option value="AUSENTE">Aus.</option> <option value="IMPLANTE">Impl.</option> </select>

```
  {tooth.status !== "AUSENTE" && (
    <div
      className="flex items-center gap-1"
      title="Mobilidade"
    >
      {[0, 1, 2, 3].map((grade) => (
        <button
          key={grade}
          type="button"
          aria-label={`Mobilidade grau ${grade} — dente ${tooth.number}`}
          aria-pressed={
            tooth.mobility === grade
          }
          onClick={() => {
            onUpdate({
              mobility: grade,
            });
          }}
          className={[
            "w-4 h-4",
            "rounded-full",
            "text-[7px]",
            "flex",
            "items-center",
            "justify-center",
            "border",
            tooth.mobility === grade
              ? "bg-amber-400 border-amber-400 text-[#0B1220]"
              : "border-slate-600 text-slate-500",
          ].join(" ")}
        >
          {grade}
        </button>
      ))}
    </div>
  )}

  {tooth.status === "PRESENTE" &&
    hasFurca(group) && (
      <div
        className="
          flex
          items-center
          gap-1
        "
        title="Furca vestibular / lingual"
      >
        <select
          aria-label={`Furca vestibular — dente ${tooth.number}`}
          value={tooth.buccalFurcation}
          onChange={(event) => {
            onUpdate({
              buccalFurcation:
                Number(
                  event.target.value
                ),
            });
          }}
          className="
            text-[7px]
            bg-[#0B1220]
            border border-slate-700
            rounded-sm
            text-slate-300
            w-6
            h-5
          "
        >
          {[0, 1, 2, 3].map((grade) => (
            <option
              key={grade}
              value={grade}
            >
              {grade}
            </option>
          ))}
        </select>

        <span
          className="
            text-[7px]
            text-slate-600
          "
        >
          /
        </span>

        <select
          aria-label={`Furca lingual — dente ${tooth.number}`}
          value={tooth.lingualFurcation}
          onChange={(event) => {
            onUpdate({
              lingualFurcation:
                Number(
                  event.target.value
                ),
            });
          }}
          className="
            text-[7px]
            bg-[#0B1220]
            border border-slate-700
            rounded-sm
            text-slate-300
            w-6
            h-5
          "
        >
          {[0, 1, 2, 3].map((grade) => (
            <option
              key={grade}
              value={grade}
            >
              {grade}
            </option>
          ))}
        </select>
      </div>
    )}
</div>
```

);
}

/* ============================================================================
COLUNA COMPLETA DO DENTE
============================================================================ */

function ToothColumn({
tooth,
arch,
basePath,
onUpdateTooth,
onUpdateSite,
}: {
tooth: ToothData;
arch: "upper" | "lower";
basePath: string;
onUpdateTooth: (patch: Partial<ToothData>) => void;
onUpdateSite: (
key: SiteKey,
patch: Partial<SiteData>
) => void;
}) {
const disabledSites =
tooth.status === "AUSENTE";

const vestibularBlock = ( <div className="flex items-start justify-center gap-1">
{VESTIBULAR_SITES.map((key) => (
<SiteColumn
key={key}
site={tooth.sites[key]}
label={SITE_LABEL[key]}
disabled={disabledSites}
onChange={(patch) => {
onUpdateSite(key, patch);
}}
/>
))} </div>
);

const lingualBlock = ( <div className="flex items-start justify-center gap-1">
{LINGUAL_SITES.map((key) => (
<SiteColumn
key={key}
site={tooth.sites[key]}
label={SITE_LABEL[key]}
disabled={disabledSites}
onChange={(patch) => {
onUpdateSite(key, patch);
}}
/>
))} </div>
);

return ( <div
   className="
     flex
     flex-col
     items-center
     min-w-[88px]
     shrink-0
   "
 >
{arch === "upper"
? vestibularBlock
: lingualBlock}

```
  <div
    className="
      relative
      flex
      flex-col
      items-center
      justify-center
      my-2
    "
  >
    <ToothImage
      number={tooth.number}
      surface={
        arch === "upper"
          ? "v"
          : "l"
      }
      status={tooth.status}
      basePath={basePath}
    />

    <span
      className="
        absolute
        bottom-[-2px]
        text-[10px]
        font-semibold
        text-slate-300
      "
    >
      {tooth.number}
    </span>
  </div>

  <ToothControls
    tooth={tooth}
    onUpdate={onUpdateTooth}
  />

  {arch === "upper"
    ? lingualBlock
    : vestibularBlock}
</div>
```

);
}

/* ============================================================================
ARCADA COMPLETA
============================================================================ */

function ArchBlock({
archNumbers,
arch,
teethByNumber,
basePath,
onUpdateTooth,
onUpdateSite,
}: {
archNumbers: number[];
arch: "upper" | "lower";
teethByNumber: Map<number, ToothData>;
basePath: string;
onUpdateTooth: (
number: number,
patch: Partial<ToothData>
) => void;
onUpdateSite: (
number: number,
key: SiteKey,
patch: Partial<SiteData>
) => void;
}) {
return ( <div className="w-full overflow-x-auto"> <div
     className="
       flex
       items-start
       justify-center
       gap-1
       min-w-max
       px-2
     "
   >
{archNumbers.map((number) => {
const tooth =
teethByNumber.get(number);

```
      if (!tooth) {
        return null;
      }

      return (
        <ToothColumn
          key={number}
          tooth={tooth}
          arch={arch}
          basePath={basePath}
          onUpdateTooth={(patch) => {
            onUpdateTooth(
              number,
              patch
            );
          }}
          onUpdateSite={(
            key,
            patch
          ) => {
            onUpdateSite(
              number,
              key,
              patch
            );
          }}
        />
      );
    })}
  </div>
</div>
```

);
}

/* ============================================================================
MÉTRICA
============================================================================ */

function Metric({
label,
value,
accent,
}: {
label: string;
value: string;
accent?: string;
}) {
return ( <div className="flex-1 min-w-[160px]"> <div
     className="
       text-[10px]
       uppercase
       tracking-wide
       text-slate-500
     "
   >
{label} </div>

```
  <div
    className="
      text-lg
      font-semibold
      mt-1
    "
    style={{
      color:
        accent ?? "#F1F5F9",
    }}
  >
    {value}
  </div>
</div>
```

);
}

/* ============================================================================
BARRA DE RESUMO
============================================================================ */

function SummaryBar({
teeth,
}: {
teeth: ToothData[];
}) {
const summary = useMemo(
() => computeSummary(teeth),
[teeth]
);

return ( <div
   className="
     mt-6
     grid
     grid-cols-1
     sm:grid-cols-2
     lg:grid-cols-4
     gap-4
     border-t
     border-slate-800
     pt-5
   "
 >
<Metric
label="Profundidade média de sondagem"
value={`${summary.avgPS.toFixed(1)} mm`}
/>

```
  <Metric
    label="Nível médio de inserção"
    value={`${summary.avgNI.toFixed(1)} mm`}
  />

  <Metric
    label="Sangramento à sondagem (SS)"
    value={`${summary.bopPercent.toFixed(0)}%`}
    accent="#E24C4C"
  />

  <Metric
    label="Índice de placa (IP)"
    value={`${summary.plaquePercent.toFixed(0)}%`}
    accent="#E0B33B"
  />
</div>
```

);
}

/* ============================================================================
COMPONENTE PRINCIPAL
============================================================================ */

export default function Odontogram({
initialTeeth,
onChange,
teethImageBasePath = "/periodontia",
className,
}: OdontogramProps) {
const [teeth, setTeeth] =
useState<ToothData[]>(
() =>
initialTeeth ??
createDefaultTeeth()
);

const teethByNumber = useMemo(() => {
const map =
new Map<number, ToothData>();

```
for (const tooth of teeth) {
  map.set(
    tooth.number,
    tooth
  );
}

return map;
```

}, [teeth]);

const commit = useCallback(
(next: ToothData[]) => {
setTeeth(next);
onChange?.(next);
},
[onChange]
);

const updateTooth = useCallback(
(
number: number,
patch: Partial<ToothData>
) => {
commit(
teeth.map((tooth) =>
tooth.number === number
? {
...tooth,
...patch,
}
: tooth
)
);
},
[teeth, commit]
);

const updateSite = useCallback(
(
number: number,
key: SiteKey,
patch: Partial<SiteData>
) => {
commit(
teeth.map((tooth) =>
tooth.number === number
? {
...tooth,
sites: {
...tooth.sites,
[key]: {
...tooth.sites[key],
...patch,
},
},
}
: tooth
)
);
},
[teeth, commit]
);

return (
<div
className={[
"w-full",
"rounded-3xl",
"border border-slate-800/70",
"bg-gradient-to-b",
"from-[#050B14]",
"to-[#080F1C]",
"p-4 sm:p-6",
className ?? "",
].join(" ")}
>
{/* CABEÇALHO */}

```
  <div className="mb-5">
    <h2
      className="
        text-lg
        font-semibold
        text-slate-100
      "
    >
      Periodontograma
    </h2>

    <p
      className="
        text-xs
        text-slate-500
        mt-1
      "
    >
      Registro periodontal clínico
      por dente e por sítio.
    </p>
  </div>

  <div className="space-y-3">
    {/* ARCADA SUPERIOR */}

    <div
      className="
        flex
        items-center
        gap-2
        px-4
      "
    >
      <div
        className="
          h-px
          flex-1
          bg-slate-700/40
        "
      />

      <span
        className="
          text-[10px]
          tracking-widest
          text-slate-600
          uppercase
        "
      >
        arcada superior
      </span>

      <div
        className="
          h-px
          flex-1
          bg-slate-700/40
        "
      />
    </div>

    <ArchBlock
      archNumbers={UPPER_ARCH}
      arch="upper"
      teethByNumber={
        teethByNumber
      }
      basePath={
        teethImageBasePath
      }
      onUpdateTooth={
        updateTooth
      }
      onUpdateSite={
        updateSite
      }
    />

    {/* PLANO OCLUSAL */}

    <div
      className="
        w-full
        flex
        items-center
        gap-2
        px-4
        py-3
      "
    >
      <div
        className="
          h-px
          flex-1
          bg-slate-700/40
        "
      />

      <span
        className="
          text-[9px]
          tracking-[0.25em]
          text-slate-600
          uppercase
        "
      >
        plano oclusal
      </span>

      <div
        className="
          h-px
          flex-1
          bg-slate-700/40
        "
      />
    </div>

    {/* ARCADA INFERIOR */}

    <div
      className="
        flex
        items-center
        gap-2
        px-4
      "
    >
      <div
        className="
          h-px
          flex-1
          bg-slate-700/40
        "
      />

      <span
        className="
          text-[10px]
          tracking-widest
          text-slate-600
          uppercase
        "
      >
        arcada inferior
      </span>

      <div
        className="
          h-px
          flex-1
          bg-slate-700/40
        "
      />
    </div>

    <ArchBlock
      archNumbers={LOWER_ARCH}
      arch="lower"
      teethByNumber={
        teethByNumber
      }
      basePath={
        teethImageBasePath
      }
      onUpdateTooth={
        updateTooth
      }
      onUpdateSite={
        updateSite
      }
    />
  </div>

  {/* RESUMO */}

  <SummaryBar teeth={teeth} />
</div>

);
}

/* ============================================================================
EXPORTAÇÃO NOMEADA
------------------

A page.tsx atualmente usa:

import { Odontogram } from "./components/odontogram";

Por isso também exportamos o componente com nome.
============================================================================ */

export { Odontogram };
