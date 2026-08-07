"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, ChevronRight } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/animations/variants";
import { Card } from "@/components/ui/card";
import { disciplines, tasks } from "@/lib/mock-data";

export function DisciplineGrid() {
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {disciplines.map((d) => {
        const pending = tasks.filter((t) => t.disciplineId === d.id && !t.done).length;
        return (
          <motion.div key={d.id} variants={fadeInUp}>
            <Link href={`/disciplinas/${d.slug}`}>
              <Card className="group h-full cursor-pointer hover:-translate-y-0.5">
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-[12px]"
                    style={{ backgroundColor: `${d.color}1A`, color: d.color }}
                  >
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-text-muted transition-transform group-hover:translate-x-0.5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-text-primary">{d.name}</h3>
                <p className="mt-1 text-xs text-text-muted">{d.professor}</p>
                <p className="mt-3 text-xs text-text-secondary">
                  {pending > 0 ? `${pending} tarefa${pending > 1 ? "s" : ""} pendente${pending > 1 ? "s" : ""}` : "Tudo em dia"}
                </p>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
