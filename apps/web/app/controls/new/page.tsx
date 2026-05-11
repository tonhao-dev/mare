import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { CreateControlForm } from "@/components/CreateControlForm";

export default function NewControlPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Novo Controle
      </Typography>
      <CreateControlForm />
    </Box>
  );
}
