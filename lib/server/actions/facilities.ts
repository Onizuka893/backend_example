"use server";

import { ActionResponse } from "@/lib/models/actions";
import DAL from "../dal";
import { Facility } from "@/lib/models/facilities";
import { getSessionProfileAndOptionallyRenew } from "../mediators";
import {
  createFacilitySchema,
  updateFacilitySchema,
} from "@/lib/schemas/facilitySchema";
import { revalidatePath } from "next/cache";

export async function getFacilities(): Promise<Facility[] | null> {
  const facilities = await DAL.getFacilities();
  return facilities;
}

export async function createFacility(
  _prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const profile = await getSessionProfileAndOptionallyRenew();
  if (!profile.roles.some((r) => r.role.name === "Admin")) {
    return {
      success: false,
      errors: { authorisation: ["User has not the right role"] },
    };
  }

  // Converteer de FormData naar een object
  const formDataObject = Object.fromEntries(formData.entries());
  const { data, error } = createFacilitySchema.safeParse(formDataObject);

  if (error) return { errors: error.flatten().fieldErrors, success: false };

  await DAL.createFacility(data);
  revalidatePath("/users");
  return { success: true };
}

export async function updateFacility(
  _prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const profile = await getSessionProfileAndOptionallyRenew();
  if (!profile.roles.some((r) => r.role.name === "Admin")) {
    return {
      success: false,
      errors: { authorisation: ["User has not the right role"] },
    };
  }

  // Converteer de FormData naar een object
  const formDataObject = Object.fromEntries(formData.entries());
  const { data, error } = updateFacilitySchema.safeParse(formDataObject);

  if (error) return { errors: error.flatten().fieldErrors, success: false };
  const updateData = {
    name: data.name,
    type: data.type,
    location: data.location,
  };
  const facilityId = data.id;

  await DAL.updateFacility(facilityId, updateData);
  revalidatePath("/facilities");
  return { success: true };
}

export async function deleteFacility(
  facilityId: string
): Promise<ActionResponse> {
  const profile = await getSessionProfileAndOptionallyRenew();
  if (!profile.roles.some((r) => r.role.name === "Admin")) {
    return {
      success: false,
      errors: { authorisation: ["User has not the right role"] },
    };
  }

  await DAL.deleteFacility(facilityId);
  revalidatePath("/facilities");
  return { success: true };
}
