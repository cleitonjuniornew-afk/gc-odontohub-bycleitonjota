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
teethImageBasePath?: string;
className?: string;
examId?: string;
patientId?: string;
}

/* ============================================================================
ARCADAS
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
SÍTIOS
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
CORES
============================================================================ */

const COLORS = {
text: "#172033",
muted: "#64748B",
border: "#CBD5E1",
tooth: "#FFFDF5",
toothStroke: "#4B5563",

periodontalBlack: "#111827",
periodontalBlue: "#2563EB",
periodontalRed: "#DC2626",

healthy: "#16A34A",
mild: "#CA8A04",
moderate: "#EA580C",
severe: "#DC2626",

bop: "#DC2626",
plaque: "#D97706",
suppuration: "#9333EA",
};

function severityColor(ps: number | null) {
const value = ps ?? 0;

if (value <= 3) return COLORS.healthy;
if (value <= 5) return COLORS.mild;
if (value <= 7) return COLORS.moderate;

return COLORS.severe;
}

/* ============================================================================
TIPO DO DENTE
============================================================================ */

type ToothGroup =
| "incisor"
| "canine"
| "premolar"
| "molar";

function getToothGroup(fdi: number): ToothGroup {
const last = fdi % 10;

if (last === 1 || last === 2) return "incisor";
if (last === 3) return "canine";
if (last === 4 || last === 5) return "premolar";

return "molar";
}

function hasFurca(group: ToothGroup) {
return group === "premolar" || group === "molar";
}

/* ============================================================================
DADOS
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
NI
============================================================================ */

function computeNI(site: SiteData): number | null {
if (site.ps === null) return null;

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
if (tooth.status === "AUSENTE") continue;

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

  if (!measured) continue;

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

  if (site.bop) bopCount++;
  if (site.plaque) plaqueCount++;
}
```

}

return {
avgPS:
psCount > 0
? psSum / psCount
: 0,

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
SVG BASE
============================================================================ */

interface ToothSVGProps {
type: ToothGroup;
upper: boolean;
lingual: boolean;
status: ToothStatus;
number: number;
}

/* ============================================================================
INCISIVO
============================================================================ */

function IncisorSVG({
upper,
lingual,
status,
}: {
upper: boolean;
lingual: boolean;
status: ToothStatus;
}) {
return (
<g
transform={
upper
? "translate(0 0)"
: "translate(0 150) scale(1 -1)"
}
>
{/* COROA */} <path
     d="
       M35 18
       C39 12 44 10 50 10
       C56 10 61 12 65 18
       L63 58
       C58 64 42 64 37 58
       Z
     "
     fill={COLORS.tooth}
     stroke={COLORS.toothStroke}
     strokeWidth="1.6"
   />

```
  {/* LINHA CERVICAL */}
  <path
    d="M35 58 C42 64 58 64 65 58"
    fill="none"
    stroke={COLORS.toothStroke}
    strokeWidth="1.2"
  />

  {/* RAIZ */}
  <path
    d="
      M39 67
      C40 83 42 101 45 119
      C47 132 48 141 50 146
      C52 141 53 132 55 119
      C58 101 60 83 61 67
      C56 71 44 71 39 67
      Z
    "
    fill={COLORS.tooth}
    stroke={COLORS.toothStroke}
    strokeWidth="1.6"
  />

  {/* DETALHES LINGUAIS */}
  {lingual && (
    <>
      <path
        d="
          M40 29
          C44 24 56 24 60 29
          L58 51
          C55 56 45 56 42 51
          Z
        "
        fill="none"
        stroke="#64748B"
        strokeWidth="1"
      />

      <path
        d="M43 54 C47 58 53 58 57 54"
        fill="none"
        stroke="#64748B"
        strokeWidth="1"
      />
    </>
  )}

  {/* IMPLANTE */}
  {status === "IMPLANTE" && (
    <g
      stroke="#64748B"
      strokeWidth="1.5"
    >
      <path d="M43 74 H57" />
      <path d="M44 80 H56" />
      <path d="M45 86 H55" />
      <path d="M46 92 H54" />
    </g>
  )}
