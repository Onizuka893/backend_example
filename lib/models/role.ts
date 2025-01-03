import { Prisma } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const roleDetails = Prisma.validator<Prisma.RoleDefaultArgs>()({
  select: {
    id: true,
    name: true,
  },
});

export type RoleDetails = Prisma.RoleGetPayload<typeof roleDetails>;
