"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";
import { loginSchema, type LoginInput } from "../schemas/auth-schemas";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SupabaseNotice } from "./supabase-notice";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    if (!isSupabaseConfigured) {
      toast.info("Ambiente de demonstração: conecte o Supabase para ativar o login real.");
      router.push("/dashboard");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(data);
    setLoading(false);

    if (error) {
      toast.error("Não foi possível entrar. Verifique seu e-mail e senha.");
      return;
    }
    toast.success("Bem-vindo de volta!");
    router.push(params.get("redirect") ?? "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Entrar</h1>
        <p className="mt-1 text-sm text-text-secondary">Acesse o GC OdontoHub.</p>
      </div>

      {!isSupabaseConfigured && <SupabaseNotice />}

      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" icon={<Mail className="h-4 w-4" />} placeholder="voce@exemplo.com" className="mt-1.5" {...register("email")} />
        {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Senha</Label>
          <Link href="/recuperar-senha" className="text-xs text-secondary hover:underline">Esqueceu a senha?</Link>
        </div>
        <Input id="password" type="password" icon={<Lock className="h-4 w-4" />} placeholder="••••••••" className="mt-1.5" {...register("password")} />
        {errors.password && <p className="mt-1 text-xs text-error">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full" loading={loading}>Entrar</Button>

      <p className="text-center text-sm text-text-secondary">
        Ainda não tem conta? <Link href="/cadastro" className="font-medium text-secondary hover:underline">Cadastre-se</Link>
      </p>
    </form>
  );
}
