# GC OdontoHub — MVP funcional

O hub acadêmico completo para estudantes de Odontologia. Next.js 15 (App Router),
TypeScript, TailwindCSS, Supabase (Auth + Postgres + Storage), TanStack Query,
React Hook Form + Zod, Framer Motion e Recharts.

## Como colocar no ar (Vercel + Supabase)

1. **Crie um projeto no Supabase** (supabase.com) e copie a URL e a `anon key`
   em *Project Settings → API*.
2. **Rode a migration**: abra o *SQL Editor* do seu projeto Supabase e execute
   o conteúdo de `supabase/migrations/0001_init.sql`. Isso cria todas as
   tabelas, políticas de RLS, o trigger de perfil automático e os buckets de
   Storage (`fotos` e `biblioteca`).
3. **Configure as variáveis de ambiente**: copie `.env.example` para `.env`
   (localmente) e preencha `NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`. No Vercel, adicione as mesmas duas
   variáveis em *Project Settings → Environment Variables*.
4. **Suba para o GitHub e conecte ao Vercel** — o deploy é automático a cada
   push. Nenhuma configuração adicional de build é necessária (usa o preset
   padrão do Next.js).

### Rodando localmente

```bash
npm install
npm run dev
```

## Modo de demonstração

Sem as variáveis do Supabase configuradas, o app **continua 100% navegável**:
toda a camada de repositórios (`src/repositories`) cai automaticamente em um
store local em memória com os mesmos dados de exemplo, para você revisar o
design e os fluxos antes de conectar o backend real.

## O que já está implementado nesta Sprint

- **Autenticação completa** via Supabase Auth: login, cadastro, recuperar
  senha, atualizar senha, logout, sessão persistida, rotas protegidas por
  middleware (redireciona para `/login` quando não autenticado).
- **CRUD real** (criar/editar/excluir, com loading e confirmação antes de
  excluir — toast com "Desfazer", nunca exclusão definitiva imediata):
  Tarefas, Pacientes, Notas/Avaliações, Agenda/Eventos, Lembretes, Biblioteca
  (upload real para Supabase Storage), Fotos (upload real), Objetivos.
- **Agenda em calendário mensal** (estilo Google Calendar), com navegação
  entre meses, seleção de dia e agenda lateral do dia selecionado.
- **Casos Clínicos** lista atendimentos reais e permite retomar um
  atendimento em andamento.
- **Modo Atendimento** com autosave real (debounced) a cada alteração —
  cronômetro, checklist, materiais, fotos, anotações, complicações,
  observações do professor, pendências, retorno e timeline persistidos no
  banco. Seleção de paciente cadastrado diretamente na tela (com atalho para
  cadastrar um novo paciente sem sair do atendimento).
- **Notas**: cálculo automático de média ponderada e situação (Aprovado /
  Recuperação / Reprovado).
- **Row Level Security** em todas as tabelas, com estrutura pronta para o
  "Modo Dupla" (dados visíveis entre membros da mesma dupla).

## O que ainda depende de configuração/uso real

- Como este ambiente de desenvolvimento não tem acesso a `supabase.co`, a
  integração foi construída e revisada, mas **não testada contra um projeto
  Supabase real**. Após conectar suas credenciais, valide o fluxo de
  cadastro → login → criação de dados uma vez antes de usar em produção.
- E-mails transacionais (confirmação de cadastro, recuperação de senha) usam
  o serviço de e-mail padrão do Supabase — configure um provedor SMTP próprio
  em *Project Settings → Auth* para produção.
