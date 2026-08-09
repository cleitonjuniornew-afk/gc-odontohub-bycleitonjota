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

const SEVERITY = {
  healthy: "#3FB27F",
  mild: "#E0B33B",
  moderate: "#E08A3B",
  severe: "#E24C4C",
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

type ToothGroup = "incisor" | "canine" | "premolar" | "molar";

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

    const sites = [...VESTIBULAR_SITES, ...LINGUAL_SITES];

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
SVG ANATÔMICO

UM ÚNICO SVG POR DENTE.

Não depende de imagens em public/periodontia.
============================================================================ */

interface ToothSVGProps {
  type: ToothGroup;
  upper: boolean;
  lingual: boolean;
  status: ToothStatus;
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
  const transform = upper
    ? "translate(0 0)"
    : "translate(0 150) scale(1 -1)";

  return (
    <g transform={transform}>
      <path
        d="
          M34 15
          C38 10 62 10 66 15
          C69 24 68 39 66 55
          C64 65 58 70 50 71
          C42 70 36 65 34 55
          C32 39 31 24 34 15
          Z
        "
        fill="#F2E9C9"
        stroke="#9A9275"
        strokeWidth="1.6"
      />

      <path
        d="M35 58 C42 64 58 64 65 58"
        fill="none"
        stroke="#8E876E"
        strokeWidth="1.2"
      />

      <path
        d="
          M39 69
          C40 83 42 102 45 120
          C47 133 48 142 50 146
          C52 142 53 133 55 120
          C58 102 60 83 61 69
          C56 72 44 72 39 69
          Z
        "
        fill="#EEE5C2"
        stroke="#91896E"
        strokeWidth="1.6"
      />

      {lingual && (
        <>
          <path
            d="
              M39 28
              C43 23 57 23 61 28
              L59 51
              C57 56 43 56 41 51
              Z
            "
            fill="none"
            stroke="#AAA180"
            strokeWidth="1"
          />

          <path
            d="M43 54 C47 58 53 58 57 54"
            fill="none"
            stroke="#AAA180"
            strokeWidth="1"
          />
        </>
      )}

      {status === "IMPLANTE" && (
        <path
          d="M42 74 L58 74 M44 80 L56 80 M45 86 L55 86"
          stroke="#7B8EA8"
          strokeWidth="1.5"
        />
      )}
    </g>
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
  const transform = upper
    ? "translate(0 0)"
    : "translate(0 150) scale(1 -1)";

  return (
    <g transform={transform}>
      <path
        d="
          M50 7
          L45 25
          C39 27 34 34 34 47
          C34 61 41 69 50 71
          C59 69 66 61 66 47
          C66 34 61 27 55 25
          Z
        "
        fill="#F2E9C9"
        stroke="#958D71"
        strokeWidth="1.7"
      />

      <path
        d="M34 57 C42 64 58 64 66 57"
        fill="none"
        stroke="#8C846B"
        strokeWidth="1.2"
      />

      <path
        d="
          M39 69
          C40 87 42 109 45 128
          C47 140 49 145 50 148
          C51 145 53 140 55 128
          C58 109 60 87 61 69
          C56 72 44 72 39 69
          Z
        "
        fill="#EEE5C2"
        stroke="#91896E"
        strokeWidth="1.7"
      />

      {lingual && (
        <>
          <path
            d="
              M40 31
              C44 26 56 26 60 31
              L58 52
              C56 57 44 57 42 52
              Z
            "
            fill="none"
            stroke="#AAA180"
            strokeWidth="1"
          />

          <path
            d="M50 32 L50 56"
            stroke="#AAA180"
            strokeWidth="1"
          />
        </>
      )}

      {status === "IMPLANTE" && (
        <path
          d="M43 75 L57 75 M44 81 L56 81 M45 87 L55 87"
          stroke="#7B8EA8"
          strokeWidth="1.5"
        />
      )}
    </g>
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
  const transform = upper
    ? "translate(0 0)"
    : "translate(0 150) scale(1 -1)";

  return (
    <g transform={transform}>
      <path
        d="
          M25 37
          C27 27 34 19 42 18
          C46 17 48 20 50 23
          C52 20 54 17 58 18
          C66 19 73 27 75 37
          C76 49 70 62 60 68
          C55 71 45 71 40 68
          C30 62 24 49 25 37
          Z
        "
        fill="#F1E8C7"
        stroke="#958D71"
        strokeWidth="1.7"
      />

      <path
        d="
          M50 23
          C48 32 48 45 50 61
        "
        fill="none"
        stroke="#8C846B"
        strokeWidth="1.1"
      />

      <path
        d="
          M29 40
          C37 36 43 36 50 40
          C57 36 63 36 71 40
        "
        fill="none"
        stroke="#9B9276"
        strokeWidth="1"
      />

      <path
        d="M31 58 C40 64 60 64 69 58"
        fill="none"
        stroke="#8C846B"
        strokeWidth="1.2"
      />

      <path
        d="
          M38 69
          C39 85 41 104 44 121
          C46 134 48 142 50 146
          C52 142 54 134 56 121
          C59 104 61 85 62 69
          C55 72 45 72 38 69
          Z
        "
        fill="#EEE5C2"
        stroke="#91896E"
        strokeWidth="1.7"
      />

      {lingual && (
        <>
          <path
            d="
              M38 32
              C42 26 46 27 50 31
              C54 27 58 26 62 32
              L60 53
              C56 58 44 58 40 53
              Z
            "
            fill="none"
            stroke="#AAA180"
            strokeWidth="1"
          />

          <path
            d="M50 31 L50 56"
            stroke="#AAA180"
            strokeWidth="1"
          />
        </>
      )}

      {status === "IMPLANTE" && (
        <path
          d="M43 75 L57 75 M44 81 L56 81 M45 87 L55 87"
          stroke="#7B8EA8"
          strokeWidth="1.5"
        />
      )}
    </g>
  );
}

/* ============================================================================
MOLAR
============================================================================ */

function MolarSVG({
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
      <path
        d="
          M20 38
          C20 27 27 18 37 17
          C43 16 47 20 50 24
          C53 20 57 16 63 17
          C73 18 80 27 80 38
          C80 52 73 63 63 68
          C55 72 45 72 37 68
          C27 63 20 52 20 38
          Z
        "
        fill="#F1E8C7"
        stroke="#958D71"
        strokeWidth="1.7"
      />

      <path
        d="
          M50 24
          C48 31 48 37 50 45
          C52 37 52 31 50 24
        "
        fill="none"
        stroke="#888069"
        strokeWidth="1.1"
      />

      <path
        d="
          M24 40
          C33 36 41 37 50 45
          C59 37 67 36 76 40
        "
        fill="none"
        stroke="#8C846B"
        strokeWidth="1.1"
      />

      <path
        d="
          M30 29
          C35 25 41 27 45 33
          M55 33
          C59 27 65 25 70 29
        "
        fill="none"
        stroke="#9D9478"
        strokeWidth="1"
      />

      <path
        d="M25 58 C36 64 64 64 75 58"
        fill="none"
        stroke="#8C846B"
        strokeWidth="1.2"
      />

      {/* RAIZ MESIAL */}
      <path
        d="
          M29 68
          C30 84 31 103 28 120
          C26 132 27 142 32 148
          C37 140 40 130 42 116
          L46 71
          C40 72 34 71 29 68
          Z
        "
        fill="#EEE5C2"
        stroke="#91896E"
        strokeWidth="1.7"
      />

      {/* RAIZ DISTAL */}
      <path
        d="
          M54 71
          L58 116
          C60 130 63 140 68 148
          C73 142 74 132 72 120
          C69 103 70 84 71 68
          C66 71 60 72 54 71
          Z
        "
        fill="#EEE5C2"
        stroke="#91896E"
        strokeWidth="1.7"
      />

      {lingual && (
        <>
          <path
            d="
              M28 33
              C34 25 43 26 50 33
              C57 26 66 25 72 33
              L69 53
              C63 59 37 59 31 53
              Z
            "
            fill="none"
            stroke="#AAA180"
            strokeWidth="1"
          />

          <path
            d="M50 33 L50 57"
            stroke="#AAA180"
            strokeWidth="1"
          />
        </>
      )}

      {status === "IMPLANTE" && (
        <>
          <path
            d="M31 75 L43 75 M30 81 L42 81 M30 87 L41 87"
            stroke="#7B8EA8"
            strokeWidth="1.5"
          />
          <path
            d="M57 75 L69 75 M58 81 L70 81 M59 87 L70 87"
            stroke="#7B8EA8"
            strokeWidth="1.5"
          />
        </>
      )}
    </g>
  );
}

/* ============================================================================
COMPONENTE SVG PRINCIPAL
============================================================================ */

function ToothSVG({
  type,
  upper,
  lingual,
  status,
}: ToothSVGProps) {
  if (status === "AUSENTE") {
    return (
      <svg
        viewBox="0 0 100 150"
        width="58"
        height="88"
        aria-hidden="true"
      >
        <line
          x1="25"
          y1="45"
          x2="75"
          y2="105"
          stroke="#64748B"
          strokeWidth="2"
        />
        <line
          x1="75"
          y1="45"
          x2="25"
          y2="105"
          stroke="#64748B"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 150"
      width="58"
      height="88"
      preserveAspectRatio="xMidYMid meet"
      className="select-none"
      aria-hidden="true"
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
      className={[
        "w-9 h-6",
        "text-[10px]",
        "text-center",
        "rounded-md",
        "bg-[#0B1220]",
        "border",
        "text-slate-100",
        "focus:outline-none",
        "focus:ring-1",
        "focus:ring-amber-400/70",
        "[appearance:textfield]",
        "[&::-webkit-outer-spin-button]:appearance-none",
        "[&::-webkit-inner-spin-button]:appearance-none",
      ].join(" ")}
      style={{
        borderColor: colorHint ?? "#334155",
        color: colorHint ?? undefined,
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
        "gap-1",
        disabled
          ? "opacity-30 pointer-events-none"
          : "",
      ].join(" ")}
    >
      <span className="text-[8px] font-semibold text-slate-500">
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
        onClick={() =>
          onChange({
            bop: !site.bop,
          })
        }
        className={[
          "w-3 h-3",
          "rounded-full",
          "border",
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
        onClick={() =>
          onChange({
            plaque: !site.plaque,
          })
        }
        className={[
          "w-3 h-3",
          "rounded-sm",
          "border",
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
        onClick={() =>
          onChange({
            suppuration: !site.suppuration,
          })
        }
        className={[
          "w-3 h-3",
          "rotate-45",
          "border",
          site.suppuration
            ? "bg-[#C9A5E8] border-[#C9A5E8]"
            : "bg-transparent border-slate-600",
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
  onUpdate: (patch: Partial<ToothData>) => void;
}) {
  const group = getToothGroup(tooth.number);

  return (
    <div className="flex flex-col items-center gap-2">
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
          text-[8px]
          bg-[#0B1220]
          border border-slate-700
          rounded-md
          text-slate-200
          px-1
          py-1
          w-16
        "
      >
        <option value="PRESENTE">Pres.</option>
        <option value="AUSENTE">Aus.</option>
        <option value="IMPLANTE">Impl.</option>
      </select>

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
              onClick={() =>
                onUpdate({
                  mobility: grade,
                })
              }
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
                text-[7px]
                bg-[#0B1220]
                border border-slate-700
                rounded
                text-slate-300
                w-7
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

            <span className="text-[7px] text-slate-600">
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
                text-[7px]
                bg-[#0B1220]
                border border-slate-700
                rounded
                text-slate-300
                w-7
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
        min-w-[76px]
        shrink-0
      "
    >
      {/* SÍTIOS VESTIBULARES */}

      <div className="flex items-start justify-center gap-1">
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
          flex
          items-center
          justify-center
          h-[104px]
          w-[72px]
          my-2
        "
      >
        <ToothSVG
          type={group}
          upper={upper}
          lingual={false}
          status={tooth.status}
        />

        <span
          className="
            absolute
            bottom-[-1px]
            text-[10px]
            font-bold
            text-blue-400
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

      <div className="flex items-start justify-center gap-1 mt-2">
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
        pb-3
        scrollbar-thin
        scrollbar-thumb-slate-700
      "
    >
      <div
        className="
          flex
          justify-center
          min-w-max
          px-2
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
        border border-slate-800
        bg-[#08111F]
        px-4
        py-3
      "
    >
      <div className="text-[10px] text-slate-500">
        {label}
      </div>

      <div
        className="text-lg font-semibold mt-1"
        style={{
          color: accent ?? "#F1F5F9",
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
    <div
      className="
        mt-6
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-4
        gap-3
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
        accent="#E24C4C"
      />

      <Metric
        label="Índice de placa (IP)"
        value={`${summary.plaquePercent.toFixed(0)}%`}
        accent="#E0B33B"
      />
    </div>
  );
}

/* ============================================================================
COMPONENTE PRINCIPAL

EXPORT NOMEADO + DEFAULT
Isso evita o erro:
"Odontogram is not exported"
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
        "border border-slate-800/70",
        "bg-gradient-to-b",
        "from-[#050B14]",
        "to-[#080F1C]",
        "p-4 sm:p-6",
        className ?? "",
      ].join(" ")}
    >
      {/* CABEÇALHO */}

      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-100">
          Periodontograma
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          Registro periodontal clínico por dente
          e por sítio.
        </p>
      </div>

      {/* ARCADA SUPERIOR */}

      <div className="space-y-3">
        <div
          className="
            flex
            items-center
            gap-2
            px-4
          "
        >
          <div className="h-px flex-1 bg-slate-700/40" />

          <span
            className="
              text-[10px]
              tracking-widest
              text-slate-600
              uppercase
              whitespace-nowrap
            "
          >
            arcada superior
          </span>

          <div className="h-px flex-1 bg-slate-700/40" />
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
            px-4
            py-4
          "
        >
          <div className="h-px flex-1 bg-slate-700/40" />

          <span
            className="
              text-[9px]
              tracking-[0.25em]
              text-slate-600
              uppercase
              whitespace-nowrap
            "
          >
            plano oclusal
          </span>

          <div className="h-px flex-1 bg-slate-700/40" />
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
          <div className="h-px flex-1 bg-slate-700/40" />

          <span
            className="
              text-[10px]
              tracking-widest
              text-slate-600
              uppercase
              whitespace-nowrap
            "
          >
            arcada inferior
          </span>

          <div className="h-px flex-1 bg-slate-700/40" />
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

      <div
        className="
          mt-5
          flex
          flex-wrap
          items-center
          justify-center
          gap-x-5
          gap-y-2
          rounded-xl
          border border-slate-800
          bg-[#07101C]
          px-4
          py-3
        "
      >
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#E24C4C]" />
          <span className="text-[10px] text-slate-500">
            Sangramento
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-[#E0B33B]" />
          <span className="text-[10px] text-slate-500">
            Placa
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rotate-45 rounded-sm bg-[#C9A5E8]" />
          <span className="text-[10px] text-slate-500">
            Supuração
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-blue-400">
            NI
          </span>
          <span className="text-[10px] text-slate-500">
            Nível de inserção
          </span>
        </div>
      </div>

      {/* RESUMO */}

      <SummaryBar teeth={teeth} />
    </div>
  );
}

export default Odontogram;
