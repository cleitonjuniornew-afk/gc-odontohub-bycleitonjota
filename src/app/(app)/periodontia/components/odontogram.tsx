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
  tooth: "#FFFDF7",
  toothShadow: "#F7F3E8",
  black: "#111827",
  blue: "#2563EB",
  red: "#DC2626",
  green: "#16A34A",
  yellow: "#EAB308",
  purple: "#9333EA",
  border: "#D1D5DB",
  text: "#374151",
  muted: "#6B7280",
  light: "#F8FAFC",
};

const SEVERITY = {
  healthy: "#16A34A",
  mild: "#EAB308",
  moderate: "#F97316",
  severe: "#DC2626",
};

function severityColor(ps: number | null) {
  const value = ps ?? 0;

  if (value <= 3) return SEVERITY.healthy;
  if (value <= 5) return SEVERITY.mild;
  if (value <= 7) return SEVERITY.moderate;

  return SEVERITY.severe;
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

/*
Molares superiores:
16, 17, 18, 26, 27, 28 = 3 raízes.

Molares inferiores:
36, 37, 38, 46, 47, 48 = 2 raízes.
*/

function hasThreeRoots(fdi: number) {
  return [16, 17, 18, 26, 27, 28].includes(fdi);
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
NÍVEL DE INSERÇÃO
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
  }

  return {
    avgPS: psCount > 0 ? psSum / psCount : 0,
    avgNI: niCount > 0 ? niSum / niCount : 0,
    bopPercent:
      siteCount > 0
        ? (bopCount / siteCount) * 100
        : 0,
    plaquePercent:
      siteCount > 0
        ? (plaqueCount / siteCount) * 100
        : 0,
  };
}

/* ============================================================================
SVG — INCISIVO
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
  const transform = upper
    ? "translate(0 0)"
    : "translate(0 150) scale(1 -1)";

  return (
    <g transform={transform}>
      {/* COROA */}
      <path
        d="
          M36 16
          C40 11 60 11 64 16
          C67 24 67 43 64 58
          C60 64 40 64 36 58
          C33 43 33 24 36 16
          Z
        "
        fill={COLORS.tooth}
        stroke={COLORS.black}
        strokeWidth="1.7"
      />

      {/* CONTORNO CERVICAL */}
      <path
        d="M36 58 C43 63 57 63 64 58"
        fill="none"
        stroke={COLORS.black}
        strokeWidth="1.2"
      />

      {/* RAIZ */}
      <path
        d="
          M39 64
          C40 82 42 101 45 119
          C47 132 48 141 50 146
          C52 141 53 132 55 119
          C58 101 60 82 61 64
          C55 68 45 68 39 64
          Z
        "
        fill={COLORS.toothShadow}
        stroke={COLORS.black}
        strokeWidth="1.7"
      />

      {/* LINHA AZUL — MARGEM GENGIVAL */}
      <path
        d="M36 54 C43 59 57 59 64 54"
        fill="none"
        stroke={COLORS.blue}
        strokeWidth="1.8"
      />

      {/* LINHA VERMELHA — PROFUNDIDADE / SONDAGEM */}
      <path
        d="M38 60 C44 65 56 65 62 60"
        fill="none"
        stroke={COLORS.red}
        strokeWidth="1.5"
      />

      {/* DETALHES LINGUAIS */}
      {lingual && (
        <>
          <path
            d="
              M40 27
              C43 22 57 22 60 27
              L58 49
              C56 54 44 54 42 49
              Z
            "
            fill="none"
            stroke="#64748B"
            strokeWidth="1"
          />

          <path
            d="M43 52 C47 56 53 56 57 52"
            fill="none"
            stroke="#64748B"
            strokeWidth="1"
          />
        </>
      )}

      {status === "IMPLANTE" && (
        <>
          <path
            d="M43 72 L57 72"
            stroke="#64748B"
            strokeWidth="1.4"
          />
          <path
            d="M44 78 L56 78"
            stroke="#64748B"
            strokeWidth="1.4"
          />
          <path
            d="M45 84 L55 84"
            stroke="#64748B"
            strokeWidth="1.4"
          />
        </>
      )}
    </g>
  );
}