</g>
```

);
}

/* ============================================================================
CANINO
============================================================================ */

function CanineSVG({
upper,
lingual,
status,
}: {
upper: boolean;
lingual: boolean;
status: ToothStatus;
}) {
return (
<g
transform={
upper
? "translate(0 0)"
: "translate(0 150) scale(1 -1)"
}
>
{/* COROA - SEM PONTA EXAGERADA */} <path
     d="
       M34 20
       C39 13 44 11 50 14
       C56 11 61 13 66 20
       L63 58
       C58 64 42 64 37 58
       Z
     "
     fill={COLORS.tooth}
     stroke={COLORS.toothStroke}
     strokeWidth="1.6"
   />

```
  {/* CÚSPIDE SUAVE */}
  <path
    d="M45 14 L50 9 L55 14"
    fill="none"
    stroke={COLORS.toothStroke}
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  />

  {/* CERVICAL */}
  <path
    d="M34 58 C42 64 58 64 66 58"
    fill="none"
    stroke={COLORS.toothStroke}
    strokeWidth="1.2"
  />

  {/* RAIZ */}
  <path
    d="
      M39 67
      C40 85 42 104 45 121
      C47 133 49 142 50 146
      C51 142 53 133 55 121
      C58 104 60 85 61 67
      C56 71 44 71 39 67
      Z
    "
    fill={COLORS.tooth}
    stroke={COLORS.toothStroke}
    strokeWidth="1.6"
  />

  {lingual && (
    <>
      <path
        d="
          M40 30
          C44 25 56 25 60 30
          L58 52
          C55 57 45 57 42 52
          Z
        "
        fill="none"
        stroke="#64748B"
        strokeWidth="1"
      />

      <path
        d="M50 31 V56"
        stroke="#64748B"
        strokeWidth="1"
      />
    </>
  )}

  {status === "IMPLANTE" && (
    <g
      stroke="#64748B"
      strokeWidth="1.5"
    >
      <path d="M43 74 H57" />
      <path d="M44 80 H56" />
      <path d="M45 86 H55" />
      <path d="M46 92 H54" />
    </g>
  )}
</g>
```

);
}

/* ============================================================================
PRÉ-MOLAR
============================================================================ */

function PremolarSVG({
upper,
lingual,
status,
}: {
upper: boolean;
lingual: boolean;
status: ToothStatus;
}) {
return (
<g
transform={
upper
? "translate(0 0)"
: "translate(0 150) scale(1 -1)"
}
>
{/* COROA */} <path
     d="
       M30 25
       C35 17 42 14 50 18
       C58 14 65 17 70 25
       L68 58
       C60 65 40 65 32 58
       Z
     "
     fill={COLORS.tooth}
     stroke={COLORS.toothStroke}
     strokeWidth="1.6"
   />

```
  {/* DUAS CÚSPIDES */}
  <path
    d="M35 24 C40 19 45 19 50 25"
    fill="none"
    stroke={COLORS.toothStroke}
    strokeWidth="1"
  />

  <path
    d="M50 25 C55 19 60 19 65 24"
    fill="none"
    stroke={COLORS.toothStroke}
    strokeWidth="1"
  />

  {/* SULCO */}
  <path
    d="M50 24 C48 35 48 47 50 58"
    fill="none"
    stroke="#64748B"
    strokeWidth="1"
  />

  {/* CERVICAL */}
  <path
    d="M31 58 C40 64 60 64 69 58"
    fill="none"
    stroke={COLORS.toothStroke}
    strokeWidth="1.2"
  />

  {/* RAIZ */}
  <path
    d="
      M38 67
      C39 84 41 103 44 120
      C46 133 48 141 50 146
      C52 141 54 133 56 120
      C59 103 61 84 62 67
      C55 71 45 71 38 67
      Z
    "
    fill={COLORS.tooth}
    stroke={COLORS.toothStroke}
    strokeWidth="1.6"
  />

  {lingual && (
    <>
      <path
        d="
          M38 31
          C42 25 46 26 50 31
          C54 26 58 25 62 31
          L60 52
          C56 57 44 57 40 52
          Z
        "
        fill="none"
        stroke="#64748B"
        strokeWidth="1"
      />

      <path
        d="M50 31 V56"
        stroke="#64748B"
        strokeWidth="1"
      />
    </>
  )}

  {status === "IMPLANTE" && (
    <g
      stroke="#64748B"
      strokeWidth="1.5"
    >
      <path d="M43 74 H57" />
      <path d="M44 80 H56" />
      <path d="M45 86 H55" />
      <path d="M46 92 H54" />
    </g>
  )}
