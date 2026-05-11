import { notFound } from "next/navigation";
import { prisma } from "@sistema-mare/database";
import { formatCentsToBRL, type ControlType } from "@sistema-mare/core";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { ControlForm } from "@/components/ControlForm";
import { updateControl } from "../../actions";

interface EditControlPageProps {
  params: { id: string };
}

export default async function EditControlPage({
  params,
}: EditControlPageProps) {
  const control = await prisma.control.findUnique({
    where: { id: params.id },
  });

  if (!control) {
    notFound();
  }

  // Convert stored cents back to BRL strings for defaultValues
  const defaultValues = {
    name: control.name,
    baseValue: formatCentsToBRL(control.baseValueCents)
      .replace("R$\u00a0", "")
      .trim(),
    type: control.type as ControlType,
    dailyStep: formatCentsToBRL(control.dailyStepCents)
      .replace("R$\u00a0", "")
      .trim(),
  };

  const updateControlWithId = updateControl.bind(null, params.id);

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Editar Controle
      </Typography>
      <ControlForm
        defaultValues={defaultValues}
        onSubmit={updateControlWithId}
      />
    </Box>
  );
}
