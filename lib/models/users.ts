import { Prisma } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const profile = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: {
    id: true,
    email: true,
    name: true,
    roles: {
      select: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
  },
});

export type Profile = Prisma.UserGetPayload<typeof profile>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const user = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: {
    id: true,
    email: true,
    name: true,
    password: true,
    roles: {
      select: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
  },
});

export type User = Prisma.UserGetPayload<typeof user>;

const SessionProfile = Prisma.validator<Prisma.SessionDefaultArgs>()({
  select: {
    id: true,
    activeUntil: true,
    user: {
      select: {
        id: true,
        email: true,
        name: true,
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    },
  },
});

export type SessionProfile = Prisma.SessionGetPayload<typeof SessionProfile>;

const UserWithRoles = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: {
    id: true,
    email: true,
    name: true,
    roles: {
      select: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },
  },
});

export type UserWithRoles = Prisma.UserGetPayload<typeof UserWithRoles>;
