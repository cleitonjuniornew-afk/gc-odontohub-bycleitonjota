"use client";

import React, { useMemo, useState } from "react";

export interface OdontogramProps {
  examId?: string;
  patientId?: string;
  className?: string;
}

type ToothStatus = "PRESENTE" | "AUSENTE" | "IMPLANTE";

type Tooth = {
  number: number;
  status: ToothStatus;
};

const UPPER_LEFT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_RIGHT = [21, 22, 23, 24, 25, 26, 27, 28];

const LOWER_LEFT = [48, 47, 46, 45, 44, 43, 42, 41];
const LOWER_RIGHT = [31, 32, 33, 34, 35, 36, 37, 38];

function createTeeth(): Tooth[] {
  return [
    ...UPPER_LEFT,
    ...UPPER_RIGHT,
    ...LOWER_LEFT,
    ...LOWER_RIGHT,
  ].map((number) => ({
    number,
    status: "PRESENTE",
  }));
}

function toothType(number: number) {
  const last = number % 10;

  if (last === 1 || last === 2) return "incisor";
  if (last === 3) return "canine";
  if (last === 4 || last === 5) return "premolar";
  return "molar";
}

function ToothShape({
  number,
  status,
  selected,
  upper,
  onClick,
}: {
  number: number;
  status: ToothStatus;
  selected: boolean;
  upper: boolean;
  onClick: () => void;
}) {
  const type = toothType(number);

  const width =
    type === "incisor"
      ? 30
      : type === "canine"
        ? 32
        : type === "premolar"
          ? 36
          : 40;

  const height =
    type === "incisor"
      ? 54
      : type === "canine"
        ? 58
        : type === "premolar"
          ? 61
          : 64;

  const centerX = width / 2;

  const fill =
    status === "AUSENTE"
      ? "rgba(100,116,139,0.08)"
      : status === "IMPLANTE"
        ? "rgba(148,163,184,0.35)"
        : selected
          ? "#F8FAFC"
          : "#E8EDF2";

  const stroke = selected ? "#38BDF8" : "#94A3B8";

  const crownPath =
    type === "incisor"
      ? `
        M ${centerX - width * 0.30} ${height * 0.18}
        Q ${centerX} ${height * 0.03} ${centerX + width * 0.30} ${height * 0.18}
        L ${centerX + width * 0.36} ${height * 0.62}
        Q ${centerX} ${height * 0.82} ${centerX - width * 0.36} ${height * 0.62}
        Z
      `
      : type === "canine"
        ? `
          M ${centerX - width * 0.32} ${height * 0.20}
          Q ${centerX} ${height * 0.02} ${centerX + width * 0.32} ${height * 0.20}
          L ${centerX + width * 0.37} ${height * 0.62}
          Q ${centerX} ${height * 0.82} ${centerX - width * 0.37} ${height * 0.62}
          Z
        `
        : `
          M ${centerX - width * 0.38} ${height * 0.18}
          Q ${centerX - width * 0.18} ${height * 0.02} ${centerX} ${height * 0.15}
          Q ${centerX + width * 0.18} ${height * 0.02} ${centerX + width * 0.38} ${height * 0.18}
          L ${centerX + width * 0.39} ${height * 0.62}
          Q ${centerX} ${height * 0.84} ${centerX - width * 0.39} ${height * 0.62}
          Z
        `;

  const rootY = upper ? height * 0.62 : height * 0.38;
  const rootDirection = upper ? 1 : -1;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Dente ${number}`}
      className="group relative flex shrink-0 flex-col items-center justify-center bg-transparent p-0 outline-none"
      style={{
        width: width + 10,
        height: height + 34,
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible transition-transform duration-200 group-hover:scale-105"
      >
        <defs>
          <linearGradient
            id={`tooth-${number}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor={fill} />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>
          <filter id={`shadow-${number}`}>
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="1.5"
              floodColor="#020617"
              floodOpacity="0.55"
            />
          </filter>
        </defs>

        <path
          d={crownPath}
          fill={
            status === "PRESENTE"
              ? `url(#tooth-${number})`
              : fill
          }
          stroke={stroke}
          strokeWidth={selected ? 2 : 1}
          filter={`url(#shadow-${number})`}
        />

        {status === "PRESENTE" && (
          <>
            <ellipse
              cx={centerX}
              cy={height * 0.39}
              rx={width * 0.22}
              ry={height * 0.12}
              fill="rgba(148,163,184,0.16)"
            />

            <path
              d={`M ${centerX - width * 0.20} ${height * 0.45}
                  Q ${centerX} ${height * 0.54}
                  ${centerX + width * 0.20} ${height * 0.45}`}
              fill="none"
              stroke="rgba(100,116,139,0.45)"
              strokeWidth="1"
            />

            <path
              d={`M ${centerX} ${rootY}
                  L ${centerX - width * 0.12} ${rootY + rootDirection * height * 0.30}
                  Q ${centerX} ${rootY + rootDirection * height * 0.38}
                  ${centerX + width * 0.12} ${rootY + rootDirection * height * 0.30}
                  Z`}
              fill="#D8DEE5"
              stroke="#94A3B8"
              strokeWidth="0.7"
            />

            {type === "molar" && (
              <>
                <circle
                  cx={centerX - width * 0.17}
                  cy={height * 0.34}
                  r={2.2}
                  fill="rgba(100,116,139,0.35)"
                />
                <circle
                  cx={centerX + width * 0.17}
                  cy={height * 0.34}
                  r={2.2}
                  fill="rgba(100,116,139,0.35)"
                />
              </>
            )}
          </>
        )}

        {status === "AUSENTE" && (
          <path
            d={`M ${width * 0.18} ${height * 0.20}
                L ${width * 0.82} ${height * 0.72}
                M ${width * 0.82} ${height * 0.20}
                L ${width * 0.18} ${height * 0.72}`}
            stroke="#64748B"
            strokeWidth="2"
          />
        )}

        {status === "IMPLANTE" && (
          <>
            <rect
              x={centerX - width * 0.14}
              y={height * 0.28}
              width={width * 0.28}
              height={height * 0.40}
              rx="2"
              fill="#94A3B8"
            />
            <path
              d={`M ${centerX - width * 0.13} ${height * 0.35}
                  H ${centerX + width * 0.13}
                  M ${centerX - width * 0.13} ${height * 0.45}
                  H ${centerX + width * 0.13}
                  M ${centerX - width * 0.13} ${height * 0.55}
                  H ${centerX + width * 0.13}`}
              stroke="#334155"
              strokeWidth="1"
            />
          </>
        )}
      </svg>

      <span
        className={`absolute bottom-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
          selected
            ? "bg-sky-400/15 text-sky-300"
            : "text-slate-500"
        }`}
      >
        {number}
      </span>
    </button>
  );
}

