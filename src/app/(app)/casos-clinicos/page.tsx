"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Stethoscope, PlayCircle, Clock, CheckCircle2 } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/animations/variants";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useAppointmentsList } from "@/features/modo-clinica/hooks/use-appointments-list";

export default function CasosClinicosPage() {
  const { appointments, isLoading } = useAppointmentsList();
  const router = useRouter();

  return (
    <div>
      <PageHeader
        title="Casos Clínicos"
        description="Histórico dos seus atendimentos e acesso rápido ao Modo Atendimento."
        action={
          <Link href="/modo-atendimento">
            <Button><PlayCircle className="h-4 w-4" /> Iniciar Atendimento</Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">{[1, 2].map((i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
      ) : appointments.length === 0 ? (
        <EmptyState icon={Stethoscope} title="Vamos começar?" description="Inicie seu primeiro atendimento clínico." actionLabel="Iniciar Atendimento" onAction={() => router.push("/modo-atendimento")} />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-4 sm:grid-cols-2">
          {appointments.map((c) => (
            <motion.div key={c.id} variants={fadeInUp}>
              <button className="w-full text-left" onClick={() => router.push(`/modo-atendimento?id=${c.id}`)}>
                <Card className="hover:-translate-y-0.5">
                  <CardHeader>
                    <CardTitle className="text-base">{c.patientName}</CardTitle>
                    {c.status === "FINALIZADO" ? (
                      <Badge variant="success"><CheckCircle2 className="h-3 w-3" /> Finalizado</Badge>
                    ) : (
                      <Badge variant="warning">Em andamento</Badge>
                    )}
                  </CardHeader>
                  <p className="text-sm text-text-secondary">{c.procedure}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
                    <Clock className="h-3.5 w-3.5" /> {new Date(c.startedAt).toLocaleDateString("pt-BR")}
                  </div>
                </Card>
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
