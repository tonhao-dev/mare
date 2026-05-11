import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@sistema-mare/database";
import {
  calculateControlBalance,
  formatCentsToBRL,
  type ControlType,
} from "@sistema-mare/core";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteControl } from "../actions";

interface ControlDetailPageProps {
  params: { id: string };
}

export default async function ControlDetailPage({
  params,
}: ControlDetailPageProps) {
  const control = await prisma.control.findUnique({
    where: { id: params.id },
  });

  if (!control) {
    notFound();
  }

  const today = new Date().getDate();
  const balance = calculateControlBalance({
    baseValueCents: control.baseValueCents,
    dailyStepCents: control.dailyStepCents,
    type: control.type as ControlType,
  });

  const baseFormatted = formatCentsToBRL(control.baseValueCents);
  const stepFormatted = formatCentsToBRL(control.dailyStepCents);
  const balanceFormatted = formatCentsToBRL(balance);

  const calculationExplanation =
    control.type === "DECREASE"
      ? `${baseFormatted} - ${stepFormatted} × ${today} = ${balanceFormatted}`
      : `${baseFormatted} + ${stepFormatted} × ${today} = ${balanceFormatted}`;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          {control.name}
        </Typography>
        <Button component={Link} href="/controls" variant="outlined">
          Voltar
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "grid", gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Tipo
            </Typography>
            <Typography>{control.type}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Valor Base
            </Typography>
            <Typography>{baseFormatted}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Passo Diário
            </Typography>
            <Typography>{stepFormatted}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Dia do Mês Atual
            </Typography>
            <Typography>{today}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Saldo Calculado
            </Typography>
            <Typography variant="h6">{balanceFormatted}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Cálculo
            </Typography>
            <Typography fontFamily="monospace">
              {calculationExplanation}
            </Typography>
          </Box>
          <Divider />
          <Box>
            <Typography variant="caption" color="text.secondary">
              Criado em
            </Typography>
            <Typography>{control.createdAt.toLocaleString("pt-BR")}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Atualizado em
            </Typography>
            <Typography>{control.updatedAt.toLocaleString("pt-BR")}</Typography>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          component={Link}
          href={`/controls/${control.id}/edit`}
        >
          Editar
        </Button>
        <DeleteButton id={control.id} onDelete={deleteControl} />
      </Box>
    </Box>
  );
}
