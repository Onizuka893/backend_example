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
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Reset time to midnight
  });

  useEffect(() => {
    const fetchData = async () => {
      const data = await getFacilities({});
      setFacilities(data);
    };

    fetchData().catch(console.error);
  }, []);

  const goToNextDay = () => {
    setSelectedDate((prev) => {
      const nextDay = new Date(prev);
      nextDay.setDate(prev.getDate() + 1);
      return nextDay;
    });
  };

  const goToPreviousDay = () => {
    setSelectedDate((prev) => {
      const today = new Date();
      const currentDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      if (prev > currentDate) {
        const previousDay = new Date(prev);
        previousDay.setDate(prev.getDate() - 1);
        return previousDay;
      }
      return prev; // Don't change if already at today
    });
  };

  // Disable the "Previous" button if selectedDate is today
  const isPreviousDisabled = () => {
    const today = new Date();
    const currentDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    return selectedDate <= currentDate;
  };

  return (
    <div>
      <div className="flex justify-between items-center px-10 pt-10 ">
        <Button
          onClick={goToPreviousDay}
          disabled={isPreviousDisabled()}
          className={`btn ${isPreviousDisabled() ? "btn-disabled" : ""}`}
        >
          Previous
        </Button>
        <div className="text-3xl font-bold">
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </div>
        <Button onClick={goToNextDay} className="btn">
          Next
        </Button>
      </div>
      <div className="flex justify-center items-start min-h-dvh min-w-full p-10">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {!isGetting &&
            facilities?.map((f) => (
              <FacilityCard
                key={f.id}
                facility={f}
                selectedDate={selectedDate}
              />
            ))}
        </div>
      </div>
    </div>
  );
}

interface FacilityCardProps {
  facility: Facility;
  selectedDate: Date;
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
                facilityId={facility.id}
                bookings={facility.bookings}
                selectedDate={selectedDate}
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
  facilityId: string;
  bookings: Booking[];
  selectedDate: Date;
}

function BookingDialog({
  facilityId,
  bookings,
  selectedDate,
}: BookingDialogProps) {
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

    const dateBooking = new Date(selectedDate);
    dateBooking.setHours(hours, minutes, 0, 0);

    console.log("Final booking date (local):", dateBooking);

    const result = await createBooking({
      date: dateBooking,
      facilityId: facilityId,
    });

    console.log("Booking created with ID:", result.id);
  };

  return (
    <div className="grid grid-cols-5 gap-2">
      {times.map((t) => {
        const isBooked = bookings.some((b) => {
          const bookingDate = new Date(b.date);

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
