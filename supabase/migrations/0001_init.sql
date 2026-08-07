-- ==========================================================
-- GC OdontoHub — Migration inicial (Supabase / PostgreSQL)
-- Execute no SQL Editor do seu projeto Supabase (ou via `supabase db push`).
-- Tudo protegido por Row Level Security: cada linha pertence a um user_id
-- (auth.uid()) e, quando existir dupla_id, também é visível aos membros da
-- mesma dupla — preparando o "Modo Dupla" sem exigir reescrita futura.
-- ==========================================================

create extension if not exists "pgcrypto";

-- ---------- Perfil / Dupla ----------

create table if not exists public.duplas (
  id uuid primary key default gen_random_uuid(),
  nome text not null default 'Minha dupla',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  avatar_url text,
  dupla_id uuid references public.duplas(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Função utilitária: retorna o(s) user_id visível(is) ao usuário atual
-- (ele mesmo + membros da mesma dupla, se houver).
create or replace function public.visible_user_ids()
returns setof uuid
language sql
security definer
stable
as $$
  select p2.id
  from public.profiles p1
  join public.profiles p2 on p2.dupla_id is not distinct from p1.dupla_id
  where p1.id = auth.uid()
    and p1.dupla_id is not null
  union
  select auth.uid();
$$;

-- ---------- Tabela genérica de "dono" ----------
-- Todas as tabelas de domínio abaixo seguem o mesmo padrão de colunas:
-- user_id (dono), created_at, updated_at, deleted_at (soft delete).

create table if not exists public.disciplinas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  nome text not null,
  slug text not null,
  cor text not null default '#D4AF37',
  professor text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.pacientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  nome text not null,
  telefone text,
  nascimento date,
  professor text,
  procedimentos text[] not null default '{}',
  proximo_retorno date,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.tarefas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  titulo text not null,
  descricao text,
  concluida boolean not null default false,
  prioridade text not null default 'MEDIA' check (prioridade in ('BAIXA','MEDIA','ALTA')),
  data date,
  disciplina_id uuid references public.disciplinas(id) on delete set null,
  aprendizado text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  titulo text not null,
  tipo text not null default 'evento' check (tipo in ('prova','clinica','aula','evento')),
  cor text not null default '#00BFFF',
  inicio timestamptz not null,
  fim timestamptz,
  disciplina_id uuid references public.disciplinas(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.avaliacoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  disciplina_id uuid not null references public.disciplinas(id) on delete cascade,
  nome text not null,
  peso numeric not null default 1,
  valor numeric not null default 10,
  nota numeric,
  data date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.lembretes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  titulo text not null,
  categoria text,
  recorrente boolean not null default false,
  data timestamptz,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.biblioteca_itens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  titulo text not null,
  tipo text not null check (tipo in ('PDF','SLIDE','VIDEO','DOCUMENTO')),
  disciplina_id uuid references public.disciplinas(id) on delete set null,
  professor text,
  assunto text,
  storage_path text,
  url_arquivo text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.fotos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  storage_path text not null,
  url_publica text,
  descricao text,
  fase text check (fase in ('antes','durante','depois')),
  disciplina_id uuid references public.disciplinas(id) on delete set null,
  paciente_id uuid references public.pacientes(id) on delete set null,
  atendimento_id uuid,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.objetivos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  titulo text not null,
  tipo text not null default 'semanal' check (tipo in ('diario','semanal','mensal','semestral')),
  meta_total numeric not null default 1,
  progresso numeric not null default 0,
  prazo date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.procedimentos (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique
);
insert into public.procedimentos (nome) values
  ('Restauração Classe II'), ('Profilaxia'), ('Endodontia'), ('Exodontia'),
  ('Raspagem'), ('Ajuste Oclusal'), ('Outro')
on conflict (nome) do nothing;

create table if not exists public.atendimentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  paciente_id uuid references public.pacientes(id) on delete set null,
  procedimento text not null,
  disciplina text,
  professor text,
  status text not null default 'EM_ANDAMENTO' check (status in ('EM_ANDAMENTO','FINALIZADO')),
  iniciado_em timestamptz not null default now(),
  finalizado_em timestamptz,
  checklist jsonb not null default '[]',
  materiais jsonb not null default '[]',
  timeline jsonb not null default '[]',
  anotacoes_clinicas text,
  complicacoes text,
  observacoes_professor text,
  pendencias text,
  retorno_data date,
  retorno_obs text,
  resumo_como_foi text,
  resumo_aprendizado text,
  resumo_faria_diferente text,
  resumo_dificuldade text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------- RLS ----------

alter table public.profiles enable row level security;
alter table public.disciplinas enable row level security;
alter table public.pacientes enable row level security;
alter table public.tarefas enable row level security;
alter table public.eventos enable row level security;
alter table public.avaliacoes enable row level security;
alter table public.lembretes enable row level security;
alter table public.biblioteca_itens enable row level security;
alter table public.fotos enable row level security;
alter table public.atendimentos enable row level security;
alter table public.objetivos enable row level security;

create policy "profiles: select own" on public.profiles for select using (id = auth.uid());
create policy "profiles: update own" on public.profiles for update using (id = auth.uid());
create policy "profiles: insert own" on public.profiles for insert with check (id = auth.uid());

do $$
declare
  t text;
begin
  for t in select unnest(array[
    'disciplinas','pacientes','tarefas','eventos','avaliacoes',
    'lembretes','biblioteca_itens','fotos','atendimentos','objetivos'
  ])
  loop
    execute format($f$
      create policy "%1$s: select visible" on public.%1$s
        for select using (user_id in (select public.visible_user_ids()));
      create policy "%1$s: insert own" on public.%1$s
        for insert with check (user_id = auth.uid());
      create policy "%1$s: update visible" on public.%1$s
        for update using (user_id in (select public.visible_user_ids()));
      create policy "%1$s: delete visible" on public.%1$s
        for delete using (user_id in (select public.visible_user_ids()));
    $f$, t);
  end loop;
end $$;

-- ---------- Trigger: cria profile automaticamente após cadastro ----------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Storage buckets ----------

insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('biblioteca', 'biblioteca', true)
on conflict (id) do nothing;

create policy "fotos: leitura pública" on storage.objects for select using (bucket_id = 'fotos');
create policy "fotos: upload autenticado" on storage.objects for insert with check (bucket_id = 'fotos' and auth.uid() is not null);
create policy "fotos: exclusão do dono" on storage.objects for delete using (bucket_id = 'fotos' and auth.uid() is not null);

create policy "biblioteca: leitura pública" on storage.objects for select using (bucket_id = 'biblioteca');
create policy "biblioteca: upload autenticado" on storage.objects for insert with check (bucket_id = 'biblioteca' and auth.uid() is not null);
create policy "biblioteca: exclusão do dono" on storage.objects for delete using (bucket_id = 'biblioteca' and auth.uid() is not null);
