import "server-only";
import { Facility, Prisma } from "@prisma/client";
import { cache } from "react";
import { Facility as FacilityModel } from "../../models/facilities";
import { prismaClient } from "../utils/prismaClient";

/**
 * Create a new user with a hashed and salted password.
 */
export async function createFacility(
  data: Prisma.FacilityCreateInput
): Promise<FacilityModel> {
  return prismaClient.facility.create({
    data: {
      ...data,
    },
    select: {
      id: true,
      name: true,
      type: true,
      location: true,
      bookings: true,
    },
  });
}

export async function getFacilities(): Promise<FacilityModel[]> {
  return prismaClient.facility.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      location: true,
      bookings: true,
    },
  });
}

/**
 * Retrieve the session and associated user profile.
 * Only return active sessions, even if a session with the given id exists.
 *
 * @param id The id of the session to retrieve.
 */
export const getFacilityById = cache(
  async (id: string): Promise<FacilityModel | null> => {
    return prismaClient.facility.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        type: true,
        location: true,
        bookings: true,
      },
    });
  }
);

export async function deleteFacility(facilityId: string): Promise<void> {
  await prismaClient.facility.delete({
    where: { id: facilityId },
  });
}

export async function updateFacility(
  facilityId: string,
  data: Prisma.FacilityUpdateInput
): Promise<Facility> {
  return prismaClient.facility.update({
    where: { id: facilityId },
    data: {
      ...data,
    },
    include: {
      bookings: true,
    },
  });
}
