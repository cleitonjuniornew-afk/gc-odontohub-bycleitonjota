"use client";

import React, { useCallback, useMemo, useState } from "react";

/* ============================================================================
 * TIPOS
 * ========================================================================== */

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
 * ARCADAS
 * ========================================================================== */

const UPPER_ARCH = [
  18, 17, 16, 15, 14, 13, 12, 11,
  21, 22, 23, 24, 25, 26, 27, 28,
];

const LOWER_ARCH = [
  48, 47, 46, 45, 44, 43, 42, 41,
  31, 32, 33, 34, 35, 36, 37, 38,
];

/* ============================================================================
 * SÍTIOS
 * ========================================================================== */

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
 * CORES
 * ========================================================================== */

const COLORS = {
  tooth: "#FFFDF7",
  toothStroke: "#1F2937",

  /* Linhas clássicas do periodontograma */
  black: "#111827",
  blue: "#2563EB",
  red: "#DC2626",

  green: "#16A34A",
  yellow: "#EAB308",
  orange: "#EA580C",

  text: "#172033",
  muted: "#64748B",
  border: "#CBD5E1",
  background: "#FFFFFF",
  soft: "#F8FAFC",
};

function severityColor(ps: number | null) {
  if (ps === null) return COLORS.muted;
  if (ps <= 3) return COLORS.green;
  if (ps <= 5) return COLORS.yellow;
  if (ps <= 7) return COLORS.orange;
  return COLORS.red;
}

/* ============================================================================
 * TIPO DO DENTE
 * ========================================================================== */

type ToothGroup = "incisor" | "canine" | "premolar" | "molar";

function getToothGroup(number: number): ToothGroup {
  const last = number % 10;

  if (last === 1 || last === 2) return "incisor";
  if (last === 3) return "canine";
  if (last === 4 || last === 5) return "premolar";

  return "molar";
}

function isThreeRootMolar(number: number) {
  return [16, 17, 18, 26, 27, 28].includes(number);
}

function hasFurcation(group: ToothGroup) {
  return group === "premolar" || group === "molar";
}

/* ============================================================================
 * DADOS
 * ========================================================================== */

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
 * NÍVEL DE INSERÇÃO
 * ========================================================================== */

function computeNI(site: SiteData): number | null {
  if (site.ps === null) return null;

  const mg = site.mg ?? 0;

  return site.ps + mg;
}

/* ============================================================================
 * RESUMO
 * ========================================================================== */

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
 * SVG ANATÔMICO
 *
 * O SVG possui altura FIXA.
 * Os campos MG/PS/NI ficam fora dele.
 * Portanto, preencher NI nunca aumenta a altura do dente.
 * ========================================================================== */

interface ToothSVGProps {
  number: number;
  type: ToothGroup;
  upper: boolean;
  lingual: boolean;
  status: ToothStatus;
}

