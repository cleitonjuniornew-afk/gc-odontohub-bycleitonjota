import { PageHeader } from "@/components/shared/page-header";
import { PatientList } from "@/features/pacientes/components/patient-list";

export default function PacientesPage() {
  return (
    <div>
      <PageHeader
        title="Pacientes"
        description="Cadastro completo com procedimentos, retornos e observações."
      />
      <PatientList />
    </div>
  );
}
