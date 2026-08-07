"use client";

import { motion } from "framer-motion";
import { ListTodo, BookOpenCheck, Clock, Stethoscope } from "lucide-react";
import { staggerContainer } from "@/animations/variants";
import { StatCard } from "@/components/shared/stat-card";
import { useTasks } from "@/features/tarefas/hooks/use-tasks";
import { useEvents } from "@/features/agenda/hooks/use-events";

export function QuickStats() {
  const { tasks } = useTasks();
  const { events } = useEvents();
  const pendingTasks = tasks.filter((t) => !t.done).length;
  const upcoming = [...events].filter((e) => new Date(e.start).getTime() >= Date.now()).sort((a, b) => a.start.localeCompare(b.start));
  const nextExam = upcoming.find((e) => e.type === "prova");
  const nextClinic = upcoming.find((e) => e.type === "clinica");

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard icon={ListTodo} label="Pendências hoje" value={pendingTasks} hint="tarefas em aberto" accent="primary" />
      <StatCard
        icon={BookOpenCheck}
        label="Próxima prova"
        value={nextExam ? nextExam.title.replace("Prova de ", "") : "—"}
        hint={nextExam ? new Date(nextExam.start).toLocaleDateString("pt-BR") : ""}
        accent="warning"
      />
      <StatCard
        icon={Stethoscope}
        label="Próxima clínica"
        value={nextClinic ? new Date(nextClinic.start).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "—"}
        hint={nextClinic?.title}
        accent="secondary"
      />
      <StatCard icon={Clock} label="Horas estudadas" value="7h" hint="essa semana" accent="success" />
    </motion.div>
  );
}
