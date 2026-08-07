"use client";

import { motion } from "framer-motion";
import { User, Palette, DatabaseBackup, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { fadeInUp, staggerContainer } from "@/animations/variants";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ConfiguracoesPage() {
  return (
    <div>
      <PageHeader title="Configurações" description="Perfil, tema, backup e preferências do sistema." />

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2"><User className="h-4.5 w-4.5 text-primary" /> Perfil</CardTitle>
                <CardDescription>Conta compartilhada — Junior e Gabriel</CardDescription>
              </div>
            </CardHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dupla">Nome da dupla</Label>
                <Input id="dupla" defaultValue="Junior e Gabriel" className="mt-1.5" />
              </div>
              <Button onClick={() => toast.success("Preferências salvas.")}>Salvar alterações</Button>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette className="h-4.5 w-4.5 text-primary" /> Aparência</CardTitle>
            </CardHeader>
            <p className="text-sm text-text-secondary">
              O GC OdontoHub utiliza tema escuro premium por padrão. Personalização de cores e widgets estará disponível em breve.
            </p>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DatabaseBackup className="h-4.5 w-4.5 text-primary" /> Backup</CardTitle>
            </CardHeader>
            <p className="text-sm text-text-secondary">Backup automático em nuvem — estrutura preparada, disponível em breve.</p>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><RefreshCw className="h-4.5 w-4.5 text-primary" /> Sincronização</CardTitle>
            </CardHeader>
            <p className="text-sm text-text-secondary">Sincronização entre dispositivos — estrutura preparada, disponível em breve.</p>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