</g>
```

);
}

/* ============================================================================
MOLAR
============================================================================ */

function MolarSVG({
upper,
lingual,
status,
number,
}: {
upper: boolean;
lingual: boolean;
status: ToothStatus;
number: number;
}) {
const upperThreeRoots =
upper &&
[16, 17, 18, 26, 27, 28].includes(number);

return (
<g
transform={
upper
? "translate(0 0)"
: "translate(0 150) scale(1 -1)"
}
>
{/* COROA */} <path
     d="
       M23 27
       C29 18 38 17 44 22
       C48 25 52 25 56 22
       C62 17 71 18 77 27
       L74 58
       C65 65 35 65 26 58
       Z
     "
     fill={COLORS.tooth}
     stroke={COLORS.toothStroke}
     strokeWidth="1.7"
   />

```
  {/* CÚSPIDES */}
  <path
    d="M29 28 C34 22 39 23 44 28"
    fill="none"
    stroke={COLORS.toothStroke}
    strokeWidth="1"
  />

  <path
    d="M44 28 C47 32 50 32 53 28"
    fill="none"
    stroke={COLORS.toothStroke}
    strokeWidth="1"
  />

  <path
    d="M53 28 C58 23 63 22 71 28"
    fill="none"
    stroke={COLORS.toothStroke}
    strokeWidth="1"
  />

  {/* SULCO CENTRAL */}
  <path
    d="
      M50 25
      C48 34 48 47 50 59
    "
    fill="none"
    stroke="#64748B"
    strokeWidth="1.1"
  />

  <path
    d="
      M27 42
      C35 38 43 38 50 43
      C57 38 65 38 73 42
    "
    fill="none"
    stroke="#64748B"
    strokeWidth="1"
  />

  {/* CERVICAL */}
  <path
    d="M26 58 C36 65 64 65 74 58"
    fill="none"
    stroke={COLORS.toothStroke}
    strokeWidth="1.2"
  />

  {/* ================================================================
      RAÍZES
      ================================================================ */}

  {upperThreeRoots ? (
    <>
      {/* RAIZ MESIOVESTIBULAR */}
      <path
        d="
          M29 67
          C29 82 30 98 28 115
          C26 129 27 141 31 147
          C35 139 38 129 40 116
          L43 70
          C38 71 33 70 29 67
          Z
        "
        fill={COLORS.tooth}
        stroke={COLORS.toothStroke}
        strokeWidth="1.6"
      />

      {/* RAIZ PALATINA */}
      <path
        d="
          M45 69
          C45 87 46 107 47 123
          C47 135 49 143 50 148
          C51 143 53 135 53 123
          C54 107 55 87 55 69
          C52 71 48 71 45 69
          Z
        "
        fill={COLORS.tooth}
        stroke={COLORS.toothStroke}
        strokeWidth="1.6"
      />

      {/* RAIZ DISTOVESTIBULAR */}
      <path
        d="
          M57 70
          L60 116
          C62 129 65 139 69 147
          C73 141 74 129 72 115
          C70 98 71 82 71 67
          C67 70 62 71 57 70
          Z
        "
        fill={COLORS.tooth}
        stroke={COLORS.toothStroke}
        strokeWidth="1.6"
      />
    </>
  ) : (
    <>
      {/* RAIZ MESIAL */}
      <path
        d="
          M29 67
          C30 84 31 103 28 120
          C26 133 27 142 32 148
          C37 140 40 130 42 116
          L46 70
          C40 72 34 71 29 67
          Z
        "
        fill={COLORS.tooth}
        stroke={COLORS.toothStroke}
        strokeWidth="1.6"
      />

      {/* RAIZ DISTAL */}
      <path
        d="
          M54 70
          L58 116
          C60 130 63 140 68 148
          C73 142 74 133 72 120
          C69 103 70 84 71 67
          C66 71 60 72 54 70
          Z
        "
        fill={COLORS.tooth}
        stroke={COLORS.toothStroke}
        strokeWidth="1.6"
      />
    </>
  )}

  {lingual && (
    <>
      <path
        d="
          M28 32
          C34 25 43 26 50 33
          C57 26 66 25 72 32
          L69 52
          C63 59 37 59 31 52
          Z
        "
        fill="none"
        stroke="#64748B"
        strokeWidth="1"
      />

      <path
        d="M50 33 V57"
        stroke="#64748B"
        strokeWidth="1"
      />
    </>
  )}

  {status === "IMPLANTE" && (
    <g
      stroke="#64748B"
      strokeWidth="1.5"
    >
      <path d="M31 75 H43" />
      <path d="M30 81 H42" />
      <path d="M30 87 H41" />

      <path d="M57 75 H69" />
      <path d="M58 81 H70" />
      <path d="M59 87 H70" />
    </g>
  )}
