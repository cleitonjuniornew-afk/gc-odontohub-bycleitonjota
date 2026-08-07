"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordInput } from "../schemas/auth-schemas";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SupabaseNotice } from "./supabase-notice";

export function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  async function onSubmit(data: ResetPasswordInput) {
    if (!isSupabaseConfigured) {
      toast.info("Ambiente de demonstração: conecte o Supabase para ativar a recuperação de senha.");
      setSent(true);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/atualizar-senha`,
    });
    setLoading(false);

    if (error) {
      toast.error("Não foi possível enviar o e-mail. Vamos tentar novamente.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-xl font-bold text-text-primary">Verifique seu e-mail</h1>
        <p className="text-sm text-text-secondary">Enviamos um link para redefinir sua senha.</p>
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-secondary hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Recuperar senha</h1>
        <p className="mt-1 text-sm text-text-secondary">Enviaremos um link de redefinição para seu e-mail.</p>
      </div>

      {!isSupabaseConfigured && <SupabaseNotice />}

      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" icon={<Mail className="h-4 w-4" />} placeholder="voce@exemplo.com" className="mt-1.5" {...register("email")} />
        {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
      </div>

      <Button type="submit" className="w-full" loading={loading}>Enviar link</Button>

      <p className="text-center text-sm text-text-secondary">
        <Link href="/login" className="inline-flex items-center gap-1.5 font-medium text-secondary hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o login
        </Link>
      </p>
    </form>
  );
}
