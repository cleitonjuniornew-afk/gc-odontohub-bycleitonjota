"use client";

import React, { useMemo, useState } from "react";

type ToothKind = "incisor" | "canine" | "premolar" | "molar";
type Arch = "upper" | "lower";

interface Tooth {
  number: number;
  kind: ToothKind;
  arch: Arch;
  x: number;
  y: number;
  rotation: number;
  ps: [number | null, number | null, number | null];
  mg: [number | null, number | null, number | null];
  bop: [boolean, boolean, boolean];
}

interface OdontogramProps {
  examId?: string;
  patientId?: string;
  className?: string;
}

const UPPER = [
  18, 17, 16, 15, 14, 13, 12, 11,
  21, 22, 23, 24, 25, 26, 27, 28,
];

const LOWER = [
  48, 47, 46, 45, 44, 43, 42, 41,
  31, 32, 33, 34, 35, 36, 37, 38,
];

function getKind(number: number): ToothKind {
  const last = number % 10;

  if (last === 1 || last === 2) return "incisor";
  if (last === 3) return "canine";
  if (last === 4 || last === 5) return "premolar";

  return "molar";
}

function createTooth(
  number: number,
  arch: Arch,
  index: number
): Tooth {
  const center = 7.5;
  const distance = index - center;

  return {
    number,
    kind: getKind(number),
    arch,
    x: 10 + index * 5.35,
    y:
      arch === "upper"
        ? 42 - Math.abs(distance) * 0.55
        : 58 + Math.abs(distance) * 0.55,
    rotation:
      arch === "upper"
        ? distance * 1.8
        : distance * -1.8,
    ps: [null, null, null],
    mg: [null, null, null],
    bop: [false, false, false],
  };
}

function createTeeth(): Tooth[] {
  return [
    ...UPPER.map((number, index) =>
      createTooth(number, "upper", index)
    ),
    ...LOWER.map((number, index) =>
      createTooth(number, "lower", index)
    ),
  ];
}

