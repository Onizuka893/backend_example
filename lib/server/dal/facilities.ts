import "server-only";
import { Prisma } from "@prisma/client";
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
      bookings: true,
    },
  });
}

export async function getFacilities(): Promise<FacilityModel[]> {
  return prismaClient.facility.findMany({
    select: {
      id: true,
      name: true,
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
        bookings: true,
      },
      //   include: {
      //     bookings: {
      //       select: {
      //         id: true,
      //         date: true,
      //       },
      //     },
      //   },
    });
  }
);

// export async function updateFacility(
//   facilityId: string,
//   data: Prisma.FacilityUpdateInput
// ): Promise<FacilityModel> {
//   return prismaClient.facility.update({
//     where: { id: facilityId },
//     data: {
//       ...data,
//       id: facilityId,
//     },
//   });
// }
