"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { changePartnerStatus } from "@/lib/admin/partners";

const changePartnerStatusSchema = z.object({
  partnerId: z.string().min(1).max(30),
  nextStatus: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "REJECTED"]),
  adminNote: z.string().trim().max(500).optional(),
});

export async function changePartnerStatusAction(formData: FormData) {
  const result = changePartnerStatusSchema.safeParse({
    partnerId: formData.get("partnerId"),
    nextStatus: formData.get("nextStatus"),
    adminNote: formData.get("adminNote") || undefined,
  });

  if (!result.success) throw new Error("Invalid partner status request.");

  await changePartnerStatus(result.data);
  revalidatePath("/admin");
  revalidatePath("/admin/partners");
}
