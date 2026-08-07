import { FRASES, type Frase } from "@/constants/phrases";

/**
 * Seleciona a frase do dia de forma determinística (mesmo dia = mesma frase
 * para todos os usuários da conta compartilhada) e sem repetir a frase do
 * dia anterior, percorrendo a lista completa antes de reiniciar o ciclo.
 */
export function getDailyPhrase(date: Date = new Date()): Frase {
  const epoch = new Date(2026, 0, 1).getTime();
  const dayIndex = Math.floor((date.getTime() - epoch) / 86_400_000);
  const index = ((dayIndex % FRASES.length) + FRASES.length) % FRASES.length;
  return FRASES[index];
}
