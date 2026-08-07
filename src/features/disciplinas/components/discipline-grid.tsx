"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, ChevronRight } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/animations/variants";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDisciplines } from "../hooks/use-disciplines";

export function DisciplineGrid() {
  const { disciplines, isLoading, isError } = useDisciplines();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[var(--radius-card)] border border-error/20 bg-error/5 p-6 text-center">
        <p className="text-sm font-medium text-error">
          Não foi possível carregar as disciplinas.
        </p>
        <p className="mt-1 text-xs text-text-muted">
          Verifique a conexão com o Supabase e tente novamente.
        </p>
      </div>
    );
  }

  if (disciplines.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-8 text-center">
        <GraduationCap className="mx-auto h-8 w-8 text-text-muted" />
        <p className="mt-3 text-sm font-medium text-text-primary">
          Nenhuma disciplina cadastrada
        </p>
        <p className="mt-1 text-xs text-text-muted">
          Cadastre uma disciplina para ela aparecer aqui.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {disciplines.map((discipline) => (
        <motion.div key={discipline.id} variants={fadeInUp}>
          <Link href={`/disciplinas/${discipline.slug}`}>
            <Card className="group h-full cursor-pointer hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-[12px]"
                  style={{
                    backgroundColor: `${discipline.color}1A`,
                    color: discipline.color,
                  }}
                >
                  <GraduationCap className="h-5 w-5" />
                </div>

                <ChevronRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5" />
              </div>

              <h3 className="mt-4 text-base font-semibold text-text-primary">
                {discipline.name}
              </h3>

              {discipline.professor && (
                <p className="mt-1 text-xs text-text-muted">
                  {discipline.professor}
                </p>
              )}

              <p className="mt-3 text-xs text-text-secondary">
                Acessar disciplina
              </p>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
