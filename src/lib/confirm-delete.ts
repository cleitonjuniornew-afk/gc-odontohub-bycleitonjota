import { toast } from "sonner";

/**
 * Feedback padrão para exclusões em todo o sistema: nunca apaga
 * silenciosamente. Mostra um toast com botão "Desfazer" por alguns segundos
 * antes de confirmar a remoção definitiva (soft delete no banco).
 */
export function notifyDeletion(itemLabel: string, onUndo: () => void) {
  toast(`${itemLabel} removido.`, {
    action: {
      label: "Desfazer",
      onClick: onUndo,
    },
    duration: 6000,
  });
}
