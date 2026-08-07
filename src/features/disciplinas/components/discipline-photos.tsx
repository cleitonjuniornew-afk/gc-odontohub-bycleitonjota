"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";


export function DisciplinePhotos({
disciplineId,
}:{
disciplineId:string;
}){


return (

<Card className="p-6 space-y-4">


<div className="flex justify-between">


<div>

<h3 className="font-semibold">
Fotos
</h3>

<p className="text-sm text-text-secondary">
Fotos de aulas e materiais
</p>

</div>


<Button
onClick={() =>
alert("Upload de foto será conectado")
}
>

<Plus className="mr-2 h-4 w-4"/>
Adicionar foto

</Button>


</div>


<div className="text-sm text-text-secondary">

Nenhuma foto cadastrada nesta disciplina.

</div>


</Card>

);

}