/* ============================================================================
SVG — CANINO
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
  const transform = upper
    ? "translate(0 0)"
    : "translate(0 150) scale(1 -1)";

  return (
    <g transform={transform}>
      {/* COROA DO CANINO
          ÁPICE MAIS BAIXO E NATURAL,
          SEM PONTA EXAGERADA */}
      <path
        d="
          M36 18
          C39 12 45 10 50 13
          C55 10 61 12 64 18
          C66 28 65 45 62 58
          C59 64 41 64 38 58
          C35 45 34 28 36 18
          Z
        "
        fill={COLORS.tooth}
        stroke={COLORS.black}
        strokeWidth="1.7"
      />

      {/* VÉRTICE CANINO */}
      <path
        d="M44 14 L50 9 L56 14"
        fill="none"
        stroke={COLORS.black}
        strokeWidth="1.3"
      />

      {/* CERVICAL */}
      <path
        d="M38 58 C44 63 56 63 62 58"
        fill="none"
        stroke={COLORS.black}
        strokeWidth="1.2"
      />

      {/* RAIZ */}
      <path
        d="
          M39 64
          C40 84 42 105 45 124
          C47 137 49 143 50 147
          C51 143 53 137 55 124
          C58 105 60 84 61 64
          C55 68 45 68 39 64
          Z
        "
        fill={COLORS.toothShadow}
        stroke={COLORS.black}
        strokeWidth="1.7"
      />

      {/* LINHA AZUL */}
      <path
        d="M38 54 C44 59 56 59 62 54"
        fill="none"
        stroke={COLORS.blue}
        strokeWidth="1.8"
      />

      {/* LINHA VERMELHA */}
      <path
        d="M39 60 C45 65 55 65 61 60"
        fill="none"
        stroke={COLORS.red}
        strokeWidth="1.5"
      />

      {/* ANATOMIA LINGUAL */}
      {lingual && (
        <>
          <path
            d="
              M40 29
              C43 24 47 23 50 27
              C53 23 57 24 60 29
              L58 51
              C55 56 45 56 42 51
              Z
            "
            fill="none"
            stroke="#64748B"
            strokeWidth="1"
          />

          <path
            d="M50 27 L50 55"
            stroke="#64748B"
            strokeWidth="1"
          />
        </>
      )}

      {status === "IMPLANTE" && (
        <>
          <path
            d="M43 72 L57 72"
            stroke="#64748B"
            strokeWidth="1.4"
          />
          <path
            d="M44 78 L56 78"
            stroke="#64748B"
            strokeWidth="1.4"
          />
          <path
            d="M45 84 L55 84"
            stroke="#64748B"
            strokeWidth="1.4"
          />
        </>
      )}
    </g>
  );
}

