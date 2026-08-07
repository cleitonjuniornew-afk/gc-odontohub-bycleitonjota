"use client";
import { useState } from "react";
import { ClipboardList, BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProcedureReviewDrawer } from "./procedure-review-drawer";
import type { Appointment } from "@/types";

export function ProcedureCard({ appointment }: { appointment: Appointment }) {
  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ClipboardList className="h-4.5 w-4.5 text-primary" /> Procedimento</CardTitle>
      </CardHeader>
      <p className="text-sm text-text-primary">{appointment.procedure}</p>
      <Button variant="ghost" size="sm" className="mt-4 w-full" onClick={() => setReviewOpen(true)}>
        <BookOpen className="h-4 w-4" /> Revisar Procedimento (2 min)
      </Button>
      <ProcedureReviewDrawer open={reviewOpen} onOpenChange={setReviewOpen} procedure={appointment.procedure} />
    </Card>
  );
}
