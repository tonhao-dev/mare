import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@sistema-mare/database";
import {
  calculateControlBalance,
  fetchBrazilianHolidays,
  computeCycleStartDay,
  formatCentsToBRL,
  type ControlType,
  type CycleAnchor,
} from "@sistema-mare/core";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteControl } from "../actions";

interface ControlDetailPageProps {
  params: { id: string };
}

export default async function ControlDetailPage({
  params,
}: ControlDetailPageProps) {
  const today = new Date();
  const [control, holidays] = await Promise.all([
    prisma.control.findUnique({ where: { id: params.id } }),
    fetchBrazilianHolidays(today.getFullYear()),
  ]);

  if (!control) notFound();

  const cycleStartDay = computeCycleStartDay(
    control.cycleAnchor as CycleAnchor,
    control.cycleOffsetDays,
    today,
    control.countWorkingDaysOnly,
    holidays,
  );

  const balance = calculateControlBalance({
    baseValueCents: control.baseValueCents,
    dailyStepCents: control.dailyStepCents,
    type: control.type as ControlType,
    cycleAnchor: control.cycleAnchor as CycleAnchor,
    cycleOffsetDays: control.cycleOffsetDays,
    countWorkingDaysOnly: control.countWorkingDaysOnly,
    holidays,
    referenceDate: today,
  });

  const todayDay = today.getDate();
  const cycleStarted = todayDay >= cycleStartDay;

  const baseFormatted = formatCentsToBRL(control.baseValueCents);
  const stepFormatted = formatCentsToBRL(control.dailyStepCents);
  const balanceFormatted = formatCentsToBRL(balance);

  const anchorLabel =
    control.cycleAnchor === "START"
      ? `${control.cycleOffsetDays} dias após o início do mês`
      : `${control.cycleOffsetDays} dias antes do fim do mês`;

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
              Início do Ciclo
            </Typography>
            <Typography>
              Dia {cycleStartDay} ({anchorLabel})
              {control.countWorkingDaysOnly && (
                <Chip label="apenas dias úteis" size="small" sx={{ ml: 1 }} />
              )}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Dia Atual
            </Typography>
            <Typography>
              {todayDay}
              {!cycleStarted && (
                <Typography
                  component="span"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  (ciclo começa no dia {cycleStartDay})
                </Typography>
              )}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Saldo Calculado
            </Typography>
            <Typography variant="h6">{balanceFormatted}</Typography>
          </Box>
          {cycleStarted && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Cálculo
              </Typography>
              <Typography fontFamily="monospace">
                {control.type === "DECREASE"
                  ? `${baseFormatted} - ${stepFormatted} × dias decorridos = ${balanceFormatted}`
                  : `${baseFormatted} + ${stepFormatted} × dias decorridos = ${balanceFormatted}`}
              </Typography>
            </Box>
          )}
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
