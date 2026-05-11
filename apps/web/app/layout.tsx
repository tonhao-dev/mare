import type { Metadata } from "next";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sistema Maré",
  description: "Sistema de controle financeiro pessoal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Sistema Maré
            </Typography>
            <Button color="inherit" component={Link} href="/controls">
              Controles
            </Button>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ p: 3 }}>
          {children}
        </Box>
      </body>
    </html>
  );
}
