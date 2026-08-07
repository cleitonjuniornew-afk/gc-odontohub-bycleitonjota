import { PageHeader } from "@/components/shared/page-header";
import { LibraryBrowser } from "@/features/biblioteca/components/library-browser";

export default function BibliotecaPage() {
  return (
    <div>
      <PageHeader title="Biblioteca" description="PDFs, slides e vídeos organizados por disciplina, professor e assunto." />
      <LibraryBrowser />
    </div>
  );
}