</g>
```

);
}

/* ============================================================================
SVG PRINCIPAL
============================================================================ */

function ToothSVG({
type,
upper,
lingual,
status,
number,
}: ToothSVGProps) {
if (status === "AUSENTE") {
return ( <svg
     viewBox="0 0 100 150"
     width="100%"
     height="100%"
     preserveAspectRatio="xMidYMid meet"
   > <line
       x1="25"
       y1="75"
       x2="75"
       y2="75"
       stroke="#94A3B8"
       strokeWidth="2"
     />

```
    <line
      x1="35"
      y1="55"
      x2="65"
      y2="95"
      stroke="#CBD5E1"
      strokeWidth="1.5"
    />

    <line
      x1="65"
      y1="55"
      x2="35"
      y2="95"
      stroke="#CBD5E1"
      strokeWidth="1.5"
    />
  </svg>
);
```

}

return ( <svg
   viewBox="0 0 100 150"
   width="100%"
   height="100%"
   preserveAspectRatio="xMidYMid meet"
 >
{type === "incisor" && ( <IncisorSVG
       upper={upper}
       lingual={lingual}
       status={status}
     />
)}

```
  {type === "canine" && (
    <CanineSVG
      upper={upper}
      lingual={lingual}
      status={status}
    />
  )}

  {type === "premolar" && (
    <PremolarSVG
      upper={upper}
      lingual={lingual}
      status={status}
    />
  )}

  {type === "molar" && (
    <MolarSVG
      upper={upper}
      lingual={lingual}
      status={status}
      number={number}
    />
  )}
</svg>
```

);
}

/* ============================================================================
INPUT
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
onFocus={(event) =>
event.currentTarget.select()
}
onChange={(event) => {
const raw = event.target.value;

```
    if (raw === "") {
      onChange(null);
      return;
    }

    const valueNumber = Number(raw);

    if (Number.isNaN(valueNumber)) return;

    const minimum =
      allowNegative ? -9 : 0;

    const limited = Math.max(
      minimum,
      Math.min(12, valueNumber)
    );

    onChange(limited);
  }}
  className="
    box-border
    w-[30px]
    h-[22px]
    shrink-0
    rounded
    border
    bg-white
    text-center
    text-[9px]
    font-medium
    text-slate-800
    outline-none
    focus:ring-2
    focus:ring-blue-200
    [appearance:textfield]
    [&::-webkit-outer-spin-button]:appearance-none
    [&::-webkit-inner-spin-button]:appearance-none
  "
  style={{
    borderColor:
      colorHint ?? COLORS.border,
  }}
