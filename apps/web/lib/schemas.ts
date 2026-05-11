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
});

export type ControlFormValues = z.infer<typeof controlSchema>;