/* ============================================================================
SVG — PRÉ-MOLAR
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
  const transform = upper
    ? "translate(0 0)"
    : "translate(0 150) scale(1 -1)";

  return (
    <g transform={transform}>
      {/* COROA */}
      <path
        d="
          M29 22
          C35 15 43 14 50 18
          C57 14 65 15 71 22
          C73 31 72 47 69 58
          C63 64 37 64 31 58
          C28 47 27 31 29 22
          Z
        "
        fill={COLORS.tooth}
        stroke={COLORS.black}
        strokeWidth="1.7"
      />

      {/* CÚSPIDES */}
      <path
        d="M31 23 C37 18 43 18 50 24"
        fill="none"
        stroke={COLORS.black}
        strokeWidth="1.2"
      />

      <path
        d="M50 24 C57 18 63 18 69 23"
        fill="none"
        stroke={COLORS.black}
        strokeWidth="1.2"
      />

      {/* SULCO CENTRAL */}
      <path
        d="M50 23 C48 32 48 45 50 58"
        fill="none"
        stroke={COLORS.black}
        strokeWidth="1.1"
      />

      {/* CERVICAL */}
      <path
        d="M31 58 C40 63 60 63 69 58"
        fill="none"
        stroke={COLORS.black}
        strokeWidth="1.2"
      />

      {/* RAIZ */}
      <path
        d="
          M38 64
          C39 84 41 104 44 121
          C46 134 48 142 50 146
          C52 142 54 134 56 121
          C59 104 61 84 62 64
          C55 68 45 68 38 64
          Z
        "
        fill={COLORS.toothShadow}
        stroke={COLORS.black}
        strokeWidth="1.7"
      />

      {/* LINHA AZUL */}
      <path
        d="M31 54 C40 59 60 59 69 54"
        fill="none"
        stroke={COLORS.blue}
        strokeWidth="1.8"
      />

      {/* LINHA VERMELHA */}
      <path
        d="M33 60 C42 65 58 65 67 60"
        fill="none"
        stroke={COLORS.red}
        strokeWidth="1.5"
      />

      {lingual && (
        <>
          <path
            d="
              M38 29
              C42 24 46 25 50 29
              C54 25 58 24 62 29
              L60 51
              C56 56 44 56 40 51
              Z
            "
            fill="none"
            stroke="#64748B"
            strokeWidth="1"
          />

          <path
            d="M50 29 L50 55"
            stroke="#64748B"
            strokeWidth="1"
          />
        </>
      )}

      {status === "IMPLANTE" && (
        <>
          <path
            d="M43 72 L57 72"
            stroke="#64748B"
            strokeWidth="1.4"
          />
          <path
            d="M44 78 L56 78"
            stroke="#64748B"
            strokeWidth="1.4"
          />
          <path
            d="M45 84 L55 84"
            stroke="#64748B"
            strokeWidth="1.4"
          />
        </>
      )}
    </g>
  );
}

/* ============================================================================
SVG — MOLAR
============================================================================ */