/>
```

);
}

/* ============================================================================
COLUNA DE SÍTIO
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
className={`         flex
        w-[32px]
        shrink-0
        flex-col
        items-center
        ${disabled ? "opacity-30 pointer-events-none" : ""}
      `}
>
{/* LABEL - ALTURA FIXA */} <div
     className="
       flex
       h-[16px]
       items-center
       justify-center
       text-[8px]
       font-bold
       text-slate-500
     "
   >
{label} </div>

```
  {/* MG - ALTURA FIXA */}
  <div
    className="
      flex
      h-[26px]
      items-center
      justify-center
    "
  >
    <MiniNumberInput
      ariaLabel={`Margem gengival ${label}`}
      value={site.mg}
      placeholder="MG"
      allowNegative
      onChange={(value) =>
        onChange({ mg: value })
      }
    />
  </div>

  {/* PS - ALTURA FIXA */}
  <div
    className="
      flex
      h-[26px]
      items-center
      justify-center
    "
  >
    <MiniNumberInput
      ariaLabel={`Profundidade ${label}`}
      value={site.ps}
      placeholder="PS"
      colorHint={psColor}
      onChange={(value) =>
        onChange({ ps: value })
      }
    />
  </div>

  {/* NI - ALTURA SEMPRE RESERVADA */}
  <div
    className="
      flex
      h-[16px]
      items-center
      justify-center
      overflow-hidden
    "
  >
    {ni !== null ? (
      <span
        className="
          whitespace-nowrap
          text-[7px]
          font-bold
        "
        style={{
          color: severityColor(site.ps),
        }}
      >
        NI {ni}
      </span>
    ) : (
      <span className="text-[7px] text-transparent">
        NI 0
      </span>
    )}
  </div>

  {/* INDICADORES */}
  <div
    className="
      flex
      h-[28px]
      items-center
      justify-center
      gap-[4px]
    "
  >
    {/* SANGRAMENTO */}
    <button
      type="button"
      title="Sangramento à sondagem"
      aria-label={`Sangramento ${label}`}
      aria-pressed={site.bop}
      onClick={() =>
        onChange({
          bop: !site.bop,
        })
      }
      className="
        h-[9px]
        w-[9px]
        shrink-0
        rounded-full
        border
      "
      style={{
        backgroundColor: site.bop
          ? COLORS.bop
          : "white",
        borderColor: site.bop
          ? COLORS.bop
          : "#94A3B8",
      }}
    />

    {/* PLACA */}
    <button
      type="button"
      title="Placa"
      aria-label={`Placa ${label}`}
      aria-pressed={site.plaque}
      onClick={() =>
        onChange({
          plaque: !site.plaque,
        })
      }
      className="
        h-[9px]
        w-[9px]
        shrink-0
        rounded-sm
        border
      "
      style={{
        backgroundColor: site.plaque
          ? COLORS.plaque
          : "white",
        borderColor: site.plaque
          ? COLORS.plaque
          : "#94A3B8",
      }}
    />

    {/* SUPURAÇÃO */}
    <button
      type="button"
      title="Supuração"
      aria-label={`Supuração ${label}`}
      aria-pressed={site.suppuration}
      onClick={() =>
        onChange({
          suppuration:
            !site.suppuration,
        })
      }
      className="
        h-[9px]
        w-[9px]
        shrink-0
        rotate-45
        rounded-[1px]
        border
      "
      style={{
        backgroundColor:
          site.suppuration
            ? COLORS.suppuration
            : "white",
        borderColor:
          site.suppuration
            ? COLORS.suppuration
            : "#94A3B8",
      }}
    />
  </div>
</div>
```

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

return ( <div
   className="
     flex
     h-[52px]
     w-full
     shrink-0
     flex-col
     items-center
     justify-center
     gap-[4px]
   "
 >
{/* STATUS */}
<select
aria-label={`Status do dente ${tooth.number}`}
value={tooth.status}
onChange={(event) =>
onUpdate({
status:
event.target.value as ToothStatus,
})
}
className="
h-[21px]
w-[48px]
rounded
border
border-slate-300
bg-white
px-0
text-center
text-[7px]
text-slate-700
outline-none
"
> <option value="PRESENTE">
Pres. </option>

```
    <option value="AUSENTE">
      Aus.
    </option>

    <option value="IMPLANTE">
      Impl.
    </option>
  </select>

  {/* MOBILIDADE */}
  {tooth.status !== "AUSENTE" ? (
    <div
      className="
        flex
        h-[16px]
        items-center
        justify-center
        gap-[2px]
      "
    >
      {[0, 1, 2, 3].map(
        (grade) => (
          <button
            key={grade}
            type="button"
            aria-label={`Mobilidade grau ${grade}`}
            aria-pressed={
              tooth.mobility === grade
            }
            onClick={() =>
              onUpdate({
                mobility: grade,
              })
            }
            className={`
              flex
              h-[14px]
              w-[14px]
              items-center
              justify-center
              rounded-full
              border
              text-[7px]
              ${
                tooth.mobility === grade
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 bg-white text-slate-500"
              }
            `}
          >
            {grade}
          </button>
        )
      )}
    </div>
  ) : (
    <div className="h-[16px]" />
  )}

  {/* FURCA */}
  {tooth.status === "PRESENTE" &&
  hasFurca(group) ? (
    <div
      className="
        flex
        h-[16px]
        items-center
        justify-center
        gap-1
      "
    >
      <select
        aria-label={`Furca vestibular ${tooth.number}`}
        value={tooth.buccalFurcation}
        onChange={(event) =>
          onUpdate({
            buccalFurcation:
              Number(
                event.target.value
              ),
          })
        }
        className="
          h-[16px]
          w-[20px]
          rounded
          border
          border-slate-300
          bg-white
          text-center
          text-[7px]
          text-slate-700
        "
      >
        {[0, 1, 2, 3].map(
          (grade) => (
            <option
              key={grade}
              value={grade}
            >
              {grade}
            </option>
          )
        )}
      </select>

      <span className="text-[7px] text-slate-400">
        /
      </span>

      <select
        aria-label={`Furca lingual ${tooth.number}`}
        value={tooth.lingualFurcation}
        onChange={(event) =>
          onUpdate({
            lingualFurcation:
              Number(
                event.target.value
              ),
          })
        }
        className="
          h-[16px]
          w-[20px]
          rounded
          border
          border-slate-300
          bg-white
          text-center
          text-[7px]
          text-slate-700
        "
      >
        {[0, 1, 2, 3].map(
          (grade) => (
            <option
              key={grade}
              value={grade}
            >
              {grade}
            </option>
          )
        )}
      </select>
    </div>
  ) : (
    <div className="h-[16px]" />
  )}
