async getBySlug(slug: string): Promise<DisciplineServer | null> {

  console.log("BUSCANDO DISCIPLINA:", slug);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("disciplinas")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  console.log("RESULTADO SUPABASE:", data);
  console.log("ERRO SUPABASE:", error);

  if (error) {
    throw error;
  }

  return data ? fromRow(data) : null;
},
