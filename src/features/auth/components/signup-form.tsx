"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Lock, User } from "lucide-react";

import {
  signUpSchema,
  type SignUpInput,
} from "../schemas/auth-schemas";

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SupabaseNotice } from "./supabase-notice";

export function SignUpForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  async function onSubmit(data: SignUpInput) {
    if (!isSupabaseConfigured) {
      toast.info(
        "Ambiente de demonstração: conecte o Supabase para ativar o cadastro real."
      );

      router.push("/dashboard");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const nome = data.nome.trim().replace(/\s+/g, " ");

    const { error } = await supabase.auth.signUp({
      email: data.email.trim(),
      password: data.password,
      options: {
        data: {
          nome,
        },
      },
    });

    setLoading(false);

    if (error) {
      toast.error(
        "Não foi possível concluir o cadastro. Vamos tentar novamente."
      );
      return;
    }

    toast.success(
      "Conta criada! Verifique seu e-mail para confirmar o acesso."
    );

    router.push("/login");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Criar conta
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          Comece a organizar sua vida acadêmica.
        </p>
      </div>

      {!isSupabaseConfigured && <SupabaseNotice />}

      <div>
        <Label htmlFor="nome">Nome</Label>

        <Input
          id="nome"
          icon={<User className="h-4 w-4" />}
          placeholder="Seu nome"
          className="mt-1.5"
          {...register("nome")}
        />

        {errors.nome && (
          <p className="mt-1 text-xs text-error">
            {errors.nome.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="email">E-mail</Label>

        <Input
          id="email"
          type="email"
          icon={<Mail className="h-4 w-4" />}
          placeholder="voce@exemplo.com"
          className="mt-1.5"
          {...register("email")}
        />

        {errors.email && (
          <p className="mt-1 text-xs text-error">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Senha</Label>

        <Input
          id="password"
          type="password"
          icon={<Lock className="h-4 w-4" />}
          placeholder="••••••••"
          className="mt-1.5"
          {...register("password")}
        />

        {errors.password && (
          <p className="mt-1 text-xs text-error">
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmPassword">
          Confirmar senha
        </Label>

        <Input
          id="confirmPassword"
          type="password"
          icon={<Lock className="h-4 w-4" />}
          placeholder="••••••••"
          className="mt-1.5"
          {...register("confirmPassword")}
        />

        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-error">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        loading={loading}
      >
        Criar conta
      </Button>

      <p className="text-center text-sm text-text-secondary">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-medium text-secondary hover:underline"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
