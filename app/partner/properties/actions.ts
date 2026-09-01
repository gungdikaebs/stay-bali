"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  archiveOwnedPropertyMedia,
  moveOwnedPropertyMedia,
  setOwnedPropertyCover,
} from "@/lib/media/property-media";
import { bulkUpdateOwnedInventory } from "@/lib/inventory/inventory";
import {
  bulkInventorySchema,
  type InventoryActionState,
} from "@/lib/inventory/schemas";
import {
  archiveOwnedProperty,
  archiveOwnedRoom,
  createOwnedProperty,
  createOwnedRoom,
  submitOwnedProperty,
  updateOwnedProperty,
  updateOwnedRoom,
} from "@/lib/supply/properties";
import {
  propertyFormSchema,
  roomFormSchema,
  type SupplyActionState,
} from "@/lib/supply/schemas";

const entityIdSchema = z.string().min(1).max(30);

function propertyInput(formData: FormData) {
  return {
    name: formData.get("name"),
    type: formData.get("type"),
    description: formData.get("description"),
    area: formData.get("area"),
    address: formData.get("address"),
    checkInTime: formData.get("checkInTime"),
    checkOutTime: formData.get("checkOutTime"),
    cancellationPolicy: formData.get("cancellationPolicy"),
    facilityIds: formData.getAll("facilityIds"),
  };
}

function roomInput(formData: FormData) {
  return {
    name: formData.get("name"),
    description: formData.get("description"),
    adultCapacity: formData.get("adultCapacity"),
    childCapacity: formData.get("childCapacity"),
    bedType: formData.get("bedType"),
    sizeSqm: formData.get("sizeSqm"),
    basePrice: formData.get("basePrice"),
    totalUnits: formData.get("totalUnits"),
    facilityIds: formData.getAll("facilityIds"),
  };
}

export async function createPropertyAction(
  _previousState: SupplyActionState,
  formData: FormData,
): Promise<SupplyActionState> {
  const result = propertyFormSchema.safeParse(propertyInput(formData));
  if (!result.success) {
    return { status: "error", message: "Review the highlighted property fields.", errors: result.error.flatten().fieldErrors };
  }

  try {
    const property = await createOwnedProperty(result.data);
    redirect(`/partner/properties/${property.id}`);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return { status: "error", message: "The property could not be created. Please try again." };
  }
}

export async function updatePropertyAction(
  propertyId: string,
  _previousState: SupplyActionState,
  formData: FormData,
): Promise<SupplyActionState> {
  const parsedId = entityIdSchema.safeParse(propertyId);
  const result = propertyFormSchema.safeParse(propertyInput(formData));
  if (!parsedId.success || !result.success) {
    return { status: "error", message: "Review the highlighted property fields.", errors: result.success ? undefined : result.error.flatten().fieldErrors };
  }

  try {
    await updateOwnedProperty(parsedId.data, result.data);
    revalidatePath(`/partner/properties/${parsedId.data}`);
    revalidatePath("/partner/properties");
    return { status: "success", message: "Property details saved." };
  } catch {
    return { status: "error", message: "The property could not be updated in its current state." };
  }
}

export async function createRoomAction(
  propertyId: string,
  _previousState: SupplyActionState,
  formData: FormData,
): Promise<SupplyActionState> {
  const parsedId = entityIdSchema.safeParse(propertyId);
  const result = roomFormSchema.safeParse(roomInput(formData));
  if (!parsedId.success || !result.success) {
    return { status: "error", message: "Review the highlighted room fields.", errors: result.success ? undefined : result.error.flatten().fieldErrors };
  }

  try {
    await createOwnedRoom(parsedId.data, result.data);
    revalidatePath(`/partner/properties/${parsedId.data}`);
    revalidatePath("/partner/properties");
    return { status: "success", message: "Room type added." };
  } catch {
    return { status: "error", message: "The room type could not be added." };
  }
}

export async function updateRoomAction(
  propertyId: string,
  roomId: string,
  _previousState: SupplyActionState,
  formData: FormData,
): Promise<SupplyActionState> {
  const ids = z.object({ propertyId: entityIdSchema, roomId: entityIdSchema }).safeParse({ propertyId, roomId });
  const result = roomFormSchema.safeParse(roomInput(formData));
  if (!ids.success || !result.success) {
    return { status: "error", message: "Review the highlighted room fields.", errors: result.success ? undefined : result.error.flatten().fieldErrors };
  }

  try {
    await updateOwnedRoom(ids.data.roomId, result.data);
    revalidatePath(`/partner/properties/${ids.data.propertyId}`);
    return { status: "success", message: "Room type saved." };
  } catch {
    return { status: "error", message: "The room type could not be updated." };
  }
}

