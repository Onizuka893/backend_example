import { Prisma } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const userRoleDetails = Prisma.validator<Prisma.UserRoleDefaultArgs>()({
  select: {
    id: true,
    user: {
      select: {
        id: true,
        email: true,
        name: true,
      },
    },
    role: {
      select: {
        id: true,
        name: true,
      },
    },
  },
});

export type UserRoleDetails = Prisma.UserRoleGetPayload<typeof userRoleDetails>;
