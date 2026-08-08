/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createLocalStore } from "@/lib/local-store";

export interface ClinicalProcedureStep {
  ordem: number;
  titulo: string;
  descricao?: string;
}

export interface ClinicalChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface ClinicalMaterial {
  nome: string;
  quantidade?: number;
}

export interface ClinicalComplication {
  titulo: string;
  descricao?: string;
}

export interface ClinicalOrientation {
  titulo: string;
  descricao?: string;
}

export interface ClinicalPhotoRequirement {
  fase: "antes" | "durante" | "depois";
  obrigatoria: boolean;
}

export interface ClinicalProcedure {
  id: string;
  userId?: string | null;
  nome: string;
  slug: string;
  disciplina?: string | null;
  descricao?: string | null;
  revisaoTitulo?: string | null;
  revisaoConteudo?: string | null;
  passoAPasso: ClinicalProcedureStep[];
  checklist: ClinicalChecklistItem[];
  materiais: ClinicalMaterial[];
  complicacoes: ClinicalComplication[];
  orientacoes: ClinicalOrientation[];
  fotosNecessarias: ClinicalPhotoRequirement[];
  tempoRevisao?: number | null;
  ativo: boolean;
}

type LocalRow = ClinicalProcedure;

const localStore = createLocalStore([]);

function fromRow(row: any): ClinicalProcedure {
  return {
    id: row.id,

    userId: row.user_id ?? null,

    nome: row.nome ?? "",
    slug: row.slug ?? "",

    disciplina: row.disciplina ?? null,

    descricao: row.descricao ?? null,

    revisaoTitulo: row.revisao_titulo ?? null,

    revisaoConteudo: row.revisao_conteudo ?? null,

    passoAPasso: row.passo_a_passo ?? [],

    checklist: row.checklist ?? [],

    materiais: row.materiais ?? [],

    complicacoes: row.complicacoes ?? [],

    orientacoes: row.orientacoes ?? [],

    fotosNecessarias: row.fotos_necessarias ?? [],

    tempoRevisao: row.tempo_revisao ?? null,

    ativo: row.ativo ?? true,
  };
}

export const clinicalProceduresRepository = {
  async list(): Promise<ClinicalProcedure[]> {
    if (!isSupabaseConfigured) {
      const rows = await localStore.list();

      return rows.filter(
        (item) => item.ativo !== false
      );
    }

    const supabase = createClient();

    const {
      data,
      error,
    } = await supabase
      .from("procedimentos_clinicos")
      .select("*")
      .eq("ativo", true)
      .order("nome", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return (data ?? []).map(fromRow);
  },

  async get(
    id: string
  ): Promise<ClinicalProcedure | null> {
    if (!isSupabaseConfigured) {
      const rows = await localStore.list();

      return (
        rows.find(
          (item) => item.id === id
        ) ?? null
      );
    }

    const supabase = createClient();

    const {
      data,
      error,
    } = await supabase
      .from("procedimentos_clinicos")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data
      ? fromRow(data)
      : null;
  },

  async delete(
    id: string
  ): Promise<void> {
    if (!isSupabaseConfigured) {
      await localStore.update(
        id,
        {
          ativo: false,
        } as Partial<LocalRow>
      );

      return;
    }

    const supabase = createClient();

    const {
      error,
    } = await supabase
      .from("procedimentos_clinicos")
      .update({
        ativo: false,
      })
      .eq("id", id);

    if (error) {
      throw error;
    }
  },
};
