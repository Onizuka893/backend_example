"use server";

import DAL from "../dal";
import { BookingDetails } from "@/lib/models/booking";
import { getSessionProfileAndOptionallyRenew } from "../mediators";
import { revalidatePath } from "next/cache";

export async function getBookingsForCurrentUser(): Promise<
  BookingDetails[] | null
> {
  const sessionProfile = await getSessionProfileAndOptionallyRenew();
  const bookings = await DAL.getBookingsForUser(sessionProfile.id);
  return bookings;
}

export async function updateBookingStatus(
  BookingId: string
): Promise<{ id: string; status: string } | null> {
  const payment = await DAL.updateBookingStatus(BookingId, "Paid");
  return payment;
}

export async function createBooking(data: {
  date: Date | string;
  facilityId: string;
  paymentId?: string;
}): Promise<BookingDetails> {
  const sessionProfile = await getSessionProfileAndOptionallyRenew();
  const dataa = { ...data, userId: sessionProfile.id };
  const booking = await DAL.createBooking(dataa);
  return booking;
}

export async function deleteBooking(bookingId: string): Promise<void> {
  await DAL.deleteBooking(bookingId);
  revalidatePath("/", "layout");
}
