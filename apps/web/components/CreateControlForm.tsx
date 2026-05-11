"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import InputLabel from "@mui/material/InputLabel";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import { controlSchema, type ControlFormValues } from "@/lib/schemas";
import { createControl } from "@/app/controls/actions";

export function CreateControlForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ControlFormValues>({
    resolver: zodResolver(controlSchema),
    defaultValues: {
      cycleAnchor: "START",
      cycleOffsetDays: 0,
      countWorkingDaysOnly: false,
    },
  });

  function onSubmit(data: ControlFormValues) {
    setServerError(null);
    startTransition(async () => {
      const result = await createControl(data);
      if (result?.error) setServerError(result.error);
    });
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 480 }}
    >
      {serverError && <Alert severity="error">{serverError}</Alert>}

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

      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.type}>
            <InputLabel id="type-label">Tipo</InputLabel>
            <Select
              {...field}
              labelId="type-label"
              label="Tipo"
              value={field.value ?? ""}
            >
              <MenuItem value="INCREASE">INCREASE (Aumenta)</MenuItem>
              <MenuItem value="DECREASE">DECREASE (Diminui)</MenuItem>
            </Select>
            {errors.type && (
              <FormHelperText>{errors.type.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />

      <TextField
        label="Passo Diário (R$)"
        {...register("dailyStep")}
        error={!!errors.dailyStep}
        helperText={errors.dailyStep?.message}
        fullWidth
        placeholder="35,00"
      />

      <Controller
        name="cycleAnchor"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth error={!!errors.cycleAnchor}>
            <InputLabel id="anchor-label">Início do ciclo</InputLabel>
            <Select
              {...field}
              labelId="anchor-label"
              label="Início do ciclo"
              value={field.value ?? "START"}
            >
              <MenuItem value="START">A partir do início do mês</MenuItem>
              <MenuItem value="END">A partir do fim do mês</MenuItem>
            </Select>
            {errors.cycleAnchor && (
              <FormHelperText>{errors.cycleAnchor.message}</FormHelperText>
            )}
          </FormControl>
        )}
      />

      <TextField
        label="Dias de offset"
        type="number"
        {...register("cycleOffsetDays")}
        error={!!errors.cycleOffsetDays}
        helperText={
          errors.cycleOffsetDays?.message ??
          "Quantos dias após o início / antes do fim do mês o ciclo começa"
        }
        fullWidth
        inputProps={{ min: 0 }}
      />

      <Controller
        name="countWorkingDaysOnly"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Switch
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            }
            label="Contar apenas dias úteis"
          />
        )}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting || isPending}
        sx={{ alignSelf: "flex-start" }}
      >
        {isSubmitting || isPending ? "Salvando..." : "Salvar"}
      </Button>
    </Box>
  );
}