function ToothSvg({
  tooth,
  selected,
  onClick,
}: {
  tooth: Tooth;
  selected: boolean;
  onClick: () => void;
}) {
  const upper = tooth.arch === "upper";

  const crownY = upper ? 35 : 55;

  const crownWidth =
    tooth.kind === "molar"
      ? 4.5
      : tooth.kind === "premolar"
        ? 3.8
        : tooth.kind === "canine"
          ? 3
          : 2.7;

  const crownHeight =
    tooth.kind === "molar"
      ? 6
      : tooth.kind === "premolar"
        ? 5.5
        : 5;

  const rootEnd = upper ? 25 : 75;

  let crown = "";

  if (tooth.kind === "molar") {
    crown = `
      M ${50 - crownWidth} ${crownY + 1}
      Q 50 ${crownY - 1} ${50 + crownWidth} ${crownY + 1}
      L ${50 + crownWidth - 0.4} ${crownY + crownHeight}
      Q 50 ${crownY + crownHeight + 1}
        ${50 - crownWidth + 0.4} ${crownY + crownHeight}
      Z
    `;
  } else if (tooth.kind === "premolar") {
    crown = `
      M ${50 - crownWidth} ${crownY + 1}
      Q 48 ${crownY - 1} 50 ${crownY}
      Q 52 ${crownY - 1} ${50 + crownWidth} ${crownY + 1}
      L ${50 + crownWidth - 0.4} ${crownY + crownHeight}
      Q 50 ${crownY + crownHeight + 1}
        ${50 - crownWidth + 0.4} ${crownY + crownHeight}
      Z
    `;
  } else if (tooth.kind === "canine") {
    crown = `
      M ${50 - crownWidth} ${crownY + 1}
      L 50 ${crownY - 2}
      L ${50 + crownWidth} ${crownY + 1}
      L ${50 + crownWidth - 0.3} ${crownY + crownHeight}
      Q 50 ${crownY + crownHeight + 1}
        ${50 - crownWidth + 0.3} ${crownY + crownHeight}
      Z
    `;
  } else {
    crown = `
      M ${50 - crownWidth} ${crownY}
      Q 50 ${crownY - 0.8} ${50 + crownWidth} ${crownY}
      L ${50 + crownWidth} ${crownY + crownHeight}
      L ${50 - crownWidth} ${crownY + crownHeight}
      Z
    `;
  }

  const rootPath = (
    offset: number,
    index: number
  ) => {
    const startY = upper
      ? crownY + crownHeight
      : crownY;

    if (upper) {
      return `
        M ${50 + offset} ${startY}
        Q ${50 + offset * 1.2} ${
          startY + 3
        } ${50 + offset} ${rootEnd}
        Q ${50 + offset} ${
          rootEnd + 1
        } ${50 + offset * 0.4} ${startY}
      `;
    }

    return `
      M ${50 + offset} ${startY}
      Q ${50 + offset * 1.2} ${
        startY - 3
      } ${50 + offset} ${rootEnd}
      Q ${50 + offset} ${
        rootEnd - 1
      } ${50 + offset * 0.4} ${startY}
    `;
  };

  let rootOffsets: number[];

  if (tooth.kind === "molar") {
    rootOffsets = upper
      ? [-2.2, 0, 2.2]
      : [-1.8, 1.8];
  } else {
    rootOffsets = [0];
  }

  return (
    <g
      transform={`translate(${tooth.x} ${tooth.y}) rotate(${tooth.rotation} 50 50)`}
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <g
        fill={
          selected
            ? "#E8F4FF"
            : "#F8FAFC"
        }
        stroke={
          selected
            ? "#38BDF8"
            : "#CBD5E1"
        }
        strokeWidth={
          selected ? "1" : "0.7"
        }
      >
        <path d={crown} />

        {rootOffsets.map(
          (offset, index) => (
            <path
              key={index}
              d={rootPath(
                offset,
                index
              )}
              fill="none"
            />
          )
        )}
      </g>

      <g
        fill="none"
        stroke={
          selected
            ? "#38BDF8"
            : "#64748B"
        }
        strokeWidth="0.45"
        strokeLinecap="round"
      >
        {tooth.kind === "molar" && (
          <>
            <path
              d={`
                M 47 ${crownY + 2}
                Q 50 ${crownY + 5}
                53 ${crownY + 2}
              `}
            />
            <path
              d={`
                M 50 ${crownY}
                L 50 ${crownY + crownHeight}
              `}
            />
            <path
              d={`
                M 47.5 ${crownY + 4}
                L 52.5 ${crownY + 4}
              `}
            />
          </>
        )}

        {tooth.kind === "premolar" && (
          <>
            <path
              d={`
                M 48 ${crownY + 1}
                L 50 ${crownY + 4}
                L 52 ${crownY + 1}
              `}
            />
            <path
              d={`
                M 50 ${crownY + 4}
                L 50 ${crownY + crownHeight}
              `}
            />
          </>
        )}

        {tooth.kind === "canine" && (
          <path
            d={`
              M 50 ${crownY - 1}
              L 50 ${crownY + crownHeight}
            `}
          />
        )}

        {tooth.kind === "incisor" && (
          <path
            d={`
              M 50 ${crownY + 1}
              L 50 ${
                crownY +
                crownHeight -
                0.5
              }
            `}
          />
        )}
      </g>

      <text
        x="50"
        y={upper ? 19 : 86}
        textAnchor="middle"
        fontSize="3.8"
        fontWeight="600"
        fill="#CBD5E1"
      >
        {tooth.number}
      </text>
    </g>
  );
}

function PeriodontalSites({
  tooth,
  selected,
  onToggle,
}: {
  tooth: Tooth;
  selected: boolean;
  onToggle: (
    index: number
  ) => void;
}) {
  const upper =
    tooth.arch === "upper";

  const y = upper
    ? tooth.y - 5
    : tooth.y + 5;

  return (
    <g>
      {[0, 1, 2].map(
        (index) => {
          const x =
            tooth.x +
            (index - 1) * 1.8;

          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={
                tooth.bop[index]
                  ? 0.9
                  : 0.6
              }
              fill={
                tooth.bop[index]
                  ? "#EF4444"
                  : selected
                    ? "#38BDF8"
                    : "#64748B"
              }
              onClick={(event) => {
                event.stopPropagation();
                onToggle(index);
              }}
              style={{
                cursor: "pointer",
              }}
            />
          );
        }
      )}
    </g>
  );
}