function MolarSVG({
  upper,
  lingual,
  status,
  threeRoots,
}: {
  upper: boolean;
  lingual: boolean;
  status: ToothStatus;
  threeRoots: boolean;
}) {
  const transform = upper
    ? "translate(0 0)"
    : "translate(0 150) scale(1 -1)";

  return (
    <g transform={transform}>
      {/* COROA */}
      <path
        d="
          M23 24
          C27 17 35 14 42 18
          C46 20 48 20 50 17
          C52 20 54 20 58 18
          C65 14 73 17 77 24
          C79 35 78 49 74 58
          C67 65 33 65 26 58
          C22 49 21 35 23 24
          Z
        "
        fill={COLORS.tooth}
        stroke={COLORS.black}
        strokeWidth="1.7"
      />

      {/* CÚSPIDES / SULCOS */}
      <path
        d="
          M25 25
          C31 20 37 21 43 27
          C46 30 48 29 50 25
          C52 29 54 30 57 27
          C63 21 69 20 75 25
        "
        fill="none"
        stroke={COLORS.black}
        strokeWidth="1.2"
      />

      <path
        d="
          M50 25
          C48 32 48 41 50 58
        "
        fill="none"
        stroke={COLORS.black}
        strokeWidth="1.1"
      />

      <path
        d="
          M25 42
          C33 38 42 39 50 45
          C58 39 67 38 75 42
        "
        fill="none"
        stroke={COLORS.black}
        strokeWidth="1"
      />

      {/* CERVICAL */}
      <path
        d="M26 58 C36 64 64 64 74 58"
        fill="none"
        stroke={COLORS.black}
        strokeWidth="1.2"
      />

      {threeRoots ? (
        <>
          {/* RAIZ MESIO-VESTIBULAR */}
          <path
            d="
              M28 65
              C29 82 30 99 27 116
              C25 129 27 141 31 148
              C35 141 38 132 39 119
              L43 67
              C37 68 32 67 28 65
              Z
            "
            fill={COLORS.toothShadow}
            stroke={COLORS.black}
            strokeWidth="1.7"
          />

          {/* RAIZ MESIO-LINGUAL / PALATINA */}
          <path
            d="
              M44 67
              C44 84 45 101 46 117
              C47 131 48 141 50 148
              C52 141 53 131 54 117
              C55 101 56 84 56 67
              C52 68 48 68 44 67
              Z
            "
            fill={COLORS.toothShadow}
            stroke={COLORS.black}
            strokeWidth="1.7"
          />

          {/* RAIZ DISTAL */}
          <path
            d="
              M57 67
              L61 119
              C62 132 65 141 69 148
              C73 141 75 129 73 116
              C70 99 71 82 72 65
              C67 67 62 68 57 67
              Z
            "
            fill={COLORS.toothShadow}
            stroke={COLORS.black}
            strokeWidth="1.7"
          />
        </>
      ) : (
        <>
          {/* RAIZ MESIAL */}
          <path
            d="
              M29 65
              C30 83 31 101 28 118
              C26 131 27 141 32 148
              C37 140 40 130 42 116
              L46 67
              C40 68 34 67 29 65
              Z
            "
            fill={COLORS.toothShadow}
            stroke={COLORS.black}
            strokeWidth="1.7"
          />

          {/* RAIZ DISTAL */}
          <path
            d="
              M54 67
              L58 116
              C60 130 63 140 68 148
              C73 141 74 131 72 118
              C69 101 70 83 71 65
              C66 67 60 68 54 67
              Z
            "
            fill={COLORS.toothShadow}
            stroke={COLORS.black}
            strokeWidth="1.7"
          />
        </>
      )}

      {/* LINHA AZUL — MARGEM GENGIVAL */}
      <path
        d="M26 54 C36 60 64 60 74 54"
        fill="none"
        stroke={COLORS.blue}
        strokeWidth="1.8"
      />

      {/* LINHA VERMELHA — PROFUNDIDADE */}
      <path
        d="M28 60 C37 65 63 65 72 60"
        fill="none"
        stroke={COLORS.red}
        strokeWidth="1.5"
      />

      {lingual && (
        <>
          <path
            d="
              M28 30
              C34 23 43 24 50 31
              C57 24 66 23 72 30
              L69 52
              C63 58 37 58 31 52
              Z
            "
            fill="none"
            stroke="#64748B"
            strokeWidth="1"
          />

          <path
            d="M50 31 L50 57"
            stroke="#64748B"
            strokeWidth="1"
          />
        </>
      )}

      {status === "IMPLANTE" && (
        <>
          <path
            d="M31 73 L41 73"
            stroke="#64748B"
            strokeWidth="1.4"
          />
          <path
            d="M30 79 L40 79"
            stroke="#64748B"
            strokeWidth="1.4"
          />
          <path
            d="M30 85 L39 85"
            stroke="#64748B"
            strokeWidth="1.4"
          />

          <path
            d="M59 73 L69 73"
            stroke="#64748B"
            strokeWidth="1.4"
          />
          <path
            d="M60 79 L70 79"
            stroke="#64748B"
            strokeWidth="1.4"
          />
          <path
            d="M61 85 L70 85"
            stroke="#64748B"
            strokeWidth="1.4"
          />
        </>
      )}
    </g>
  );
}

/* ============================================================================
SVG PRINCIPAL
============================================================================ */

interface ToothSVGProps {
  type: ToothGroup;
  upper: boolean;
  lingual: boolean;
  status: ToothStatus;
  number: number;
}

