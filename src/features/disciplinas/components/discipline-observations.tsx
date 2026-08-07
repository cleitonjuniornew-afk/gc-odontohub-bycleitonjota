"use client";


import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";


export function DisciplineObservations({
disciplineId,
}:{
disciplineId:string;
}){


return (

<Card className="p-6 space-y-4">


<div className="flex justify-between">


<div>

<h3 className="font-semibold">
Observações
</h3>

<p className="text-sm text-text-secondary">
Anotações importantes da disciplina
</p>

</div>


<Button
onClick={() =>
alert("Cadastro de observação será conectado")
}
>

<Plus className="mr-2 h-4 w-4"/>
Nova observação

</Button>


</div>


<div className="text-sm text-text-secondary">

Nenhuma observação cadastrada.

</div>


</Card>

);

}