</div>
```

);
}

/* ============================================================================
COLUNA DO DENTE

ALTURA TOTAL FIXA.

Isso impede MG/PS/NI de empurrar o dente.
============================================================================ */

function ToothColumn({
tooth,
arch,
onUpdateTooth,
onUpdateSite,
}: {
tooth: ToothData;
arch: "upper" | "lower";
onUpdateTooth: (
patch: Partial<ToothData>
) => void;
onUpdateSite: (
key: SiteKey,
patch: Partial<SiteData>
) => void;
}) {
const group = getToothGroup(tooth.number);
const upper = arch === "upper";

return ( <div
   className="
     flex
     min-w-0
     w-full
     flex-col
     items-center
     overflow-visible
   "
 >
{/* SÍTIOS VESTIBULARES */}

```
  <div
    className="
      flex
      h-[112px]
      w-full
      items-start
      justify-center
      gap-[1px]
    "
  >
    {VESTIBULAR_SITES.map(
      (key) => (
        <SiteColumn
          key={key}
          site={tooth.sites[key]}
          label={SITE_LABEL[key]}
          disabled={
            tooth.status === "AUSENTE"
          }
          onChange={(patch) =>
            onUpdateSite(
              key,
              patch
            )
          }
        />
      )
    )}
  </div>

  {/* NÚMERO */}

  <div
    className="
      flex
      h-[18px]
      w-full
      items-center
      justify-center
    "
  >
    <span
      className="
        text-[10px]
        font-bold
        tracking-tight
        text-blue-700
      "
    >
      {tooth.number}
    </span>
  </div>

  {/* DENTE - ÁREA FIXA */}

  <div
    className="
      relative
      flex
      h-[104px]
      w-full
      items-center
      justify-center
      overflow-visible
    "
  >
    <div
      className="
        h-[104px]
        w-[68px]
        max-w-full
      "
    >
      <ToothSVG
        type={group}
        upper={upper}
        lingual={false}
        status={tooth.status}
        number={tooth.number}
      />
    </div>
  </div>

  {/* CONTROLES */}

  <ToothControls
    tooth={tooth}
    onUpdate={onUpdateTooth}
  />

  {/* SÍTIOS LINGUAIS */}

  <div
    className="
      flex
      h-[112px]
      w-full
      items-start
      justify-center
      gap-[1px]
    "
  >
    {LINGUAL_SITES.map(
      (key) => (
        <SiteColumn
          key={key}
          site={tooth.sites[key]}
          label={SITE_LABEL[key]}
          disabled={
            tooth.status === "AUSENTE"
          }
          onChange={(patch) =>
            onUpdateSite(
              key,
              patch
            )
          }
        />
      )
    )}
  </div>
