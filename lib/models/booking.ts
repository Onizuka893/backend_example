import { Prisma } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const bookingDetails = Prisma.validator<Prisma.BookingDefaultArgs>()({
  select: {
    id: true,
    facility: {
      select: {
        id: true,
        name: true,
      },
    },
    user: {
      select: {
        id: true,
        email: true,
        name: true,
      },
    },
    date: true,
    status: true,
  },
});

export type BookingDetails = Prisma.BookingGetPayload<typeof bookingDetails>;
