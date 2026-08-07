import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
  password: z.string().min(1, "Informe sua senha"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const signUpSchema = z
  .object({
    nome: z.string().min(2, "Informe seu nome"),
    email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
    password: z.string().min(6, "Mínimo de 6 caracteres"),
    confirmPassword: z.string().min(6, "Mínimo de 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });
export type SignUpInput = z.infer<typeof signUpSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().min(1, "Informe seu e-mail").email("E-mail inválido"),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updatePasswordSchema = z
  .object({
    password: z.string().min(6, "Mínimo de 6 caracteres"),
    confirmPassword: z.string().min(6, "Mínimo de 6 caracteres"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