</div>
```

);
}

/* ============================================================================
ARCADA

GRID FIXO DE 16 COLUNAS.
============================================================================ */

function ArchBlock({
archNumbers,
arch,
teethByNumber,
onUpdateTooth,
onUpdateSite,
}: {
archNumbers: number[];
arch: "upper" | "lower";
teethByNumber: Map<number, ToothData>;
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
return ( <div
   className="
     w-full
     overflow-visible
   "
 > <div
     className="
       grid
       w-full
       grid-cols-[repeat(16,minmax(0,1fr))]
       gap-[1px]
       items-start
     "
   >
{archNumbers.map(
(number) => {
const tooth =
teethByNumber.get(
number
);

```
        if (!tooth) return null;

        return (
          <ToothColumn
            key={number}
            tooth={tooth}
            arch={arch}
            onUpdateTooth={(
              patch
            ) =>
              onUpdateTooth(
                number,
                patch
              )
            }
            onUpdateSite={(
              key,
              patch
            ) =>
              onUpdateSite(
                number,
                key,
                patch
              )
            }
          />
        );
      }
    )}
  </div>
</div>
```

);
}

/* ============================================================================
LEGENDA DAS LINHAS PERIODONTAIS
============================================================================ */

function PeriodontalLinesLegend() {
return ( <div
   className="
     mt-5
     rounded-xl
     border
     border-slate-200
     bg-slate-50
     p-4
   "
 > <div
     className="
       mb-3
       text-[11px]
       font-bold
       uppercase
       tracking-wider
       text-slate-700
     "
   >
Linhas do periodontograma </div>

```
  <div
    className="
      flex
      flex-wrap
      items-center
      gap-x-6
      gap-y-3
    "
  >
    {/* PRETA */}
    <div className="flex items-center gap-2">
      <span
        className="
          block
          h-[3px]
          w-[34px]
          rounded-full
          bg-gray-900
        "
      />

      <span className="text-[10px] text-slate-600">
        Linha preta — margem gengival
      </span>
    </div>

    {/* AZUL */}
    <div className="flex items-center gap-2">
      <span
        className="
          block
          h-[3px]
          w-[34px]
          rounded-full
          bg-blue-600
        "
      />

      <span className="text-[10px] text-slate-600">
        Linha azul — profundidade de sondagem
      </span>
    </div>

    {/* VERMELHA */}
    <div className="flex items-center gap-2">
      <span
        className="
          block
          h-[3px]
          w-[34px]
          rounded-full
          bg-red-600
        "
      />

      <span className="text-[10px] text-slate-600">
        Linha vermelha — sangramento à sondagem
      </span>
    </div>
  </div>
</div>
```

);
}

/* ============================================================================
LEGENDA DOS INDICADORES
============================================================================ */

function IndicatorsLegend() {
return ( <div
   className="
     mt-3
     flex
     flex-wrap
     items-center
     justify-center
     gap-x-6
     gap-y-3
     rounded-xl
     border
     border-slate-200
     bg-white
     px-4
     py-3
   "
 > <div className="flex items-center gap-2"> <span
       className="
         h-3
         w-3
         rounded-full
         bg-red-600
       "
     />

```
    <span className="text-[10px] text-slate-600">
      SS — Sangramento
    </span>
  </div>

  <div className="flex items-center gap-2">
    <span
      className="
        h-3
        w-3
        rounded-sm
        bg-amber-600
      "
    />

    <span className="text-[10px] text-slate-600">
      IP — Placa
    </span>
  </div>

  <div className="flex items-center gap-2">
    <span
      className="
        h-3
        w-3
        rotate-45
        rounded-sm
        bg-purple-600
      "
    />

    <span className="text-[10px] text-slate-600">
      Supuração
    </span>
  </div>

  <div className="flex items-center gap-2">
    <span className="text-[10px] font-bold text-blue-700">
      NI
    </span>

    <span className="text-[10px] text-slate-600">
      Nível de inserção
    </span>
  </div>

  <div className="flex items-center gap-2">
    <span className="text-[10px] font-bold text-slate-700">
      M
    </span>

    <span className="text-[10px] text-slate-600">
      Mobilidade
    </span>
  </div>

  <div className="flex items-center gap-2">
    <span className="text-[10px] font-bold text-slate-700">
      F
    </span>

    <span className="text-[10px] text-slate-600">
      Furca
    </span>
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
return ( <div
   className="
     min-w-[150px]
     flex-1
     rounded-xl
     border
     border-slate-200
     bg-white
     px-4
     py-3
     text-center
   "
 > <div
     className="
       text-[10px]
       font-medium
       text-slate-500
     "
   >
{label} </div>

```
  <div
    className="
      mt-1
      text-lg
      font-bold
    "
    style={{
      color:
        accent ?? COLORS.text,
    }}
  >
    {value}
  </div>
</div>
```

);
}