function ToothSVG({
  number,
  type,
  upper,
  lingual,
  status,
}: ToothSVGProps) {
  const transform = upper
    ? "translate(0 0)"
    : "translate(0 118) scale(1 -1)";

  const threeRoots =
    type === "molar" &&
    isThreeRootMolar(number);

  if (status === "AUSENTE") {
    return (
      <svg
        viewBox="0 0 100 118"
        width="58"
        height="78"
        aria-label={`Dente ${number} ausente`}
      >
        <line
          x1="22"
          y1="45"
          x2="78"
          y2="45"
          stroke="#94A3B8"
          strokeWidth="2"
        />
        <line
          x1="22"
          y1="45"
          x2="78"
          y2="75"
          stroke="#94A3B8"
          strokeWidth="2"
        />
        <line
          x1="78"
          y1="45"
          x2="22"
          y2="75"
          stroke="#94A3B8"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 118"
      width="58"
      height="78"
      preserveAspectRatio="xMidYMid meet"
      aria-label={`Dente ${number}`}
    >
      <g transform={transform}>
        {type === "incisor" && (
          <>
            {/* COROA */}
            <path
              d="
                M30 17
                C35 10 65 10 70 17
                L68 52
                C63 59 37 59 32 52
                Z
              "
              fill={COLORS.tooth}
              stroke={COLORS.black}
              strokeWidth="1.8"
            />

            {/* LINHA CERVICAL PRETA */}
            <path
              d="M32 52 C40 57 60 57 68 52"
              fill="none"
              stroke={COLORS.black}
              strokeWidth="1.3"
            />

            {/* RAIZ */}
            <path
              d="
                M34 53
                C36 67 39 82 43 101
                C45 109 48 114 50 116
                C52 114 55 109 57 101
                C61 82 64 67 66 53
                C58 58 42 58 34 53
                Z
              "
              fill={COLORS.tooth}
              stroke={COLORS.black}
              strokeWidth="1.8"
            />

            {/* LINHA AZUL - MARGEM GENGIVAL */}
            <path
              d="M33 49 C41 54 59 54 67 49"
              fill="none"
              stroke={COLORS.blue}
              strokeWidth="2"
            />

            {/* LINHA VERMELHA - REFERÊNCIA PERIODONTAL */}
            <path
              d="M35 55 C42 59 58 59 65 55"
              fill="none"
              stroke={COLORS.red}
              strokeWidth="1.6"
            />

            {lingual && (
              <>
                <path
                  d="
                    M39 25
                    C43 21 57 21 61 25
                    L59 45
                    C56 50 44 50 41 45
                    Z
                  "
                  fill="none"
                  stroke="#64748B"
                  strokeWidth="1"
                />

                <path
                  d="M43 47 C47 50 53 50 57 47"
                  fill="none"
                  stroke="#64748B"
                  strokeWidth="1"
                />
              </>
            )}
          </>
        )}

        {type === "canine" && (
          <>
            {/* COROA DO CANINO - SEM PONTA EXAGERADA */}
            <path
              d="
                M31 17
                C36 11 43 10 50 14
                C57 10 64 11 69 17
                L66 51
                C60 58 40 58 34 51
                Z
              "
              fill={COLORS.tooth}
              stroke={COLORS.black}
              strokeWidth="1.8"
            />

            {/* CÚSPIDE DISCRETA */}
            <path
              d="M43 14 C46 12 48 11 50 14 C52 11 54 12 57 14"
              fill="none"
              stroke={COLORS.black}
              strokeWidth="1.4"
            />

            {/* CERVICAL */}
            <path
              d="M34 51 C42 57 58 57 66 51"
              fill="none"
              stroke={COLORS.black}
              strokeWidth="1.3"
            />

            {/* RAIZ */}
            <path
              d="
                M36 52
                C38 70 41 87 44 103
                C46 111 48 115 50 117
                C52 115 54 111 56 103
                C59 87 62 70 64 52
                C57 57 43 57 36 52
                Z
              "
              fill={COLORS.tooth}
              stroke={COLORS.black}
              strokeWidth="1.8"
            />

            {/* AZUL */}
            <path
              d="M35 48 C43 54 57 54 65 48"
              fill="none"
              stroke={COLORS.blue}
              strokeWidth="2"
            />

            {/* VERMELHA */}
            <path
              d="M37 54 C44 58 56 58 63 54"
              fill="none"
              stroke={COLORS.red}
              strokeWidth="1.6"
            />

            {lingual && (
              <>
                <path
                  d="
                    M40 25
                    C44 21 56 21 60 25
                    L58 46
                    C55 50 45 50 42 46
                    Z
                  "
                  fill="none"
                  stroke="#64748B"
                  strokeWidth="1"
                />

                <path
                  d="M50 26 L50 48"
                  stroke="#64748B"
                  strokeWidth="1"
                />
              </>
            )}
          </>
        )}

        {type === "premolar" && (
          <>
            {/* COROA */}
            <path
              d="
                M25 25
                C31 17 39 14 50 16
                C61 14 69 17 75 25
                L70 51
                C62 58 38 58 30 51
                Z
              "
              fill={COLORS.tooth}
              stroke={COLORS.black}
              strokeWidth="1.8"
            />

            {/* DUAS CÚSPIDES */}
            <path
              d="M32 25 C38 17 44 17 50 25"
              fill="none"
              stroke={COLORS.black}
              strokeWidth="1.3"
            />

            <path
              d="M50 25 C56 17 62 17 68 25"
              fill="none"
              stroke={COLORS.black}
              strokeWidth="1.3"
            />

            {/* SULCO */}
            <path
              d="M50 24 C48 31 48 40 50 49"
              fill="none"
              stroke="#475569"
              strokeWidth="1.1"
            />

            {/* CERVICAL */}
            <path
              d="M30 51 C40 57 60 57 70 51"
              fill="none"
              stroke={COLORS.black}
              strokeWidth="1.3"
            />

            {/* RAIZ */}
            <path
              d="
                M36 52
                C38 68 41 86 44 102
                C46 110 48 115 50 117
                C52 115 54 110 56 102
                C59 86 62 68 64 52
                C56 57 44 57 36 52
                Z
              "
              fill={COLORS.tooth}
              stroke={COLORS.black}
              strokeWidth="1.8"
            />

            {/* AZUL */}
            <path
              d="M31 48 C41 54 59 54 69 48"
              fill="none"
              stroke={COLORS.blue}
              strokeWidth="2"
            />

            {/* VERMELHA */}
            <path
              d="M33 54 C42 58 58 58 67 54"
              fill="none"
              stroke={COLORS.red}
              strokeWidth="1.6"
            />

            {lingual && (
              <path
                d="
                  M34 26
                  C40 20 46 21 50 27
                  C54 21 60 20 66 26
                  L63 47
                  C58 52 42 52 37 47
                  Z
                "
                fill="none"
                stroke="#64748B"
                strokeWidth="1"
              />
            )}
          </>
        )}

        {type === "molar" && (
          <>
            {/* COROA MOLAR */}
            <path
              d="
                M20 25
                C25 17 33 14 41 18
                C45 20 47 21 50 17
                C53 21 55 20 59 18
                C67 14 75 17 80 25
                L75 51
                C66 59 34 59 25 51
                Z
              "
              fill={COLORS.tooth}
              stroke={COLORS.black}
              strokeWidth="1.8"
            />

            {/* CÚSPIDES */}
            <path
              d="M25 25 C30 18 37 18 43 25"
              fill="none"
              stroke={COLORS.black}
              strokeWidth="1.2"
            />

            <path
              d="M43 25 C47 20 48 20 50 17"
              fill="none"
              stroke={COLORS.black}
              strokeWidth="1.2"
            />

            <path
              d="M50 17 C52 20 53 20 57 25"
              fill="none"
              stroke={COLORS.black}
              strokeWidth="1.2"
            />

            <path
              d="M57 25 C63 18 70 18 75 25"
              fill="none"
              stroke={COLORS.black}
              strokeWidth="1.2"
            />

            {/* SULCO CENTRAL */}
            <path
              d="
                M50 18
                C47 26 47 38 50 50
                C53 38 53 26 50 18
              "
              fill="none"
              stroke="#475569"
              strokeWidth="1.1"
            />

            <path
              d="M26 36 C35 33 42 35 50 42"
              fill="none"
              stroke="#475569"
              strokeWidth="1"
            />

            <path
              d="M74 36 C65 33 58 35 50 42"
              fill="none"
              stroke="#475569"
              strokeWidth="1"
            />

            {/* CERVICAL */}
            <path
              d="M25 51 C36 58 64 58 75 51"
              fill="none"
              stroke={COLORS.black}
              strokeWidth="1.3"
            />

            {threeRoots ? (
              <>
                {/* RAIZ MESIAL */}
                <path
                  d="
                    M28 52
                    C29 66 30 79 27 93
                    C25 103 25 112 29 117
                    C35 110 38 101 40 90
                    L44 53
                    C39 56 33 56 28 52
                    Z
                  "
                  fill={COLORS.tooth}
                  stroke={COLORS.black}
                  strokeWidth="1.7"
                />

                {/* RAIZ PALATINA/CENTRAL */}
                <path
                  d="
                    M44 53
                    C45 67 46 81 46 95
                    C46 106 48 113 50 117
                    C52 113 54 106 54 95
                    C54 81 55 67 56 53
                    C52 56 48 56 44 53
                    Z
                  "
                  fill={COLORS.tooth}
                  stroke={COLORS.black}
                  strokeWidth="1.7"
                />

                {/* RAIZ DISTAL */}
                <path
                  d="
                    M56 53
                    L60 90
                    C62 101 65 110 71 117
                    C75 112 75 103 73 93
                    C70 79 71 66 72 52
                    C67 56 61 56 56 53
                    Z
                  "
                  fill={COLORS.tooth}
                  stroke={COLORS.black}
                  strokeWidth="1.7"
                />
              </>
            ) : (
              <>
                {/* DUAS RAÍZES PARA MOLARES INFERIORES E OUTROS */}
                <path
                  d="
                    M28 52
                    C29 68 30 81 27 96
                    C25 107 27 113 32 117
                    C37 109 40 99 42 89
                    L46 53
                    C40 56 34 56 28 52
                    Z
                  "
                  fill={COLORS.tooth}
                  stroke={COLORS.black}
                  strokeWidth="1.7"
                />

                <path
                  d="
                    M54 53
                    L58 89
                    C60 99 63 109 68 117
                    C73 113 75 107 73 96
                    C70 81 71 68 72 52
                    C66 56 60 56 54 53
                    Z
                  "
                  fill={COLORS.tooth}
                  stroke={COLORS.black}
                  strokeWidth="1.7"
                />
              </>
            )}

            {/* LINHA AZUL */}
            <path
              d="M26 48 C38 54 62 54 74 48"
              fill="none"
              stroke={COLORS.blue}
              strokeWidth="2"
            />

            {/* LINHA VERMELHA */}
            <path
              d="M28 54 C39 59 61 59 72 54"
              fill="none"
              stroke={COLORS.red}
              strokeWidth="1.6"
            />

            {lingual && (
              <>
                <path
                  d="
                    M27 27
                    C33 20 42 21 50 28
                    C58 21 67 20 73 27
                    L70 47
                    C62 53 38 53 30 47
                    Z
                  "
                  fill="none"
                  stroke="#64748B"
                  strokeWidth="1"
                />

                <path
                  d="M50 28 L50 49"
                  stroke="#64748B"
                  strokeWidth="1"
                />
              </>
            )}
          </>
        )}

        {/* IMPLANTE */}
        {status === "IMPLANTE" && (
          <>
            <line
              x1="37"
              y1="65"
              x2="63"
              y2="65"
              stroke="#7C3AED"
              strokeWidth="2"
            />
            <line
              x1="39"
              y1="71"
              x2="61"
              y2="71"
              stroke="#7C3AED"
              strokeWidth="2"
            />
            <line
              x1="40"
              y1="77"
              x2="60"
              y2="77"
              stroke="#7C3AED"
              strokeWidth="2"
            />
            <line
              x1="42"
              y1="83"
              x2="58"
              y2="83"
              stroke="#7C3AED"
              strokeWidth="2"
            />
          </>
        )}
      </g>
    </svg>
  );
}

/* ============================================================================
 * INPUT
 * ========================================================================== */

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

        const parsed = Number(raw);

        if (Number.isNaN(parsed)) return;

        const minimum = allowNegative ? -9 : 0;
        const limited = Math.max(
          minimum,
          Math.min(12, parsed)
        );

        onChange(limited);
      }}
      className="
        h-6
        w-10
        shrink-0
        rounded
        border
        bg-white
        text-center
        text-[10px]
        font-medium
        text-slate-800
        outline-none
        placeholder:text-slate-300
        focus:ring-1
        focus:ring-blue-400
      "
      style={{
        borderColor: colorHint ?? COLORS.border,
      }}
    />
  );
}

