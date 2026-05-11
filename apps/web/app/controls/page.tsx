import { prisma } from "@sistema-mare/database";
import {
  calculateControlBalance,
  formatCentsToBRL,
  type ControlType,
} from "@sistema-mare/core";
import Link from "next/link";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteControl } from "./actions";

export default async function ControlsPage() {
  const controls = await prisma.control.findMany({
    orderBy: { createdAt: "desc" },
  });

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
          Controles
        </Typography>
        <Button variant="contained" component={Link} href="/controls/new">
          Novo Controle
        </Button>
      </Box>

      {controls.length === 0 ? (
        <Typography>Nenhum controle cadastrado.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Valor Base</TableCell>
                <TableCell>Passo Diário</TableCell>
                <TableCell>Saldo Calculado</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {controls.map((control) => {
                const balance = calculateControlBalance({
                  baseValueCents: control.baseValueCents,
                  dailyStepCents: control.dailyStepCents,
                  type: control.type as ControlType,
                });
                return (
                  <TableRow key={control.id}>
                    <TableCell>{control.name}</TableCell>
                    <TableCell>{control.type}</TableCell>
                    <TableCell>
                      {formatCentsToBRL(control.baseValueCents)}
                    </TableCell>
                    <TableCell>
                      {formatCentsToBRL(control.dailyStepCents)}
                    </TableCell>
                    <TableCell>{formatCentsToBRL(balance)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          component={Link}
                          href={`/controls/${control.id}`}
                        >
                          Ver
                        </Button>
                        <Button
                          size="small"
                          component={Link}
                          href={`/controls/${control.id}/edit`}
                        >
                          Editar
                        </Button>
                        <DeleteButton
                          id={control.id}
                          onDelete={deleteControl}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