/* ============================================================================
RESUMO
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
     mt-4
     grid
     grid-cols-1
     gap-3
     sm:grid-cols-2
     lg:grid-cols-4
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
    accent={COLORS.bop}
  />

  <Metric
    label="Índice de placa (IP)"
    value={`${summary.plaquePercent.toFixed(0)}%`}
    accent={COLORS.plaque}
  />
</div>
```

);
}

/* ============================================================================
COMPONENTE PRINCIPAL
============================================================================ */

export function Odontogram({
initialTeeth,
onChange,
className,
examId,
patientId,
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
data-exam-id={examId}
data-patient-id={patientId}
className={[
"w-full",
"overflow-visible",
"rounded-2xl",
"border",
"border-slate-200",
"bg-white",
"p-3",
"sm:p-5",
className ?? "",
].join(" ")}
>
{/* ================================================================
CABEÇALHO
================================================================ */}

```
  <div className="mb-5">
    <h2
      className="
        text-lg
        font-bold
        text-slate-900
      "
    >
      Periodontograma
    </h2>

    <p
      className="
        mt-1
        text-xs
        text-slate-500
      "
    >
      Registro periodontal clínico por dente e por sítio.
    </p>
  </div>

  {/* ================================================================
      ARCADA SUPERIOR
      ================================================================ */}

  <div
    className="
      mb-2
      flex
      items-center
      gap-3
    "
  >
    <div className="h-px flex-1 bg-slate-200" />

    <span
      className="
        whitespace-nowrap
        text-[10px]
        font-bold
        uppercase
        tracking-[0.18em]
        text-slate-500
      "
    >
      Arcada superior
    </span>

    <div className="h-px flex-1 bg-slate-200" />
  </div>

  <ArchBlock
    archNumbers={UPPER_ARCH}
    arch="upper"
    teethByNumber={teethByNumber}
    onUpdateTooth={updateTooth}
    onUpdateSite={updateSite}
  />

  {/* ================================================================
      PLANO OCLUSAL
      ================================================================ */}

  <div
    className="
      my-4
      flex
      items-center
      gap-3
    "
  >
    <div className="h-[2px] flex-1 bg-slate-300" />

    <span
      className="
        whitespace-nowrap
        rounded-full
        border
        border-slate-200
        bg-slate-50
        px-3
        py-1
        text-[9px]
        font-bold
        uppercase
        tracking-[0.2em]
        text-slate-500
      "
    >
      Plano oclusal
    </span>

    <div className="h-[2px] flex-1 bg-slate-300" />
  </div>

  {/* ================================================================
      ARCADA INFERIOR
      ================================================================ */}

  <div
    className="
      mb-2
      flex
      items-center
      gap-3
    "
  >
    <div className="h-px flex-1 bg-slate-200" />

    <span
      className="
        whitespace-nowrap
        text-[10px]
        font-bold
        uppercase
        tracking-[0.18em]
        text-slate-500
      "
    >
      Arcada inferior
    </span>

    <div className="h-px flex-1 bg-slate-200" />
  </div>

  <ArchBlock
    archNumbers={LOWER_ARCH}
    arch="lower"
    teethByNumber={teethByNumber}
    onUpdateTooth={updateTooth}
    onUpdateSite={updateSite}
  />

  {/* ================================================================
      LEGENDA DAS LINHAS
      ================================================================ */}

  <PeriodontalLinesLegend />

  {/* ================================================================
      LEGENDA DOS INDICADORES
      ================================================================ */}

  <IndicatorsLegend />

  {/* ================================================================
      RESUMO
      ================================================================ */}

  <SummaryBar teeth={teeth} />
</div>
```

);
}

export default Odontogram;
