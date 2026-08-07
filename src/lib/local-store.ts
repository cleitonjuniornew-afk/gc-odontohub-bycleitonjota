/**
 * Store em memória usado como fallback quando o Supabase ainda não está
 * configurado (`.env` sem credenciais reais) — mantém o MVP inteiramente
 * navegável e funcional em modo de demonstração, com a mesma API pública
 * (list/create/update/softDelete/restore) do repository real do Supabase.
 * Isso permite trocar de um para o outro sem alterar nenhum componente.
 */
export function createLocalStore<Row extends { id: string; deletedAt?: string | null }>(seed: Row[]) {
  let rows: Row[] = [...seed];
  const delay = () => new Promise((r) => setTimeout(r, 150));

  return {
    async list(): Promise<Row[]> {
      await delay();
      return rows.filter((r) => !r.deletedAt);
    },
    async create(payload: Omit<Row, "id">): Promise<Row> {
      await delay();
      const row = { ...payload, id: crypto.randomUUID() } as Row;
      rows = [row, ...rows];
      return row;
    },
    async update(id: string, payload: Partial<Row>): Promise<Row> {
      await delay();
      rows = rows.map((r) => (r.id === id ? { ...r, ...payload } : r));
      return rows.find((r) => r.id === id)!;
    },
    async softDelete(id: string): Promise<void> {
      await delay();
      rows = rows.map((r) => (r.id === id ? { ...r, deletedAt: new Date().toISOString() } : r));
    },
    async restore(id: string): Promise<void> {
      await delay();
      rows = rows.map((r) => (r.id === id ? { ...r, deletedAt: null } : r));
    },
  };
}
