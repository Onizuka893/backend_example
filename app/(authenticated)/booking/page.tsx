"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useServerAction } from "@/lib/hooks/useServerAction";
import { BookingDetails } from "@/lib/models/booking";
import Actions from "@/lib/server/actions";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function BookingPage() {
  const [isGetting, getBookings] = useServerAction(
    Actions.getBookingsForCurrentUser
  );
  const [bookings, setBookings] = useState<BookingDetails[] | null>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getBookings({});
      setBookings(data);
    };

    fetchData().catch(console.error);
  }, []);

  return (
    <div className="min-h-dvh w-full p-10 flex-row space-y-4">
      <div className="text-3xl font-bold text-center">My Bookings</div>
      <div className="grid grid-col-1 sm:grid-cols-2 gap-3">
        {!isGetting ? (
          bookings?.map((b) => <BookingCard key={b.id} booking={b} />)
        ) : (
          <Loader2 />
        )}
      </div>
    </div>
  );
}

interface BookingCardProps {
  booking: BookingDetails;
}

function BookingCard({ booking }: BookingCardProps) {
  // const [isUpdating, updatePaymentStatus] = useServerAction(
  //   Actions.updatePaymentStatus
  // );
  const bookingDate = booking.date;
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long", // Full day name (e.g., Thursday)
    day: "numeric", // Day of the month (e.g., 2)
    month: "long", // Full month name (e.g., January)
    year: "numeric", // Full year (e.g., 2025)
  }).format(bookingDate);
  const bookingTime = `${String(bookingDate.getUTCHours() + 1).padStart(
    2,
    "0"
  )}:${String(bookingDate.getUTCMinutes()).padStart(2, "0")}`;

  // const handleUpdateStatus = async () => {
  //   const updatedPayment = await updatePaymentStatus(payment.id);
  //   payment.status = updatedPayment?.status as string;
  // };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {bookingTime} - {formattedDate}
        </CardTitle>
        <CardDescription>booking id: {booking.id}</CardDescription>
      </CardHeader>
      <CardContent>
        <div>Facility: {booking.facility.name}</div>
        <div>Status: {booking.status}</div>
        <div>Issuing User: {booking.user.name}</div>
      </CardContent>
      {/* <CardFooter>
        {booking.status === "Pending" && !isUpdating ? (
          <Button className="bg-green-500" onClick={handleUpdateStatus}>
            Payment Made
          </Button>
        ) : (
          <Button disabled>Has been paid</Button>
        )}
      </CardFooter> */}
    </Card>
  );
}
