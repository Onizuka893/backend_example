import "server-only";
import { BookingDetails } from "../../models/booking";
import { prismaClient } from "../utils/prismaClient";

/**
 * Create a new booking.
 */
export async function createBooking(data: {
  date: Date | string;
  facilityId: string;
  userId: string;
  paymentId?: string; // Optional
}): Promise<BookingDetails> {
  const { date, facilityId, userId, paymentId } = data;
  return prismaClient.booking.create({
    data: {
      date,
      status: "Pending",
      facility: {
        connect: {
          id: facilityId, // Connect to an existing facility
        },
      },
      user: {
        connect: {
          id: userId, // Connect to an existing user
        },
      },
      payment: paymentId
        ? {
            connect: {
              id: paymentId, // Optionally connect to an existing payment
            },
          }
        : undefined, // Leave undefined if no payment is provided
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      facility: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function getBookingsForUser(
  userId: string
): Promise<BookingDetails[]> {
  return prismaClient.booking.findMany({
    where: { userId: userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      facility: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function updateBookingStatus(
  bookingId: string,
  newStatus: string
): Promise<{
  id: string;
  status: string;
}> {
  return prismaClient.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status: newStatus,
    },
    select: {
      id: true,
      status: true,
    },
  });
}