/* ============================================================================
 * COLUNA DE SÍTIO
 *
 * Altura fixa.
 * NI ocupa sempre o mesmo espaço mesmo quando vazio.
 * Isso impede que o dente "desça" ao preencher.
 * ========================================================================== */

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

  return (
    <div
      className={`
        flex
        w-10
        shrink-0
        flex-col
        items-center
        gap-1
        ${disabled ? "opacity-35 pointer-events-none" : ""}
      `}
    >
      <span className="h-3 text-[9px] font-bold text-slate-600">
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
        colorHint={
          site.ps !== null
            ? severityColor(site.ps)
            : undefined
        }
        onChange={(value) =>
          onChange({ ps: value })
        }
      />

      {/* ESPAÇO FIXO DO NI */}
      <div className="flex h-4 items-center justify-center">
        {ni !== null ? (
          <span
            className="whitespace-nowrap text-[8px] font-bold"
            style={{
              color: severityColor(site.ps),
            }}
          >
            NI {ni}
          </span>
        ) : (
          <span className="text-[8px] text-transparent">
            NI 0
          </span>
        )}
      </div>

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
        className={`
          h-3
          w-3
          shrink-0
          rounded-full
          border
          ${
            site.bop
              ? "border-red-500 bg-red-500"
              : "border-slate-300 bg-white"
          }
        `}
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
        className={`
          h-3
          w-3
          shrink-0
          rounded-sm
          border
          ${
            site.plaque
              ? "border-yellow-500 bg-yellow-400"
              : "border-slate-300 bg-white"
          }
        `}
      />

      {/* SUPURAÇÃO */}
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
        className={`
          h-3
          w-3
          shrink-0
          rotate-45
          border
          ${
            site.suppuration
              ? "border-purple-500 bg-purple-400"
              : "border-slate-300 bg-white"
          }
        `}
      />
    </div>
  );
}

