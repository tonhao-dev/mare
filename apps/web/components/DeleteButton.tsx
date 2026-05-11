"use client";

import Button from "@mui/material/Button";

interface DeleteButtonProps {
  id: string;
  onDelete: (id: string) => Promise<{ error?: string }>;
}

export function DeleteButton({ id, onDelete }: DeleteButtonProps) {
  async function handleDelete() {
    if (window.confirm("Tem certeza que deseja excluir este controle?")) {
      await onDelete(id);
    }
  }

  return (
    <Button size="small" color="error" onClick={handleDelete}>
      Excluir
    </Button>
  );
}
