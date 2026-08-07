"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { fadeInUp } from "@/animations/variants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Appointment } from "@/types";

export function AppointmentFinishedView({ appointment }: { appointment: Appointment }) {
  const duration = appointment.finishedAt
    ? Math.round((new Date(appointment.finishedAt).getTime() - new Date(appointment.startedAt).getTime()) / 60000)
    : 0;

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mx-auto max-w-lg py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold text-text-primary">Atendimento finalizado</h2>
      <p className="mt-2 text-sm text-text-secondary">Excelente trabalho. Mais um passo na sua formação clínica.</p>

      <Card className="mt-8 grid grid-cols-3 gap-4 text-left">
        <div><p className="text-xs text-text-muted">Duração</p><p className="text-lg font-semibold text-text-primary">{duration} min</p></div>
        <div><p className="text-xs text-text-muted">Fotos</p><p className="text-lg font-semibold text-text-primary">{appointment.timeline.filter(t => t.description.includes("Foto")).length}</p></div>
        <div><p className="text-xs text-text-muted">Materiais</p><p className="text-lg font-semibold text-text-primary">{appointment.materials.length}</p></div>
      </Card>

      <Link href="/casos-clinicos">
        <Button className="mt-8">Voltar para Casos Clínicos</Button>
      </Link>
    </motion.div>
  );
}