function ArchRow({
  teeth,
  upper,
  selectedTooth,
  onSelect,
}: {
  teeth: Tooth[];
  upper: boolean;
  selectedTooth: number | null;
  onSelect: (number: number) => void;
}) {
  return (
    <div
      className={`relative flex items-center justify-center ${
        upper ? "pb-5" : "pt-5"
      }`}
    >
      <div
        className={`absolute left-[8%] right-[8%] ${
          upper ? "top-[42%]" : "bottom-[42%]"
        } h-20 rounded-[50%] border border-rose-400/20 bg-gradient-to-${
          upper ? "b" : "t"
        } from-rose-950/50 via-rose-900/20 to-transparent`}
      />

      <div className="relative z-10 flex items-center justify-center">
        <div className="flex items-center gap-[1px]">
          {teeth.map((tooth) => (
            <ToothShape
              key={tooth.number}
              number={tooth.number}
              status={tooth.status}
              upper={upper}
              selected={selectedTooth === tooth.number}
              onClick={() => onSelect(tooth.number)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SiteLegend() {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-800/70 pt-4 text-[10px] text-slate-500">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full border border-red-400 bg-red-400/70" />
        Sangramento
      </div>

      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-sm border border-amber-400 bg-amber-400/70" />
        Placa
      </div>

      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rotate-45 border border-purple-300 bg-purple-300/60" />
        Supuração
      </div>

      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded border border-sky-400 bg-sky-400/30" />
        Dente selecionado
      </div>
    </div>
  );
}

export function Odontogram({
  examId,
  patientId,
  className,
}: OdontogramProps) {
  const [teeth] = useState<Tooth[]>(createTeeth);
  const [selectedTooth, setSelectedTooth] =
    useState<number | null>(null);

  const selected = useMemo(
    () =>
      teeth.find(
        (tooth) => tooth.number === selectedTooth
      ),
    [teeth, selectedTooth]
  );

  return (
    <div
      className={[
        "w-full overflow-hidden rounded-3xl",
        "border border-slate-800/80",
        "bg-[#050A13]",
        className ?? "",
      ].join(" ")}
      data-exam-id={examId}
      data-patient-id={patientId}
    >
      <div className="border-b border-slate-800/70 bg-[#07101D] px-5 py-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Odontograma periodontal
            </h3>

            <p className="text-[11px] text-slate-500">
              Selecione um dente para avaliação clínica.
            </p>
          </div>

          {selected && (
            <div className="rounded-lg border border-sky-400/20 bg-sky-400/5 px-3 py-1.5 text-[11px] text-sky-300">
              Dente {selected.number} selecionado
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto px-2 py-8 sm:px-5">
        <div className="mx-auto min-w-[920px] max-w-[1250px]">
          <div className="mb-2 text-center text-[9px] font-medium uppercase tracking-[0.3em] text-slate-600">
            Arcada superior
          </div>

          <ArchRow
            teeth={[
              ...UPPER_LEFT,
              ...UPPER_RIGHT,
            ].map((number) => ({
              number,
              status:
                teeth.find(
                  (tooth) =>
                    tooth.number === number
                )?.status ?? "PRESENTE",
            }))}
            upper
            selectedTooth={selectedTooth}
            onSelect={setSelectedTooth}
          />

          <div className="my-5 flex items-center gap-4 px-12">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

            <div className="rounded-full border border-slate-800 bg-[#080F1A] px-4 py-1.5 text-[8px] uppercase tracking-[0.28em] text-slate-600">
              plano oclusal
            </div>

            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          </div>

          <div className="mb-2 text-center text-[9px] font-medium uppercase tracking-[0.3em] text-slate-600">
            Arcada inferior
          </div>

          <ArchRow
            teeth={[
              ...LOWER_LEFT,
              ...LOWER_RIGHT,
            ].map((number) => ({
              number,
              status:
                teeth.find(
                  (tooth) =>
                    tooth.number === number
                )?.status ?? "PRESENTE",
            }))}
            upper={false}
            selectedTooth={selectedTooth}
            onSelect={setSelectedTooth}
          />

          <div className="mt-2 text-center text-[9px] text-slate-700">
            Vista clínica • Dentição permanente • Numeração FDI
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800/70 bg-[#07101D] px-5 py-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-[#050A13] p-3">
            <p className="text-[9px] uppercase tracking-wider text-slate-600">
              Profundidade de sondagem
            </p>
            <p className="mt-1 text-base font-semibold text-slate-200">
              0.0 mm
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#050A13] p-3">
            <p className="text-[9px] uppercase tracking-wider text-slate-600">
              Nível de inserção
            </p>
            <p className="mt-1 text-base font-semibold text-slate-200">
              0.0 mm
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#050A13] p-3">
            <p className="text-[9px] uppercase tracking-wider text-slate-600">
              Sangramento
            </p>
            <p className="mt-1 text-base font-semibold text-red-400">
              0%
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#050A13] p-3">
            <p className="text-[9px] uppercase tracking-wider text-slate-600">
              Índice de placa
            </p>
            <p className="mt-1 text-base font-semibold text-amber-400">
              0%
            </p>
          </div>
        </div>

        <SiteLegend />
      </div>
    </div>
  );
}

export default Odontogram;
