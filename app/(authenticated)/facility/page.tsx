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
import useServerAction from "@/lib/hooks/useServerAction";
import { Facility } from "@/lib/models/facilities";
import Actions from "@/lib/server/actions";
import { useEffect, useState } from "react";

export default function FacilityPage() {
  const [isGetting, getFacilities] = useServerAction(Actions.getFacilities);
  const [facilities, setFacilities] = useState<Facility[] | null>([]);
  const currentDate = new Date();
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long", // Full day name (e.g., Thursday)
    day: "numeric", // Day of the month (e.g., 2)
    month: "long", // Full month name (e.g., January)
    year: "numeric", // Full year (e.g., 2025)
  }).format(currentDate);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getFacilities({});
      setFacilities(data);
    };

    fetchData().catch(console.error);
  }, []);

  return (
    <div>
      <div className="text-3xl font-bold px-10 pt-10">{formattedDate}</div>
      <div className="flex justify-center items-start min-h-dvh min-w-full p-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {!isGetting &&
            facilities?.map((f) => <FacilityCard key={f.id} facility={f} />)}
        </div>
      </div>
    </div>
  );
}

interface FacilityCardProps {
  facility: Facility;
}

function FacilityCard({ facility }: FacilityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{facility.name}</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent></CardContent>
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
              <BookingDialog bookings={facility.bookings} />
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
}

function BookingDialog({ bookings }: BookingDialogProps) {
  const times = [
    "07:00",
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

  const today = new Date();
  const todayStart = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  ); // UTC midnight

  return (
    <div className="grid grid-cols-5 gap-2">
      {times.map((t) => {
        const isBooked = bookings.some((b) => {
          const bookingDate = new Date(b.date);

          // Check if the booking is on the current day (UTC)
          const isSameDay =
            bookingDate.getUTCFullYear() === todayStart.getUTCFullYear() &&
            bookingDate.getUTCMonth() === todayStart.getUTCMonth() &&
            bookingDate.getUTCDate() === todayStart.getUTCDate();

          // Check if the time matches (UTC)
          const bookingTime = `${String(bookingDate.getUTCHours()).padStart(
            2,
            "0"
          )}:${String(bookingDate.getUTCMinutes()).padStart(2, "0")}`;

          return isSameDay && bookingTime === t; // Match both day and time
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
                <DialogDescription></DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-start">
                <Button>Ja</Button>
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
