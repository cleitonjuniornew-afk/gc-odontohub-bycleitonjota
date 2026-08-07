// Layout isolado: o Modo Atendimento substitui completamente a interface
// padrão (sem sidebar/topbar) enquanto estiver ativo — "Modo Concentração".
export default function ModoAtendimentoLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