/* ============================================================================
 * CONTROLES DO DENTE
 * ========================================================================== */

function ToothControls({
  tooth,
  onUpdate,
}: {
  tooth: ToothData;
  onUpdate: (patch: Partial<ToothData>) => void;
}) {
  const group = getToothGroup(tooth.number);

  return (
    <div className="flex h-7 w-full items-center justify-center gap-1">
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
          h-6
          w-11
          rounded
          border
          border-slate-300
          bg-white
          px-0.5
          text-[8px]
          text-slate-700
          outline-none
        "
      >
        <option value="PRESENTE">Pres.</option>
        <option value="AUSENTE">Aus.</option>
        <option value="IMPLANTE">Impl.</option>
      </select>

      <div className="flex gap-0.5">
        {[0, 1, 2, 3].map((grade) => (
          <button
            key={grade}
            type="button"
            title={`Mobilidade grau ${grade}`}
            aria-label={`Mobilidade grau ${grade} do dente ${tooth.number}`}
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
              h-5
              w-5
              items-center
              justify-center
              rounded-full
              border
              text-[8px]
              font-medium
              ${
                tooth.mobility === grade
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-slate-300 bg-white text-slate-500"
              }
            `}
          >
            {grade}
          </button>
        ))}
      </div>

      {tooth.status === "PRESENTE" &&
        hasFurcation(group) && (
          <div className="flex items-center gap-0.5">
            <select
              aria-label={`Furca vestibular do dente ${tooth.number}`}
              value={tooth.buccalFurcation}
              onChange={(event) =>
                onUpdate({
                  buccalFurcation: Number(
                    event.target.value
                  ),
                })
              }
              className="
                h-5
                w-6
                rounded
                border
                border-slate-300
                bg-white
                text-center
                text-[8px]
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

            <span className="text-[8px] text-slate-400">
              /
            </span>

            <select
              aria-label={`Furca lingual do dente ${tooth.number}`}
              value={tooth.lingualFurcation}
              onChange={(event) =>
                onUpdate({
                  lingualFurcation: Number(
                    event.target.value
                  ),
                })
              }
              className="
                h-5
                w-6
                rounded
                border
                border-slate-300
                bg-white
                text-center
                text-[8px]
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
 * COLUNA COMPLETA DO DENTE
 * ========================================================================== */

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
  const disabled =
    tooth.status === "AUSENTE";

  return (
    <div
      className="
        flex
        w-[70px]
        min-w-[70px]
        shrink-0
        flex-col
        items-center
      "
    >
      {/* SÍTIOS VESTIBULARES */}

      <div className="flex h-[100px] items-start justify-center gap-0">
        {VESTIBULAR_SITES.map((key) => (
          <SiteColumn
            key={key}
            site={tooth.sites[key]}
            label={SITE_LABEL[key]}
            disabled={disabled}
            onChange={(patch) =>
              onUpdateSite(key, patch)
            }
          />
        ))}
      </div>

      {/* NÚMERO */}

      <div className="mb-1 h-4 text-center">
        <span className="text-[10px] font-bold text-blue-600">
          {tooth.number}
        </span>
      </div>

      {/* DENTE - ALTURA FIXA */}

      <div className="flex h-[82px] w-full items-center justify-center">
        <ToothSVG
          number={tooth.number}
          type={group}
          upper={upper}
          lingual={false}
          status={tooth.status}
        />
      </div>

      {/* CONTROLES */}

      <div className="mt-1 h-7">
        <ToothControls
          tooth={tooth}
          onUpdate={onUpdateTooth}
        />
      </div>

      {/* SÍTIOS LINGUAIS */}

      <div className="mt-1 flex h-[100px] items-start justify-center gap-0">
        {LINGUAL_SITES.map((key) => (
          <SiteColumn
            key={key}
            site={tooth.sites[key]}
            label={SITE_LABEL[key]}
            disabled={disabled}
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
 * ARCADA
 * ========================================================================== */

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
    <div className="w-full overflow-hidden">
      <div className="flex w-full justify-center">
        <div className="flex max-w-full gap-0 overflow-hidden">
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
                  onUpdateTooth(number, patch)
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
    </div>
  );
}

/* ============================================================================
 * LEGENDA DAS LINHAS PERIODONTAIS
 * ========================================================================== */

function PeriodontalLinesLegend() {
  return (
    <div
      className="
        flex
        flex-wrap
        items-center
        justify-center
        gap-x-6
        gap-y-2
        border-t
        border-slate-200
        px-3
        py-3
      "
    >
      <div className="flex items-center gap-2">
        <span className="h-[3px] w-7 bg-slate-900" />
        <span className="text-[10px] text-slate-600">
          Preto — anatomia / limite dental
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="h-[3px] w-7 bg-blue-600" />
        <span className="text-[10px] text-slate-600">
          Azul — margem gengival
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="h-[3px] w-7 bg-red-600" />
        <span className="text-[10px] text-slate-600">
          Vermelho — referência de sondagem
        </span>
      </div>
    </div>
  );
}

/* ============================================================================
 * LEGENDA DOS MARCADORES
 * ========================================================================== */

function MarkersLegend() {
  return (
    <div
      className="
        flex
        flex-wrap
        items-center
        justify-center
        gap-x-5
        gap-y-2
        rounded-xl
        bg-slate-50
        px-4
        py-3
      "
    >
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-full bg-red-500" />
        <span className="text-[10px] text-slate-600">
          Sangramento
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm bg-yellow-400" />
        <span className="text-[10px] text-slate-600">
          Placa
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rotate-45 rounded-sm bg-purple-400" />
        <span className="text-[10px] text-slate-600">
          Supuração
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[9px] font-bold text-blue-600">
          NI
        </span>
        <span className="text-[10px] text-slate-600">
          Nível de inserção
        </span>
      </div>
    </div>
  );
}

/* ============================================================================
 * MÉTRICA
 * ========================================================================== */

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
    >
      <div className="text-[10px] font-medium text-slate-500">
        {label}
      </div>

      <div
        className="mt-1 text-lg font-bold"
        style={{
          color: accent ?? COLORS.text,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ============================================================================
 * RESUMO
 * ========================================================================== */

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
    <div className="mt-4 flex flex-wrap gap-2">
      <Metric
        label="Profundidade média de sondagem"
        value={`${summary.avgPS.toFixed(1)} mm`}
      />

      <Metric
        label="Nível médio de inserção"
        value={`${summary.avgNI.toFixed(1)} mm`}
      />

      <Metric
        label="Sangramento à sondagem"
        value={`${summary.bopPercent.toFixed(0)}%`}
        accent={COLORS.red}
      />

      <Metric
        label="Índice de placa"
        value={`${summary.plaquePercent.toFixed(0)}%`}
        accent="#CA8A04"
      />
    </div>
  );
}

/* ============================================================================
 * COMPONENTE PRINCIPAL
 * ========================================================================== */

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
      const next = teeth.map((tooth) =>
        tooth.number === number
          ? {
              ...tooth,
              ...patch,
            }
          : tooth
      );

      commit(next);
    },
    [teeth, commit]
  );

  const updateSite = useCallback(
    (
      number: number,
      key: SiteKey,
      patch: Partial<SiteData>
    ) => {
      const next = teeth.map((tooth) =>
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
      );

      commit(next);
    },
    [teeth, commit]
  );

  return (
    <div
      data-exam-id={examId}
      data-patient-id={patientId}
      className={[
        "w-full",
        "overflow-hidden",
        "rounded-2xl",
        "border",
        "border-slate-200",
        "bg-white",
        "p-3",
        "sm:p-5",
        className ?? "",
      ].join(" ")}
    >
      {/* CABEÇALHO */}

      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">
          Periodontograma
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Registro periodontal clínico por dente e por sítio.
        </p>
      </div>

      {/* ARCADA SUPERIOR */}

      <div className="mb-2 flex items-center gap-2">
        <div className="h-px flex-1 bg-slate-200" />

        <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
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

      <div className="my-3 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />

        <span className="whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Plano oclusal
        </span>

        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* ARCADA INFERIOR */}

      <div className="mb-2 flex items-center gap-2">
        <div className="h-px flex-1 bg-slate-200" />

        <span className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
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

      {/* LEGENDA DAS LINHAS */}

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Legenda do periodontograma
          </span>
        </div>

        <PeriodontalLinesLegend />
      </div>

      {/* LEGENDA DOS MARCADORES */}

      <div className="mt-2">
        <MarkersLegend />
      </div>

      {/* RESUMO */}

      <SummaryBar teeth={teeth} />
    </div>
  );
}

export default Odontogram;

