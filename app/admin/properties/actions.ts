"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { changePropertyStatus } from "@/lib/admin/properties";

const reviewSchema = z.object({
  propertyId: z.string().min(1).max(30),
  nextStatus: z.enum(["PUBLISHED", "REJECTED", "SUSPENDED"]),
  note: z.string().trim().max(1_000).optional(),
}).superRefine((value, context) => {
  if (["REJECTED", "SUSPENDED"].includes(value.nextStatus) && (!value.note || value.note.length < 10)) {
    context.addIssue({ code: "custom", path: ["note"], message: "A reason of at least 10 characters is required." });
  }
});

export async function reviewPropertyAction(formData: FormData) {
  const result = reviewSchema.safeParse({
    propertyId: formData.get("propertyId"),
    nextStatus: formData.get("nextStatus"),
    note: formData.get("note") || undefined,
  });
  if (!result.success) throw new Error("Invalid property review request.");

  await changePropertyStatus(result.data);
  revalidatePath("/admin");
  revalidatePath("/admin/properties");
  revalidatePath("/partner");
  revalidatePath("/partner/properties");
  revalidatePath(`/partner/properties/${result.data.propertyId}`);
  revalidatePath("/search");
}
