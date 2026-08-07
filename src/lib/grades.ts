import type { Grade } from "@/types";

export interface GradeSummary {
  weightedAverage: number | null;
  weightDone: number;
  totalWeight: number;
  neededForApproval: number | null;
  status: "aprovado" | "recuperacao" | "reprovado" | "em_andamento";
}

const APPROVAL_THRESHOLD = 6;
const RECOVERY_THRESHOLD = 4;

/** Calcula média ponderada, quanto falta para aprovação e a situação da disciplina. */
export function summarizeGrades(grades: Grade[]): GradeSummary {
  const totalWeight = grades.reduce((acc, g) => acc + g.weight, 0);
  const done = grades.filter((g) => g.score !== undefined);
  const weightDone = done.reduce((acc, g) => acc + g.weight, 0);
  const weightedSum = done.reduce((acc, g) => acc + (g.score ?? 0) * g.weight, 0);

  if (weightDone === 0) {
    return { weightedAverage: null, weightDone, totalWeight, neededForApproval: null, status: "em_andamento" };
  }

  const projectedAverage = weightedSum / totalWeight;
  const remainingWeight = totalWeight - weightDone;
  const neededForApproval =
    remainingWeight > 0
      ? Math.max(0, (APPROVAL_THRESHOLD * totalWeight - weightedSum) / remainingWeight)
      : null;

  let status: GradeSummary["status"] = "em_andamento";
  if (weightDone === totalWeight) {
    if (projectedAverage >= APPROVAL_THRESHOLD) status = "aprovado";
    else if (projectedAverage >= RECOVERY_THRESHOLD) status = "recuperacao";
    else status = "reprovado";
  } else if (neededForApproval !== null && neededForApproval > 10) {
    status = "reprovado";
  } else if (neededForApproval !== null && neededForApproval > 7) {
    status = "recuperacao";
  }

  return { weightedAverage: weightedSum / weightDone, weightDone, totalWeight, neededForApproval, status };
}
