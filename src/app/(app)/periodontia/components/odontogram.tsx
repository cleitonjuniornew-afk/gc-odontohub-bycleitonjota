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
  ink: "#172033",
  tooth: "#FFFDF7",
  toothStroke: "#4B5563",
  toothDetail: "#9CA3AF",

  mgLine: "#111827",
  psLine: "#2563EB",
  bopLine: "#DC2626",

  bop: "#DC2626",
  plaque: "#D97706",
  suppuration: "#8B5CF6",

  healthy: "#059669",
  mild: "#CA8A04",
  moderate: "#EA580C",
  severe: "#DC2626",

  blue: "#2563EB",
  muted: "#64748B",
  border: "#D8DEE8",
  panel: "#F8FAFC",
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

type ToothGroup = "incisor" | "canine" | "premolar" | "molar";

function getToothGroup(fdi: number): ToothGroup {
  const last = fdi % 10;

  if (last === 1 || last === 2) return "incisor";
  if (last === 3) return "canine";
  if (last === 4 || last === 5) return "premolar";

  return "molar";
}

function isUpperThreeRootMolar(fdi: number) {
  return [16, 17, 18, 26, 27, 28].includes(fdi);
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

  if (status === "AUSENTE") {
    return (
      <svg
        viewBox="0 0 100 150"
        className="w-full h-full"
        aria-hidden="true"
      >
        <line
          x1="22"
          y1="35"
          x2="78"
          y2="115"
          stroke="#CBD5E1"
          strokeWidth="2"
        />
        <line
          x1="78"
          y1="35"
          x2="22"
          y2="115"
          stroke="#CBD5E1"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 150"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform={transform}>
        {/* COROA */}
        <path
          d="
            M31 16
            C36 10 64 10 69 16
            C73 27 72 45 67 61
            C63 68 37 68 33 61
            C28 45 27 27 31 16
            Z
          "
          fill={COLORS.tooth}
          stroke={COLORS.toothStroke}
          strokeWidth="1.8"
        />

        {/* BORDA INCISAL */}
        <path
          d="M31 17 C41 21 59 21 69 17"
          fill="none"
          stroke={COLORS.toothDetail}
          strokeWidth="1"
        />

        {/* LINHA CERVICAL */}
        <path
          d="M33 61 C42 66 58 66 67 61"
          fill="none"
          stroke={COLORS.toothStroke}
          strokeWidth="1.4"
        />

        {/* RAIZ ÚNICA */}
        <path
          d="
            M39 66
            C40 82 42 101 45 119
            C47 132 48 141 50 146
            C52 141 53 132 55 119
            C58 101 60 82 61 66
            C55 69 45 69 39 66
            Z
          "
          fill={COLORS.tooth}
          stroke={COLORS.toothStroke}
          strokeWidth="1.7"
        />

        {/* DETALHES LINGUAIS */}
        {lingual && (
          <>
            <path
              d="
                M38 28
                C42 23 58 23 62 28
                L59 51
                C56 57 44 57 41 51
                Z
              "
              fill="none"
              stroke={COLORS.toothDetail}
              strokeWidth="1"
            />

            <path
              d="M42 54 C47 58 53 58 58 54"
              fill="none"
              stroke={COLORS.toothDetail}
              strokeWidth="1"
            />
          </>
        )}

        {status === "IMPLANTE" && (
          <>
            <line
              x1="43"
              y1="77"
              x2="57"
              y2="77"
              stroke="#64748B"
              strokeWidth="1.6"
            />
            <line
              x1="44"
              y1="83"
              x2="56"
              y2="83"
              stroke="#64748B"
              strokeWidth="1.6"
            />
            <line
              x1="45"
              y1="89"
              x2="55"
              y2="89"
              stroke="#64748B"
              strokeWidth="1.6"
            />
          </>
        )}
      </g>
    </svg>
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

  if (status === "AUSENTE") {
    return (
      <svg
        viewBox="0 0 100 150"
        className="w-full h-full"
        aria-hidden="true"
      >
        <line
          x1="22"
          y1="35"
          x2="78"
          y2="115"
          stroke="#CBD5E1"
          strokeWidth="2"
        />
        <line
          x1="78"
          y1="35"
          x2="22"
          y2="115"
          stroke="#CBD5E1"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 150"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform={transform}>
        {/* COROA DO CANINO */}
        <path
          d="
            M31 18
            C35 12 42 11 47 15
            L50 25
            L53 15
            C58 11 65 12 69 18
            C72 30 71 47 66 61
            C61 67 39 67 34 61
            C29 47 28 30 31 18
            Z
          "
          fill={COLORS.tooth}
          stroke={COLORS.toothStroke}
          strokeWidth="1.8"
        />

        {/* CÚSPIDE MAIS CURTA */}
        <path
          d="M47 15 L50 25 L53 15"
          fill="none"
          stroke={COLORS.toothStroke}
          strokeWidth="1.3"
        />

        {/* LINHA CERVICAL */}
        <path
          d="M34 61 C43 66 57 66 66 61"
          fill="none"
          stroke={COLORS.toothStroke}
          strokeWidth="1.4"
        />

        {/* RAIZ */}
        <path
          d="
            M39 66
            C40 83 42 103 45 120
            C47 133 49 141 50 146
            C51 141 53 133 55 120
            C58 103 60 83 61 66
            C55 69 45 69 39 66
            Z
          "
          fill={COLORS.tooth}
          stroke={COLORS.toothStroke}
          strokeWidth="1.7"
        />

        {lingual && (
          <>
            <path
              d="
                M39 29
                C43 24 57 24 61 29
                L58 52
                C55 57 45 57 42 52
                Z
              "
              fill="none"
              stroke={COLORS.toothDetail}
              strokeWidth="1"
            />

            <path
              d="M50 30 L50 55"
              stroke={COLORS.toothDetail}
              strokeWidth="1"
            />
          </>
        )}

        {status === "IMPLANTE" && (
          <>
            <line
              x1="43"
              y1="77"
              x2="57"
              y2="77"
              stroke="#64748B"
              strokeWidth="1.6"
            />
            <line
              x1="44"
              y1="83"
              x2="56"
              y2="83"
              stroke="#64748B"
              strokeWidth="1.6"
            />
            <line
              x1="45"
              y1="89"
              x2="55"
              y2="89"
              stroke="#64748B"
              strokeWidth="1.6"
            />
          </>
        )}
      </g>
    </svg>
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

  if (status === "AUSENTE") {
    return (
      <svg
        viewBox="0 0 100 150"
        className="w-full h-full"
        aria-hidden="true"
      >
        <line
          x1="22"
          y1="35"
          x2="78"
          y2="115"
          stroke="#CBD5E1"
          strokeWidth="2"
        />
        <line
          x1="78"
          y1="35"
          x2="22"
          y2="115"
          stroke="#CBD5E1"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 150"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform={transform}>
        {/* COROA */}
        <path
          d="
            M27 28
            C32 19 40 16 47 19
            C49 20 51 20 53 19
            C60 16 68 19 73 28
            L68 60
            C62 67 38 67 32 60
            Z
          "
          fill={COLORS.tooth}
          stroke={COLORS.toothStroke}
          strokeWidth="1.8"
        />

        {/* SULCO CENTRAL */}
        <path
          d="M50 20 C48 31 48 44 50 59"
          fill="none"
          stroke={COLORS.toothDetail}
          strokeWidth="1.1"
        />

        {/* CÚSPIDES */}
        <path
          d="M29 28 C35 35 42 37 50 32"
          fill="none"
          stroke={COLORS.toothDetail}
          strokeWidth="1"
        />

        <path
          d="M71 28 C65 35 58 37 50 32"
          fill="none"
          stroke={COLORS.toothDetail}
          strokeWidth="1"
        />

        {/* LINHA CERVICAL */}
        <path
          d="M32 60 C41 66 59 66 68 60"
          fill="none"
          stroke={COLORS.toothStroke}
          strokeWidth="1.4"
        />

        {/* RAIZ */}
        <path
          d="
            M39 65
            C40 83 42 103 45 120
            C47 133 48 141 50 146
            C52 141 53 133 55 120
            C58 103 60 83 61 65
            C55 68 45 68 39 65
            Z
          "
          fill={COLORS.tooth}
          stroke={COLORS.toothStroke}
          strokeWidth="1.7"
        />

        {lingual && (
          <>
            <path
              d="
                M38 30
                C43 25 47 27 50 31
                C53 27 57 25 62 30
                L59 53
                C55 58 45 58 41 53
                Z
              "
              fill="none"
              stroke={COLORS.toothDetail}
              strokeWidth="1"
            />

            <path
              d="M50 31 L50 56"
              stroke={COLORS.toothDetail}
              strokeWidth="1"
            />
          </>
        )}

        {status === "IMPLANTE" && (
          <>
            <line
              x1="43"
              y1="77"
              x2="57"
              y2="77"
              stroke="#64748B"
              strokeWidth="1.6"
            />
            <line
              x1="44"
              y1="83"
              x2="56"
              y2="83"
              stroke="#64748B"
              strokeWidth="1.6"
            />
            <line
              x1="45"
              y1="89"
              x2="55"
              y2="89"
              stroke="#64748B"
              strokeWidth="1.6"
            />
          </>
        )}
      </g>
    </svg>
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

  if (status === "AUSENTE") {
    return (
      <svg
        viewBox="0 0 100 150"
        className="w-full h-full"
        aria-hidden="true"
      >
        <line
          x1="22"
          y1="35"
          x2="78"
          y2="115"
          stroke="#CBD5E1"
          strokeWidth="2"
        />
        <line
          x1="78"
          y1="35"
          x2="22"
          y2="115"
          stroke="#CBD5E1"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 150"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform={transform}>
        {/* COROA */}
        <path
          d="
            M20 27
            C24 18 32 15 39 19
            C44 22 46 23 50 19
            C54 23 56 22 61 19
            C68 15 76 18 80 27
            L74 60
            C67 67 33 67 26 60
            Z
          "
          fill={COLORS.tooth}
          stroke={COLORS.toothStroke}
          strokeWidth="1.8"
        />

        {/* SULCO CENTRAL */}
        <path
          d="M50 20 C48 30 48 44 50 59"
          fill="none"
          stroke={COLORS.toothDetail}
          strokeWidth="1.1"
        />

        {/* SULCO TRANSVERSAL */}
        <path
          d="M25 40 C35 36 42 38 50 43 C58 38 65 36 75 40"
          fill="none"
          stroke={COLORS.toothDetail}
          strokeWidth="1"
        />

        {/* LINHA CERVICAL */}
        <path
          d="M26 60 C37 66 63 66 74 60"
          fill="none"
          stroke={COLORS.toothStroke}
          strokeWidth="1.4"
        />

        {threeRoots ? (
          <>
            {/* RAIZ MESIAL */}
            <path
              d="
                M27 65
                C28 82 29 100 26 117
                C24 130 25 140 30 147
                C35 139 38 129 40 115
                L44 67
                C38 68 32 67 27 65
                Z
              "
              fill={COLORS.tooth}
              stroke={COLORS.toothStroke}
              strokeWidth="1.7"
            />

            {/* RAIZ PALATINA */}
            <path
              d="
                M44 67
                C45 85 46 104 47 121
                C48 133 49 141 50 147
                C51 141 52 133 53 121
                C54 104 55 85 56 67
                C52 68 48 68 44 67
                Z
              "
              fill={COLORS.tooth}
              stroke={COLORS.toothStroke}
              strokeWidth="1.7"
            />

            {/* RAIZ DISTAL */}
            <path
              d="
                M56 67
                L60 115
                C62 129 65 139 70 147
                C75 140 76 130 74 117
                C71 100 72 82 73 65
                C68 67 62 68 56 67
                Z
              "
              fill={COLORS.tooth}
              stroke={COLORS.toothStroke}
              strokeWidth="1.7"
            />
          </>
        ) : (
          <>
            {/* RAIZ MESIAL */}
            <path
              d="
                M28 65
                C29 83 30 103 27 120
                C25 132 27 141 32 147
                C37 139 40 129 42 115
                L46 67
                C40 68 34 68 28 65
                Z
              "
              fill={COLORS.tooth}
              stroke={COLORS.toothStroke}
              strokeWidth="1.7"
            />

            {/* RAIZ DISTAL */}
            <path
              d="
                M54 67
                L58 115
                C60 129 63 139 68 147
                C73 141 75 132 73 120
                C70 103 71 83 72 65
                C66 68 60 68 54 67
                Z
              "
              fill={COLORS.tooth}
              stroke={COLORS.toothStroke}
              strokeWidth="1.7"
            />
          </>
        )}

        {lingual && (
          <>
            <path
              d="
                M27 30
                C34 24 43 26 50 32
                C57 26 66 24 73 30
                L70 53
                C63 59 37 59 30 53
                Z
              "
              fill="none"
              stroke={COLORS.toothDetail}
              strokeWidth="1"
            />

            <path
              d="M50 32 L50 57"
              stroke={COLORS.toothDetail}
              strokeWidth="1"
            />
          </>
        )}

        {status === "IMPLANTE" && (
          <>
            <line
              x1="31"
              y1="77"
              x2="43"
              y2="77"
              stroke="#64748B"
              strokeWidth="1.5"
            />
            <line
              x1="30"
              y1="83"
              x2="42"
              y2="83"
              stroke="#64748B"
              strokeWidth="1.5"
            />
            <line
              x1="30"
              y1="89"
              x2="41"
              y2="89"
              stroke="#64748B"
              strokeWidth="1.5"
            />

            <line
              x1="57"
              y1="77"
              x2="69"
              y2="77"
              stroke="#64748B"
              strokeWidth="1.5"
            />
            <line
              x1="58"
              y1="83"
              x2="70"
              y2="83"
              stroke="#64748B"
              strokeWidth="1.5"
            />
            <line
              x1="59"
              y1="89"
              x2="70"
              y2="89"
              stroke="#64748B"
              strokeWidth="1.5"
            />
          </>
        )}
      </g>
    </svg>
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
  toothNumber,
}: {
  type: ToothGroup;
  upper: boolean;
  lingual: boolean;
  status: ToothStatus;
  toothNumber: number;
}) {
  if (type === "incisor") {
    return (
      <IncisorSVG
        upper={upper}
        lingual={lingual}
        status={status}
      />
    );
  }

  if (type === "canine") {
    return (
      <CanineSVG
        upper={upper}
        lingual={lingual}
        status={status}
      />
    );
  }

  if (type === "premolar") {
    return (
      <PremolarSVG
        upper={upper}
        lingual={lingual}
        status={status}
      />
    );
  }

  return (
    <MolarSVG
      upper={upper}
      lingual={lingual}
      status={status}
      threeRoots={isUpperThreeRootMolar(toothNumber)}
    />
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
        w-[32px]
        h-[22px]
        px-0
        text-[10px]
        text-center
        rounded
        bg-white
        border
        text-slate-700
        placeholder:text-slate-300
        focus:outline-none
        focus:ring-1
        focus:ring-blue-500/40
        [appearance:textfield]
        [&::-webkit-outer-spin-button]:appearance-none
        [&::-webkit-inner-spin-button]:appearance-none
      "
      style={{
        borderColor: colorHint ?? "#CBD5E1",
        color: colorHint ?? "#334155",
      }}
    />
  );
}

/* ============================================================================
LINHAS PERIODONTAIS
============================================================================ */

function PeriodontalLines({
  site,
}: {
  site: SiteData;
}) {
  return (
    <div className="relative w-[34px] h-[16px]">
      {/* LINHA PRETA — MARGEM GENGIVAL */}
      <div
        className="
          absolute
          left-1/2
          -translate-x-1/2
          top-[2px]
          w-[24px]
          h-[2px]
          rounded-full
        "
        style={{
          backgroundColor: COLORS.mgLine,
          opacity: site.mg !== null ? 1 : 0.22,
        }}
        title="Preto — Margem gengival"
      />

      {/* LINHA AZUL — PROFUNDIDADE DE SONDAGEM */}
      <div
        className="
          absolute
          left-1/2
          -translate-x-1/2
          top-[7px]
          w-[24px]
          h-[2px]
          rounded-full
        "
        style={{
          backgroundColor: COLORS.psLine,
          opacity: site.ps !== null ? 1 : 0.22,
        }}
        title="Azul — Profundidade de sondagem"
      />

      {/* LINHA VERMELHA — SANGRAMENTO */}
      <div
        className="
          absolute
          left-1/2
          -translate-x-1/2
          top-[12px]
          w-[24px]
          h-[2px]
          rounded-full
        "
        style={{
          backgroundColor: COLORS.bopLine,
          opacity: site.bop ? 1 : 0.18,
        }}
        title="Vermelho — Sangramento à sondagem"
      />
    </div>
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
      : "#94A3B8";

  return (
    <div
      className={[
        "w-[36px]",
        "h-[142px]",
        "flex",
        "flex-col",
        "items-center",
        "justify-start",
        "gap-[2px]",
        disabled
          ? "opacity-30 pointer-events-none"
          : "",
      ].join(" ")}
    >
      {/* RÓTULO */}
      <span
        className="
          h-[14px]
          flex
          items-center
          justify-center
          text-[8px]
          font-bold
          text-slate-500
        "
      >
        {label}
      </span>

      {/* MG */}
      <MiniNumberInput
        ariaLabel={`Margem gengival ${label}`}
        value={site.mg}
        placeholder="MG"
        allowNegative
        onChange={(value) =>
          onChange({ mg: value })
        }
      />

      {/* PS */}
      <MiniNumberInput
        ariaLabel={`Profundidade de sondagem ${label}`}
        value={site.ps}
        placeholder="PS"
        colorHint={psColor}
        onChange={(value) =>
          onChange({ ps: value })
        }
      />

      {/* NI — ESPAÇO SEMPRE RESERVADO */}
      <div
        className="
          h-[14px]
          w-full
          flex
          items-center
          justify-center
        "
      >
        {ni !== null && (
          <span
            className="
              text-[8px]
              font-bold
              whitespace-nowrap
            "
            style={{
              color: severityColor(site.ps),
            }}
          >
            NI {ni}
          </span>
        )}
      </div>

      {/* LINHAS */}
      <PeriodontalLines site={site} />

      {/* MARCADORES */}
      <div className="flex items-center justify-center gap-[5px] h-[15px]">
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
            w-[8px]
            h-[8px]
            rounded-full
            border
          "
          style={{
            backgroundColor: site.bop
              ? COLORS.bop
              : "transparent",
            borderColor: site.bop
              ? COLORS.bop
              : "#CBD5E1",
          }}
        />

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
            w-[8px]
            h-[8px]
            rounded-sm
            border
          "
          style={{
            backgroundColor: site.plaque
              ? COLORS.plaque
              : "transparent",
            borderColor: site.plaque
              ? COLORS.plaque
              : "#CBD5E1",
          }}
        />

        <button
          type="button"
          title="Supuração"
          aria-label={`Supuração ${label}`}
          aria-pressed={site.suppuration}
          onClick={() =>
            onChange({
              suppuration: !site.suppuration,
            })
          }
          className="
            w-[8px]
            h-[8px]
            rotate-45
            border
          "
          style={{
            backgroundColor: site.suppuration
              ? COLORS.suppuration
              : "transparent",
            borderColor: site.suppuration
              ? COLORS.suppuration
              : "#CBD5E1",
          }}
        />
      </div>
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
  onUpdate: (patch: Partial<ToothData>) => void;
}) {
  const group = getToothGroup(tooth.number);

  return (
    <div
      className="
        h-[54px]
        w-full
        flex
        flex-col
        items-center
        justify-start
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
          h-[20px]
          w-[52px]
          px-0
          text-[7px]
          text-center
          bg-white
          border
          border-slate-300
          rounded
          text-slate-600
          focus:outline-none
        "
      >
        <option value="PRESENTE">Pres.</option>
        <option value="AUSENTE">Aus.</option>
        <option value="IMPLANTE">Impl.</option>
      </select>

      {/* MOBILIDADE */}
      {tooth.status !== "AUSENTE" && (
        <div className="flex items-center gap-[2px]">
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
              className="
                w-[13px]
                h-[13px]
                rounded-full
                text-[7px]
                flex
                items-center
                justify-center
                border
              "
              style={{
                backgroundColor:
                  tooth.mobility === grade
                    ? "#DBEAFE"
                    : "#FFFFFF",
                borderColor:
                  tooth.mobility === grade
                    ? "#2563EB"
                    : "#CBD5E1",
                color:
                  tooth.mobility === grade
                    ? "#1D4ED8"
                    : "#64748B",
              }}
            >
              {grade}
            </button>
          ))}
        </div>
      )}

      {/* FURCA */}
      {tooth.status === "PRESENTE" &&
        hasFurca(group) && (
          <div className="flex items-center gap-[2px]">
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
                w-[23px]
                h-[17px]
                text-[7px]
                text-center
                bg-white
                border
                border-slate-300
                rounded
                text-slate-600
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

            <span className="text-[7px] text-slate-400">
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
                w-[23px]
                h-[17px]
                text-[7px]
                text-center
                bg-white
                border
                border-slate-300
                rounded
                text-slate-600
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
  );
}

/* ============================================================================
COLUNA DO DENTE
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
  const disabledSites =
    tooth.status === "AUSENTE";

  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-start
        shrink-0
        w-[78px]
      "
    >
      {/* VESTIBULAR */}

      <div className="h-[150px] flex items-start justify-center">
        {VESTIBULAR_SITES.map((key) => (
          <SiteColumn
            key={key}
            site={tooth.sites[key]}
            label={SITE_LABEL[key]}
            disabled={disabledSites}
            onChange={(patch) =>
              onUpdateSite(key, patch)
            }
          />
        ))}
      </div>

      {/* DENTE */}

      <div
        className="
          relative
          w-[70px]
          h-[112px]
          flex
          items-center
          justify-center
          shrink-0
        "
      >
        <ToothSVG
          type={group}
          upper={upper}
          lingual={false}
          status={tooth.status}
          toothNumber={tooth.number}
        />
      </div>

      {/* NÚMERO */}

      <div
        className="
          h-[20px]
          w-full
          flex
          items-center
          justify-center
        "
      >
        <span
          className="
            text-[10px]
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

      {/* LINGUAL */}

      <div className="h-[150px] flex items-start justify-center mt-[2px]">
        {LINGUAL_SITES.map((key) => (
          <SiteColumn
            key={key}
            site={tooth.sites[key]}
            label={SITE_LABEL[key]}
            disabled={disabledSites}
            onChange={(patch) =>
              onUpdateSite(key, patch)
            }
          />
        ))}
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
  return (
    <div
      className="
        w-full
        overflow-x-auto
        overflow-y-hidden
        pb-2
        scrollbar-thin
      "
    >
      <div
        className="
          flex
          justify-center
          items-start
          gap-0
          min-w-max
          mx-auto
        "
      >
        {archNumbers.map((number) => {
          const tooth =
            teethByNumber.get(number);

          if (!tooth) return null;

          return (
            <ToothColumn
              key={number}
              tooth={tooth}
              arch={arch}
              onUpdateTooth={(patch) =>
                onUpdateTooth(
                  number,
                  patch
                )
              }
              onUpdateSite={(key, patch) =>
                onUpdateSite(
                  number,
                  key,
                  patch
                )
              }
            />
          );
        })}
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
        rounded-2xl
        border border-slate-200
        bg-slate-50
        px-4
        py-4
      "
    >
      <div className="text-[11px] font-bold text-slate-700 mb-3">
        Legenda periodontal
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* PRETO */}
        <div className="flex items-center gap-2">
          <div className="w-[32px] space-y-[3px]">
            <div className="h-[2px] rounded-full bg-slate-900" />
            <div className="h-[2px] rounded-full bg-slate-300" />
            <div className="h-[2px] rounded-full bg-slate-300" />
          </div>

          <div>
            <div className="text-[10px] font-semibold text-slate-700">
              Linha preta
            </div>
            <div className="text-[9px] text-slate-500">
              Margem gengival (MG)
            </div>
          </div>
        </div>

        {/* AZUL */}
        <div className="flex items-center gap-2">
          <div className="w-[32px] space-y-[3px]">
            <div className="h-[2px] rounded-full bg-slate-300" />
            <div className="h-[2px] rounded-full bg-blue-600" />
            <div className="h-[2px] rounded-full bg-slate-300" />
          </div>

          <div>
            <div className="text-[10px] font-semibold text-slate-700">
              Linha azul
            </div>
            <div className="text-[9px] text-slate-500">
              Profundidade de sondagem (PS)
            </div>
          </div>
        </div>

        {/* VERMELHO */}
        <div className="flex items-center gap-2">
          <div className="w-[32px] space-y-[3px]">
            <div className="h-[2px] rounded-full bg-slate-300" />
            <div className="h-[2px] rounded-full bg-slate-300" />
            <div className="h-[2px] rounded-full bg-red-600" />
          </div>

          <div>
            <div className="text-[10px] font-semibold text-slate-700">
              Linha vermelha
            </div>
            <div className="text-[9px] text-slate-500">
              Sangramento à sondagem (SS)
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <div className="flex items-center gap-2">
            <span
              className="
                w-[8px]
                h-[8px]
                rounded-full
                bg-red-600
              "
            />
            <span className="text-[9px] text-slate-500">
              Sangramento
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="
                w-[8px]
                h-[8px]
                rounded-sm
                bg-amber-600
              "
            />
            <span className="text-[9px] text-slate-500">
              Placa
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="
                w-[8px]
                h-[8px]
                rotate-45
                rounded-sm
                bg-violet-500
              "
            />
            <span className="text-[9px] text-slate-500">
              Supuração
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-blue-600">
              NI
            </span>
            <span className="text-[9px] text-slate-500">
              Nível de inserção
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-700">
              0–3
            </span>
            <span className="text-[9px] text-slate-500">
              Mobilidade
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-700">
              F
            </span>
            <span className="text-[9px] text-slate-500">
              Furca
            </span>
          </div>
        </div>
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
        border border-slate-200
        bg-white
        px-4
        py-3
        min-w-[150px]
        flex-1
      "
    >
      <div className="text-[9px] text-slate-500 leading-tight">
        {label}
      </div>

      <div
        className="text-lg font-bold mt-1"
        style={{
          color: accent ?? COLORS.ink,
        }}
      >
        {value}
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
    <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
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
        accent={COLORS.bop}
      />

      <Metric
        label="Índice de placa (IP)"
        value={`${summary.plaquePercent.toFixed(0)}%`}
        accent={COLORS.plaque}
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

  const teethByNumber = useMemo(() => {
    const map =
      new Map<number, ToothData>();

    for (const tooth of teeth) {
      map.set(tooth.number, tooth);
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
        "rounded-3xl",
        "border border-slate-200",
        "bg-white",
        "p-4 sm:p-5",
        "shadow-sm",
        className ?? "",
      ].join(" ")}
    >
      {/* CABEÇALHO */}

      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-800">
          Periodontograma
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          Registro periodontal clínico por dente
          e por sítio.
        </p>
      </div>

      {/* ARCADA SUPERIOR */}

      <div
        className="
          flex
          items-center
          gap-3
          mb-3
        "
      >
        <div className="h-px flex-1 bg-slate-200" />

        <span
          className="
            text-[9px]
            font-bold
            tracking-[0.18em]
            text-slate-500
            uppercase
            whitespace-nowrap
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

      {/* PLANO OCLUSAL */}

      <div
        className="
          flex
          items-center
          gap-3
          py-4
        "
      >
        <div className="h-px flex-1 bg-slate-200" />

        <div
          className="
            px-4
            py-1
            rounded-full
            border border-slate-200
            bg-slate-50
            text-[8px]
            font-bold
            tracking-[0.2em]
            text-slate-400
            uppercase
            whitespace-nowrap
          "
        >
          Plano oclusal
        </div>

        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* ARCADA INFERIOR */}

      <div
        className="
          flex
          items-center
          gap-3
          mb-3
        "
      >
        <div className="h-px flex-1 bg-slate-200" />

        <span
          className="
            text-[9px]
            font-bold
            tracking-[0.18em]
            text-slate-500
            uppercase
            whitespace-nowrap
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

      {/* LEGENDA */}

      <Legend />

      {/* RESUMO */}

      <SummaryBar teeth={teeth} />
    </div>
  );
}

export default Odontogram;