function ToothSVG({
  type,
  upper,
  lingual,
  status,
  number,
}: ToothSVGProps) {
  if (status === "AUSENTE") {
    return (
      <svg
        viewBox="0 0 100 150"
        width="52"
        height="78"
        className="block"
      >
        <line
          x1="20"
          y1="75"
          x2="80"
          y2="75"
          stroke="#111827"
          strokeWidth="2"
        />

        <line
          x1="25"
          y1="65"
          x2="75"
          y2="85"
          stroke="#DC2626"
          strokeWidth="2"
        />

        <text
          x="50"
          y="105"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill="#2563EB"
        >
          {number}
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 150"
      width="52"
      height="78"
      className="block"
      aria-label={`Dente ${number}`}
    >
      {type === "incisor" && (
        <IncisorSVG
          upper={upper}
          lingual={lingual}
          status={status}
        />
      )}

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
          threeRoots={hasThreeRoots(number)}
        />
      )}
    </svg>
  );
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
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => {
        const raw = event.target.value;

        if (raw === "") {
          onChange(null);
          return;
        }

        const number = Number(raw);

        if (Number.isNaN(number)) return;

        const minimum = allowNegative ? -9 : 0;
        const maximum = 12;

        const limited = Math.max(
          minimum,
          Math.min(maximum, number)
        );

        onChange(limited);
      }}
      className="
        w-7
        h-5
        text-[9px]
        text-center
        rounded
        bg-white
        border
        text-gray-800
        focus:outline-none
        focus:ring-1
        focus:ring-blue-400
        [appearance:textfield]
        [&::-webkit-outer-spin-button]:appearance-none
        [&::-webkit-inner-spin-button]:appearance-none
      "
      style={{
        borderColor:
          colorHint ?? "#CBD5E1",
        color:
          colorHint ?? "#374151",
      }}
    />
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
        "gap-[2px]",
        disabled
          ? "opacity-30 pointer-events-none"
          : "",
      ].join(" ")}
    >
      <span className="text-[8px] font-semibold text-gray-500">
        {label}
      </span>

      <MiniNumberInput
        ariaLabel={`Margem gengival ${label}`}
        value={site.mg}
        placeholder="MG"
        allowNegative
        onChange={(value) =>
          onChange({ mg: value })
        }
      />

      <MiniNumberInput
        ariaLabel={`Profundidade de sondagem ${label}`}
        value={site.ps}
        placeholder="PS"
        colorHint={psColor}
        onChange={(value) =>
          onChange({ ps: value })
        }
      />

      {ni !== null && (
        <span
          className="text-[7px] font-bold"
          style={{
            color: severityColor(site.ps),
          }}
        >
          NI {ni}
        </span>
      )}

      {/* SS */}
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
        className={[
          "w-2.5",
          "h-2.5",
          "rounded-full",
          "border",
          site.bop
            ? "bg-red-600 border-red-600"
            : "bg-white border-gray-400",
        ].join(" ")}
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
        className={[
          "w-2.5",
          "h-2.5",
          "rounded-sm",
          "border",
          site.plaque
            ? "bg-yellow-500 border-yellow-500"
            : "bg-white border-gray-400",
        ].join(" ")}
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
        className={[
          "w-2.5",
          "h-2.5",
          "rotate-45",
          "border",
          site.suppuration
            ? "bg-purple-600 border-purple-600"
            : "bg-white border-gray-400",
        ].join(" ")}
      />
    </div>
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
  onUpdate: (
    patch: Partial<ToothData>
  ) => void;
}) {
  const group = getToothGroup(tooth.number);

  return (
    <div className="flex flex-col items-center gap-1">
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
          text-[7px]
          bg-white
          border
          border-gray-300
          rounded
          text-gray-700
          px-1
          py-[2px]
          w-[54px]
          h-5
        "
      >
        <option value="PRESENTE">
          Pres.
        </option>

        <option value="AUSENTE">
          Aus.
        </option>

        <option value="IMPLANTE">
          Impl.
        </option>
      </select>

      {tooth.status !== "AUSENTE" && (
        <div
          className="flex items-center gap-[2px]"
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
              onClick={() =>
                onUpdate({
                  mobility: grade,
                })
              }
              className={[
                "w-3.5",
                "h-3.5",
                "rounded-full",
                "text-[6px]",
                "flex",
                "items-center",
                "justify-center",
                "border",
                tooth.mobility === grade
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-300 text-gray-500 bg-white",
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
            className="flex items-center gap-1"
            title="Furca vestibular / lingual"
          >
            <select
              aria-label={`Furca vestibular — dente ${tooth.number}`}
              value={tooth.buccalFurcation}
              onChange={(event) =>
                onUpdate({
                  buccalFurcation:
                    Number(event.target.value),
                })
              }
              className="
                text-[6px]
                bg-white
                border border-gray-300
                rounded
                text-gray-600
                w-6
                h-4
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

            <span className="text-[6px] text-gray-400">
              /
            </span>

            <select
              aria-label={`Furca lingual — dente ${tooth.number}`}
              value={tooth.lingualFurcation}
              onChange={(event) =>
                onUpdate({
                  lingualFurcation:
                    Number(event.target.value),
                })
              }
              className="
                text-[6px]
                bg-white
                border border-gray-300
                rounded
                text-gray-600
                w-6
                h-4
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
        )}
    </div>
  );
}

/* ============================================================================
COLUNA COMPLETA DO DENTE
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

  const disabledSites =
    tooth.status === "AUSENTE";

  const upper = arch === "upper";

  return (
    <div
      className="
        flex
        flex-col
        items-center
        w-[58px]
        shrink-0
      "
    >
      {/* SÍTIOS VESTIBULARES */}

      <div className="flex items-start justify-center gap-[1px]">
        {VESTIBULAR_SITES.map(
          (key) => (
            <SiteColumn
              key={key}
              site={tooth.sites[key]}
              label={SITE_LABEL[key]}
              disabled={
                disabledSites
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

      {/* DENTE */}

      <div
        className="
          relative
          flex
          items-center
          justify-center
          w-[56px]
          h-[84px]
          my-1
        "
      >
        <ToothSVG
          type={group}
          upper={upper}
          lingual={false}
          status={tooth.status}
          number={tooth.number}
        />

        <span
          className="
            absolute
            -bottom-1
            text-[9px]
            font-bold
            text-blue-600
          "
        >
          {tooth.number}
        </span>
      </div>

      {/* CONTROLES */}

      <ToothControls
        tooth={tooth}
        onUpdate={onUpdateTooth}
      />

      {/* SÍTIOS LINGUAIS */}

      <div className="flex items-start justify-center gap-[1px] mt-1">
        {LINGUAL_SITES.map(
          (key) => (
            <SiteColumn
              key={key}
              site={tooth.sites[key]}
              label={SITE_LABEL[key]}
              disabled={
                disabledSites
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
  );
}

/* ============================================================================
ARCADA
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
  teethByNumber: Map<
    number,
    ToothData
  >;
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
  return (
    <div
      className="
        w-full
        overflow-hidden
      "
    >
      <div
        className="
          grid
          grid-cols-[repeat(16,minmax(0,1fr))]
          gap-0
          w-full
        "
      >
        {archNumbers.map(
          (number) => {
            const tooth =
              teethByNumber.get(
                number
              );

            if (!tooth)
              return null;

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
  return (
    <div
      className="
        rounded-xl
        border border-gray-200
        bg-white
        px-3
        py-2
        text-center
      "
    >
      <div className="text-[9px] text-gray-500">
        {label}
      </div>

      <div
        className="text-base font-semibold mt-1"
        style={{
          color:
            accent ?? "#111827",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ============================================================================
LEGENDA
============================================================================ */

function Legend() {
  return (
    <div
      className="
        mt-5
        rounded-xl
        border border-gray-200
        bg-gray-50
        p-3
      "
    >
      <div className="text-[10px] font-bold text-gray-700 mb-2">
        Legenda periodontal
      </div>

      <div
        className="
          grid
          grid-cols-2
          sm:grid-cols-3
          lg:grid-cols-6
          gap-2
        "
      >
        {/* PRETO */}
        <div className="flex items-center gap-2">
          <span
            className="
              block
              w-7
              h-[2px]
              bg-gray-900
            "
          />

          <span className="text-[9px] text-gray-600">
            Preto — anatomia dental
          </span>
        </div>

        {/* AZUL */}
        <div className="flex items-center gap-2">
          <span
            className="
              block
              w-7
              h-[2px]
              bg-blue-600
            "
          />

          <span className="text-[9px] text-gray-600">
            Azul — margem gengival
          </span>
        </div>

        {/* VERMELHO */}
        <div className="flex items-center gap-2">
          <span
            className="
              block
              w-7
              h-[2px]
              bg-red-600
            "
          />

          <span className="text-[9px] text-gray-600">
            Vermelho — sondagem/bolsa
          </span>
        </div>

        {/* SS */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600" />

          <span className="text-[9px] text-gray-600">
            SS — sangramento
          </span>
        </div>

        {/* PLACA */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-yellow-500" />

          <span className="text-[9px] text-gray-600">
            Placa
          </span>
        </div>

        {/* SUPURAÇÃO */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rotate-45 rounded-sm bg-purple-600" />

          <span className="text-[9px] text-gray-600">
            Supuração
          </span>
        </div>
      </div>

      <div className="mt-2 text-[8px] text-gray-400">
        NI = nível de inserção clínica ·
        MG = margem gengival ·
        PS = profundidade de sondagem
      </div>
    </div>
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

  return (
    <div
      className="
        grid
        grid-cols-2
        lg:grid-cols-4
        gap-2
        mt-4
      "
    >
      <Metric
        label="Profundidade média de sondagem"
        value={`${summary.avgPS.toFixed(1)} mm`}
      />

      <Metric
        label="Nível médio de inserção"
        value={`${summary.avgNI.toFixed(1)} mm`}
      />

      <Metric
        label="Sangramento à sondagem (SS)"
        value={`${summary.bopPercent.toFixed(0)}%`}
        accent={COLORS.red}
      />

      <Metric
        label="Índice de placa (IP)"
        value={`${summary.plaquePercent.toFixed(0)}%`}
        accent={COLORS.yellow}
      />
    </div>
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

  const teethByNumber =
    useMemo(() => {
      const map =
        new Map<
          number,
          ToothData
        >();

      for (const tooth of teeth) {
        map.set(
          tooth.number,
          tooth
        );
      }

      return map;
    }, [teeth]);

  const commit = useCallback(
    (next: ToothData[]) => {
      setTeeth(next);
      onChange?.(next);
    },
    [onChange]
  );

  const updateTooth =
    useCallback(
      (
        number: number,
        patch: Partial<ToothData>
      ) => {
        commit(
          teeth.map(
            (tooth) =>
              tooth.number ===
              number
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

  const updateSite =
    useCallback(
      (
        number: number,
        key: SiteKey,
        patch: Partial<SiteData>
      ) => {
        commit(
          teeth.map(
            (tooth) =>
              tooth.number ===
              number
                ? {
                    ...tooth,
                    sites: {
                      ...tooth.sites,
                      [key]: {
                        ...tooth.sites[
                          key
                        ],
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
        "rounded-2xl",
        "border border-gray-200",
        "bg-white",
        "p-3",
        "sm:p-4",
        className ?? "",
      ].join(" ")}
    >
      {/* CABEÇALHO */}

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Periodontograma
        </h2>

        <p className="text-xs text-gray-500 mt-1">
          Registro periodontal clínico por
          dente e por sítio.
        </p>
      </div>

      {/* ARCADA SUPERIOR */}

      <div className="space-y-2">
        <div
          className="
            flex
            items-center
            gap-2
            px-1
          "
        >
          <div className="h-px flex-1 bg-gray-200" />

          <span
            className="
              text-[9px]
              tracking-widest
              text-gray-500
              uppercase
              whitespace-nowrap
              font-semibold
            "
          >
            arcada superior
          </span>

          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <ArchBlock
          archNumbers={UPPER_ARCH}
          arch="upper"
          teethByNumber={teethByNumber}
          onUpdateTooth={updateTooth}
          onUpdateSite={updateSite}
        />

        {/* PLANO OCLUSAL */}

        <div
          className="
            w-full
            flex
            items-center
            gap-2
            px-1
            py-2
          "
        >
          <div className="h-px flex-1 bg-gray-300" />

          <span
            className="
              text-[8px]
              tracking-[0.25em]
              text-gray-400
              uppercase
              whitespace-nowrap
              font-semibold
            "
          >
            plano oclusal
          </span>

          <div className="h-px flex-1 bg-gray-300" />
        </div>

        {/* ARCADA INFERIOR */}

        <div
          className="
            flex
            items-center
            gap-2
            px-1
          "
        >
          <div className="h-px flex-1 bg-gray-200" />

          <span
            className="
              text-[9px]
              tracking-widest
              text-gray-500
              uppercase
              whitespace-nowrap
              font-semibold
            "
          >
            arcada inferior
          </span>

          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <ArchBlock
          archNumbers={LOWER_ARCH}
          arch="lower"
          teethByNumber={teethByNumber}
          onUpdateTooth={updateTooth}
          onUpdateSite={updateSite}
        />
      </div>

      {/* LEGENDA */}

      <Legend />

      {/* RESUMO */}

      <SummaryBar teeth={teeth} />
    </div>
  );
}

export default Odontogram;
