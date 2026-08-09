"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Palette,
  DatabaseBackup,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import {
  fadeInUp,
  staggerContainer,
} from "@/animations/variants";

import { PageHeader } from "@/components/shared/page-header";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function formatDisplayName(nome: string | null | undefined) {
  if (!nome) {
    return "";
  }

  const parts = nome
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean);

  if (parts.length <= 2) {
    return parts.join(" ");
  }

  return `${parts[0]} ${parts[1]}`;
}

export default function ConfiguracoesPage() {
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!isSupabaseConfigured) {
        setNome("");
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          throw error;
        }

        const nomeSalvo =
          user?.user_metadata?.nome ??
          user?.user_metadata?.name ??
          "";

        setNome(formatDisplayName(nomeSalvo));
      } catch (error) {
        console.error(
          "Erro ao carregar perfil:",
          error
        );

        toast.error(
          "Não foi possível carregar seu perfil."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSave() {
    const nomeLimpo = nome
      .trim()
      .replace(/\s+/g, " ");

    if (!nomeLimpo) {
      toast.error(
        "Digite um nome antes de salvar."
      );
      return;
    }

    setSaving(true);

    try {
      if (!isSupabaseConfigured) {
        toast.success(
          "Preferências salvas no modo demonstração."
        );

        setNome(
          formatDisplayName(nomeLimpo)
        );

        return;
      }

      const supabase = createClient();

      const { error } =
        await supabase.auth.updateUser({
          data: {
            nome: nomeLimpo,
          },
        });

      if (error) {
        throw error;
      }

      setNome(
        formatDisplayName(nomeLimpo)
      );

      toast.success(
        "Preferências salvas."
      );
    } catch (error) {
      console.error(
        "Erro ao salvar perfil:",
        error
      );

      toast.error(
        "Não foi possível salvar as alterações."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Perfil, tema, backup e preferências do sistema."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid gap-6 lg:grid-cols-2"
      >
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4.5 w-4.5 text-primary" />

                  Perfil
                </CardTitle>

                <CardDescription>
                  Seu nome será usado no Dashboard e em outras áreas do sistema.
                </CardDescription>
              </div>
            </CardHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="dupla">
                  Nome exibido
                </Label>

                <Input
                  id="dupla"
                  value={nome}
                  onChange={(event) =>
                    setNome(event.target.value)
                  }
                  disabled={
                    loading || saving
                  }
                  placeholder="Seu nome"
                  className="mt-1.5"
                />

                <p className="mt-1.5 text-xs text-text-muted">
                  O sistema utiliza seu primeiro nome e primeiro sobrenome.
                </p>
              </div>

              <Button
                type="button"
                onClick={handleSave}
                disabled={
                  loading ||
                  saving ||
                  !nome.trim()
                }
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar alterações"
                )}
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-4.5 w-4.5 text-primary" />

                Aparência
              </CardTitle>
            </CardHeader>

            <p className="text-sm text-text-secondary">
              O GC OdontoHub utiliza tema escuro premium por padrão. Personalização de cores e widgets estará disponível em breve.
            </p>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DatabaseBackup className="h-4.5 w-4.5 text-primary" />

                Backup
              </CardTitle>
            </CardHeader>

            <p className="text-sm text-text-secondary">
              Backup automático em nuvem — estrutura preparada, disponível em breve.
            </p>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-4.5 w-4.5 text-primary" />

                Sincronização
              </CardTitle>
            </CardHeader>

            <p className="text-sm text-text-secondary">
              Sincronização entre dispositivos — estrutura preparada, disponível em breve.
            </p>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
