"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { updatePasswordSchema, type UpdatePasswordInput } from "../schemas/auth-schemas";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SupabaseNotice } from "./supabase-notice";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordInput>({ resolver: zodResolver(updatePasswordSchema) });

  async function onSubmit(data: UpdatePasswordInput) {
    if (!isSupabaseConfigured) {
      toast.info("Ambiente de demonstração: conecte o Supabase para ativar a troca de senha.");
      router.push("/login");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: data.password });
    setLoading(false);

    if (error) {
      toast.error("Não foi possível atualizar a senha. Vamos tentar novamente.");
      return;
    }
    toast.success("Senha atualizada com sucesso.");
    router.push("/login");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Nova senha</h1>
        <p className="mt-1 text-sm text-text-secondary">Defina sua nova senha de acesso.</p>
      </div>

      {!isSupabaseConfigured && <SupabaseNotice />}

      <div>
        <Label htmlFor="password">Nova senha</Label>
        <Input id="password" type="password" icon={<Lock className="h-4 w-4" />} className="mt-1.5" {...register("password")} />
        {errors.password && <p className="mt-1 text-xs text-error">{errors.password.message}</p>}
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
        <Input id="confirmPassword" type="password" icon={<Lock className="h-4 w-4" />} className="mt-1.5" {...register("confirmPassword")} />
        {errors.confirmPassword && <p className="mt-1 text-xs text-error">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" className="w-full" loading={loading}>Atualizar senha</Button>
    </form>
  );
}
