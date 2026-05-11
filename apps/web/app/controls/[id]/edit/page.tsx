import { notFound } from "next/navigation";
import { prisma } from "@sistema-mare/database";
import {
  formatCentsToBRL,
  type ControlType,
  type CycleAnchor,
} from "@sistema-mare/core";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { EditControlForm } from "@/components/EditControlForm";

interface EditControlPageProps {
  params: { id: string };
}

export default async function EditControlPage({
  params,
}: EditControlPageProps) {
  const control = await prisma.control.findUnique({ where: { id: params.id } });

  if (!control) notFound();

  const defaultValues = {
    name: control.name,
    baseValue: formatCentsToBRL(control.baseValueCents)
      .replace("R$\u00a0", "")
      .trim(),
    type: control.type as ControlType,
    dailyStep: formatCentsToBRL(control.dailyStepCents)
      .replace("R$\u00a0", "")
      .trim(),
    cycleAnchor: control.cycleAnchor as CycleAnchor,
    cycleOffsetDays: control.cycleOffsetDays,
    countWorkingDaysOnly: control.countWorkingDaysOnly,
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Editar Controle
      </Typography>
      <EditControlForm id={params.id} defaultValues={defaultValues} />
    </Box>
  );
}
