import { PageHeader } from "@/components/shared/page-header";
import { MonthCalendar } from "@/features/agenda/components/month-calendar";

export default function AgendaPage() {
  return (
    <div>
      <PageHeader title="Agenda" description="Provas, clínicas e aulas — tudo em um só calendário." />
      <MonthCalendar />
    </div>
  );
}
