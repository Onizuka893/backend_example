import { Prisma } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const profile = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: {
    id: true,
    email: true,
    name: true,
  },
});

export type Profile = Prisma.UserGetPayload<typeof profile>;

const SessionProfile = Prisma.validator<Prisma.SessionDefaultArgs>()({
  select: {
    id: true,
    activeUntil: true,
    user: {
      select: {
        id: true,
        email: true,
        name: true,
      },
    },
  },
});

export type SessionProfile = Prisma.SessionGetPayload<typeof SessionProfile>;
