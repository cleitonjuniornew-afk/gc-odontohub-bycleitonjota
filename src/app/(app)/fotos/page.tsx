import { PageHeader } from "@/components/shared/page-header";
import { PhotoGrid } from "@/features/fotos/components/photo-grid";

export default function FotosPage() {
  return (
    <div>
      <PageHeader title="Fotos" description="Organizadas por disciplina, assunto, professor e data." />
      <PhotoGrid />
    </div>
  );
}
