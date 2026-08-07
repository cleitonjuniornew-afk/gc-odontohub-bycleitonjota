import { AlertTriangle } from "lucide-react";

/** Aviso amigável exibido quando as credenciais reais do Supabase ainda não
 * foram configuradas no .env — evita erros técnicos para quem está apenas
 * explorando o MVP com dados mockados. */
export function SupabaseNotice() {
  return (
    <div className="mb-5 flex items-start gap-2.5 rounded-[var(--radius-input)] border border-warning/30 bg-warning/10 px-3.5 py-3 text-xs text-warning">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        Conecte um projeto Supabase em <code className="rounded bg-black/20 px-1">.env</code> para ativar
        login, cadastro e persistência real de dados.
      </span>
    </div>
  );
}
