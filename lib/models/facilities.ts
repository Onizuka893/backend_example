import { Prisma } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const facility = Prisma.validator<Prisma.FacilityDefaultArgs>()({
  select: {
    id: true,
    name: true,
    type: true,
    location: true,
    bookings: true,
  },
});

export type Facility = Prisma.FacilityGetPayload<typeof facility>;
