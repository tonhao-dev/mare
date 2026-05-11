import { z } from "zod";
import { parseBRLToCents } from "@sistema-mare/core";

export const controlSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  baseValue: z.string().min(1, "Valor base é obrigatório"),
  type: z.enum(["INCREASE", "DECREASE"], {
    required_error: "Tipo é obrigatório",
  }),
  dailyStep: z
    .string()
    .refine(
      (v) => parseBRLToCents(v) > 0,
      "Passo diário deve ser maior que zero",
    ),
  cycleAnchor: z.enum(["START", "END"], {
    required_error: "Âncora do ciclo é obrigatória",
  }),
  cycleOffsetDays: z.coerce
    .number({ invalid_type_error: "Informe um número" })
    .int("Deve ser um número inteiro")
    .min(0, "Deve ser zero ou maior"),
  countWorkingDaysOnly: z.boolean(),
});

export type ControlFormValues = z.infer<typeof controlSchema>;
