import { z } from "zod";

export const facilitySchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(3, { message: "The name must be at least 3 characters long." }),
  type: z
    .string()
    .min(3, { message: "The type must be at least 3 characters long." }),
  location: z
    .string()
    .min(3, { message: "The location must be at least 3 characters long." }),
});

export const createFacilitySchema = facilitySchema.omit({ id: true });

export const updateFacilitySchema = facilitySchema.pick({
  id: true,
  name: true,
  type: true,
  location: true,
});
