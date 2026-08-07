"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

export function DisciplineLibrary({
  disciplineId,
}: {
  disciplineId: string;
}) {

return (
<Card className="p-6 space-y-4">

<div className="flex items-center justify-between">

<div>
<h3 className="font-semibold">
Biblioteca
</h3>

<p className="text-sm text-text-secondary">
Materiais dessa disciplina
</p>
</div>


<Button
onClick={() =>
alert("Cadastro de material será conectado")
}
>

<Plus className="mr-2 h-4 w-4"/>
Adicionar material

</Button>

</div>


<div className="text-sm text-text-secondary">

Nenhum material cadastrado nesta disciplina.

</div>


</Card>
);
}