export default function Odontogram({
  examId,
  patientId,
  className = "",
}: OdontogramProps) {
  const [teeth, setTeeth] =
    useState<Tooth[]>(
      createTeeth
    );

  const [selected, setSelected] =
    useState<number | null>(
      null
    );

  const selectedTooth =
    useMemo(
      () =>
        teeth.find(
          (tooth) =>
            tooth.number ===
            selected
        ) ?? null,
      [teeth, selected]
    );

  function toggleBop(
    number: number,
    index: number
  ) {
    setTeeth(
      (current) =>
        current.map(
          (tooth) => {
            if (
              tooth.number !==
              number
            ) {
              return tooth;
            }

            const bop = [
              ...tooth.bop,
            ] as [
              boolean,
              boolean,
              boolean
            ];

            bop[index] =
              !bop[index];

            return {
              ...tooth,
              bop,
            };
          }
        )
    );
  }

  return (
    <div
      className={[
        "w-full",
        "overflow-hidden",
        "rounded-2xl",
        "border",
        "border-slate-800",
        "bg-[#050B14]",
        className,
      ].join(" ")}
      data-exam-id={examId}
      data-patient-id={patientId}
    >
      <div className="border-b border-slate-800 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Odontograma periodontal
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Arcadas anatômicas · 32 dentes · seis sítios periodontais
            </p>
          </div>

          {selectedTooth && (
            <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs text-sky-300">
              Dente{" "}
              {selectedTooth.number}
            </div>
          )}
        </div>
      </div>

      <div className="w-full overflow-x-auto p-3 sm:p-5">
        <div className="mx-auto min-w-[760px] max-w-[1150px]">
          <svg
            viewBox="0 0 100 100"
            className="block w-full"
            role="img"
            aria-label="Odontograma periodontal"
          >
            <defs>
              <linearGradient
                id="upperGum"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#8B3A4E"
                />
                <stop
                  offset="100%"
                  stopColor="#4A1D2A"
                />
              </linearGradient>

              <linearGradient
                id="lowerGum"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#4A1D2A"
                />
                <stop
                  offset="100%"
                  stopColor="#8B3A4E"
                />
              </linearGradient>
            </defs>

            <path
              d="M 6 38 Q 50 7 94 38"
              fill="none"
              stroke="url(#upperGum)"
              strokeWidth="7"
              strokeLinecap="round"
              opacity="0.8"
            />

            <path
              d="M 6 62 Q 50 93 94 62"
              fill="none"
              stroke="url(#lowerGum)"
              strokeWidth="7"
              strokeLinecap="round"
              opacity="0.8"
            />

            <path
              d="M 9 38 Q 50 11 91 38"
              fill="none"
              stroke="#B85B70"
              strokeWidth="0.65"
              opacity="0.6"
            />

            <path
              d="M 9 62 Q 50 89 91 62"
              fill="none"
              stroke="#B85B70"
              strokeWidth="0.65"
              opacity="0.6"
            />

            <text
              x="50"
              y="9"
              textAnchor="middle"
              fontSize="3"
              letterSpacing="1.5"
              fill="#64748B"
            >
              ARCADA SUPERIOR
            </text>

            <text
              x="50"
              y="94"
              textAnchor="middle"
              fontSize="3"
              letterSpacing="1.5"
              fill="#64748B"
            >
              ARCADA INFERIOR
            </text>

            {teeth.map(
              (tooth) => (
                <React.Fragment
                  key={
                    tooth.number
                  }
                >
                  <PeriodontalSites
                    tooth={tooth}
                    selected={
                      selected ===
                      tooth.number
                    }
                    onToggle={(
                      index
                    ) =>
                      toggleBop(
                        tooth.number,
                        index
                      )
                    }
                  />

                  <ToothSvg
                    tooth={tooth}
                    selected={
                      selected ===
                      tooth.number
                    }
                    onClick={() =>
                      setSelected(
                        tooth.number
                      )
                    }
                  />
                </React.Fragment>
              )
            )}

            <path
              d="M 18 50 H 82"
              stroke="#334155"
              strokeWidth="0.4"
              strokeDasharray="1.5 1.5"
              opacity="0.6"
            />

            <text
              x="50"
              y="50"
              textAnchor="middle"
              fontSize="2.5"
              letterSpacing="1"
              fill="#475569"
            >
              PLANO OCLUSAL
            </text>
          </svg>
        </div>
      </div>

      <div className="grid border-t border-slate-800 sm:grid-cols-4">
        <div className="border-b border-slate-800 p-3 sm:border-b-0 sm:border-r">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Dente
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-200">
            {selectedTooth
              ? selectedTooth.number
              : "Nenhum selecionado"}
          </p>
        </div>

        <div className="border-b border-slate-800 p-3 sm:border-b-0 sm:border-r">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Vestibular
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-200">
            MV · V · DV
          </p>
        </div>

        <div className="border-b border-slate-800 p-3 sm:border-b-0 sm:border-r">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Lingual / palatino
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-200">
            ML · L · DL
          </p>
        </div>

        <div className="p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Sangramento
          </p>

          <p className="mt-1 text-sm font-semibold text-red-400">
            Clique nos pontos
          </p>
        </div>
      </div>
    </div>
  );
}
