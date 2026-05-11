"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { controlSchema, type ControlFormValues } from "@/lib/schemas";

interface ControlFormProps {
  defaultValues?: Partial<ControlFormValues>;
  onSubmit: (data: ControlFormValues) => Promise<{ error?: string } | void>;
}

export function ControlForm({ defaultValues, onSubmit }: ControlFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ControlFormValues>({
    resolver: zodResolver(controlSchema),
    defaultValues,
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 480 }}
    >
      <TextField
        label="Nome"
        {...register("name")}
        error={!!errors.name}
        helperText={errors.name?.message}
        fullWidth
      />

      <TextField
        label="Valor Base (R$)"
        {...register("baseValue")}
        error={!!errors.baseValue}
        helperText={errors.baseValue?.message}
        fullWidth
        placeholder="1.000,00"
      />

      <FormControl fullWidth error={!!errors.type}>
        <InputLabel id="type-label">Tipo</InputLabel>
        <Select
          labelId="type-label"
          label="Tipo"
          defaultValue={defaultValues?.type ?? ""}
          inputProps={register("type")}
        >
          <MenuItem value="INCREASE">INCREASE (Aumenta)</MenuItem>
          <MenuItem value="DECREASE">DECREASE (Diminui)</MenuItem>
        </Select>
        {errors.type && <FormHelperText>{errors.type.message}</FormHelperText>}
      </FormControl>

      <TextField
        label="Passo Diário (R$)"
        {...register("dailyStep")}
        error={!!errors.dailyStep}
        helperText={errors.dailyStep?.message}
        fullWidth
        placeholder="35,00"
      />

      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        sx={{ alignSelf: "flex-start" }}
      >
        {isSubmitting ? "Salvando..." : "Salvar"}
      </Button>
    </Box>
  );
}
