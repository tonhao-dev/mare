import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { ControlForm } from "@/components/ControlForm";
import { createControl } from "../actions";

export default function NewControlPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Novo Controle
      </Typography>
      <ControlForm onSubmit={createControl} />
    </Box>
  );
}
