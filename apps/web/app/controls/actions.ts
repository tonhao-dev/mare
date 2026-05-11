"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@sistema-mare/database";
import { parseBRLToCents } from "@sistema-mare/core";
import type { ControlFormValues } from "@/lib/schemas";

export async function createControl(
  data: ControlFormValues,
): Promise<{ error?: string }> {
  try {
    await prisma.control.create({
      data: {
        name: data.name,
        baseValueCents: parseBRLToCents(data.baseValue),
        type: data.type,
        dailyStepCents: parseBRLToCents(data.dailyStep),
        cycleAnchor: data.cycleAnchor,
        cycleOffsetDays: data.cycleOffsetDays,
        countWorkingDaysOnly: data.countWorkingDaysOnly,
      },
    });
    revalidatePath("/controls");
  } catch (error) {
    console.error(error);
    return { error: "Erro ao criar controle. Tente novamente." };
  }
  redirect("/controls");
}

export async function updateControl(
  id: string,
  data: ControlFormValues,
): Promise<{ error?: string }> {
  try {
    await prisma.control.update({
      where: { id },
      data: {
        name: data.name,
        baseValueCents: parseBRLToCents(data.baseValue),
        type: data.type,
        dailyStepCents: parseBRLToCents(data.dailyStep),
        cycleAnchor: data.cycleAnchor,
        cycleOffsetDays: data.cycleOffsetDays,
        countWorkingDaysOnly: data.countWorkingDaysOnly,
      },
    });
    revalidatePath("/controls");
    revalidatePath(`/controls/${id}`);
  } catch (error) {
    return { error: "Erro ao atualizar controle. Tente novamente." };
  }
  redirect(`/controls/${id}`);
}

export async function deleteControl(id: string): Promise<{ error?: string }> {
  try {
    await prisma.control.delete({ where: { id } });
    revalidatePath("/controls");
  } catch (error) {
    return { error: "Erro ao excluir controle. Tente novamente." };
  }
  redirect("/controls");
}