export async function archiveRoomAction(formData: FormData) {
  const result = z.object({ propertyId: entityIdSchema, roomId: entityIdSchema }).safeParse({
    propertyId: formData.get("propertyId"),
    roomId: formData.get("roomId"),
  });
  if (!result.success) throw new Error("Invalid room archive request.");

  await archiveOwnedRoom(result.data.roomId);
  revalidatePath(`/partner/properties/${result.data.propertyId}`);
  revalidatePath("/partner/properties");
}

export async function archivePropertyAction(formData: FormData) {
  const result = entityIdSchema.safeParse(formData.get("propertyId"));
  if (!result.success) throw new Error("Invalid property archive request.");

  await archiveOwnedProperty(result.data);
  revalidatePath("/partner");
  revalidatePath("/partner/properties");
  revalidatePath("/admin");
  revalidatePath("/admin/properties");
  revalidatePath("/search");
  redirect("/partner/properties");
}

export async function submitPropertyAction(formData: FormData) {
  const result = entityIdSchema.safeParse(formData.get("propertyId"));
  if (!result.success) throw new Error("Invalid property submission request.");

  await submitOwnedProperty(result.data);
  revalidatePath(`/partner/properties/${result.data}`);
  revalidatePath("/partner/properties");
  revalidatePath("/admin");
  revalidatePath("/admin/properties");
}

const mediaActionSchema = z.object({
  propertyId: entityIdSchema,
  mediaId: entityIdSchema,
});

function revalidatePropertyMedia(propertyId: string) {
  revalidatePath("/");
  revalidatePath("/search");
  revalidatePath("/partner");
  revalidatePath("/partner/properties");
  revalidatePath(`/partner/properties/${propertyId}`);
  revalidatePath("/admin/properties");
}

export async function archivePropertyMediaAction(formData: FormData) {
  const result = mediaActionSchema.safeParse({
    propertyId: formData.get("propertyId"),
    mediaId: formData.get("mediaId"),
  });
  if (!result.success) throw new Error("Invalid media archive request.");
  await archiveOwnedPropertyMedia(result.data.propertyId, result.data.mediaId);
  revalidatePropertyMedia(result.data.propertyId);
}

export async function setPropertyCoverAction(formData: FormData) {
  const result = mediaActionSchema.safeParse({
    propertyId: formData.get("propertyId"),
    mediaId: formData.get("mediaId"),
  });
  if (!result.success) throw new Error("Invalid cover request.");
  await setOwnedPropertyCover(result.data.propertyId, result.data.mediaId);
  revalidatePropertyMedia(result.data.propertyId);
}

export async function movePropertyMediaAction(formData: FormData) {
  const result = mediaActionSchema.extend({ direction: z.enum(["up", "down"]) }).safeParse({
    propertyId: formData.get("propertyId"),
    mediaId: formData.get("mediaId"),
    direction: formData.get("direction"),
  });
  if (!result.success) throw new Error("Invalid media reorder request.");
  await moveOwnedPropertyMedia(result.data.propertyId, result.data.mediaId, result.data.direction);
  revalidatePropertyMedia(result.data.propertyId);
}

export async function updateInventoryAction(
  propertyId: string,
  roomTypeId: string,
  _previousState: InventoryActionState,
  formData: FormData,
): Promise<InventoryActionState> {
  const ids = z.object({ propertyId: entityIdSchema, roomTypeId: entityIdSchema }).safeParse({
    propertyId,
    roomTypeId,
  });
  const result = bulkInventorySchema.safeParse({
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    priceOverride: formData.get("priceOverride"),
    totalUnitsOverride: formData.get("totalUnitsOverride"),
    stopSell: formData.get("stopSell") === "on",
  });
  if (!ids.success || !result.success) {
    return {
      status: "error",
      message: "Review the inventory date range and override values.",
      errors: result.success ? undefined : result.error.flatten().fieldErrors,
    };
  }

  try {
    await bulkUpdateOwnedInventory(ids.data.roomTypeId, result.data);
    revalidatePath(`/partner/properties/${ids.data.propertyId}`);
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath("/stays/[slug]", "page");
    return { status: "success", message: "Inventory updated for the selected date range." };
  } catch (error) {
    const safeMessage = error instanceof Error && [
      "Invalid inventory date range.",
      "Room type not found.",
      "Units cannot be lower than existing holds and bookings.",
    ].includes(error.message)
      ? error.message
      : "Inventory could not be updated.";
    return {
      status: "error",
      message: safeMessage,
    };
  }
}
