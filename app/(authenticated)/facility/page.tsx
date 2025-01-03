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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useServerAction } from "@/lib/hooks/useServerAction";
import { Facility } from "@/lib/models/facilities";
import Actions from "@/lib/server/actions";
import { useEffect, useState } from "react";

export default function FacilityPage() {
  const [isGetting, getFacilities] = useServerAction(Actions.getFacilities);
  const [facilities, setFacilities] = useState<Facility[] | null>([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // Track the currently selected date

  // Format the selected date for display
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long", // Full day name (e.g., Thursday)
    day: "numeric", // Day of the month (e.g., 2)
    month: "long", // Full month name (e.g., January)
    year: "numeric", // Full year (e.g., 2025)
  }).format(selectedDate);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getFacilities({});
      setFacilities(data);
    };

    fetchData().catch(console.error);
  }, []);

  // Handlers for changing the date
  const handlePreviousDay = () => {
    setSelectedDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setSelectedDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(prevDate.getDate() + 1);
      return newDate;
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center px-10 pt-10">
        <Button onClick={handlePreviousDay}>Previous Day</Button>
        <div className="text-3xl font-bold">{formattedDate}</div>
        <Button onClick={handleNextDay}>Next Day</Button>
      </div>
      <div className="flex justify-center items-start min-h-dvh min-w-full p-10">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {!isGetting &&
            facilities?.map((f) => (
              <FacilityCard
                key={f.id}
                facility={f}
                selectedDate={selectedDate} // Pass selected date
              />
            ))}
        </div>
      </div>
    </div>
  );
}

interface FacilityCardProps {
  facility: Facility;
  selectedDate: Date; // Accept selected date as a prop
}

function FacilityCard({ facility, selectedDate }: FacilityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{facility.name}</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <div>Type: {facility.type}</div>
        <div>Location: {facility.location}</div>
      </CardContent>
      <CardFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Book Moment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nieuwe Moment Booken</DialogTitle>
              <DialogDescription>
                Klik op het beschikbare moment dat je wil booken (rode knoppen
                zijn al eerder gebooked)
              </DialogDescription>
              <BookingDialog
                bookings={facility.bookings}
                selectedDate={selectedDate} // Pass selected date to BookingDialog
              />
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}

interface Booking {
  id: string;
  facilityId: string;
  userId: string;
  date: Date;
}

interface BookingDialogProps {
  bookings: Booking[];
  selectedDate: Date; // Accept selected date as a prop
}

function BookingDialog({ bookings, selectedDate }: BookingDialogProps) {
  const [isCreating, createBooking] = useServerAction(Actions.createBooking);
  const times = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
  ];

  const handleCreateBooking = async (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);

    // Create a new Date object based on the selected date
    const dateBooking = new Date(selectedDate);
    dateBooking.setHours(hours, minutes, 0, 0);

    console.log("Final booking date (local):", dateBooking);

    const result = await createBooking({
      date: dateBooking,
      facilityId: bookings[0]?.facilityId, // Ensure bookings[0] exists
    });

    console.log("Booking created with ID:", result.id);
  };

  return (
    <div className="grid grid-cols-5 gap-2">
      {times.map((t) => {
        const isBooked = bookings.some((b) => {
          const bookingDate = new Date(b.date);

          // Convert both the booking time and selected date to local time for comparison
          const bookingYear = bookingDate.getFullYear();
          const bookingMonth = bookingDate.getMonth();
          const bookingDay = bookingDate.getDate();
          const bookingHour = bookingDate.getHours();

          const buttonDate = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            parseInt(t.split(":")[0], 10) // Button time's hour in local time
          );

          // Check if the local times match
          return (
            bookingYear === buttonDate.getFullYear() &&
            bookingMonth === buttonDate.getMonth() &&
            bookingDay === buttonDate.getDate() &&
            bookingHour === buttonDate.getHours()
          );
        });

        return (
          <Dialog key={t}>
            <DialogTrigger asChild>
              <Button
                variant={isBooked ? "destructive" : "default"}
                disabled={isBooked}
              >
                {t}
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[200px]">
              <DialogHeader>
                <DialogTitle>Ben je Zeker?</DialogTitle>
                <DialogDescription>
                  Bedrag is ${(Math.random() * 10).toFixed(2)}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-start">
                <Button
                  onClick={async () => await handleCreateBooking(t)}
                  disabled={isCreating}
                >
                  Betaal
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant={"destructive"}>
                    Nee
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })}
    </div>
  );
}
