import { Prisma } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const notificationDetails = Prisma.validator<Prisma.NotificationDefaultArgs>()({
  select: {
    id: true,
    message: true,
    createdAt: true,
    read: true,
    user: {
      select: {
        id: true,
        email: true,
      },
    },
  },
});

export type NotificationDetails = Prisma.NotificationGetPayload<
  typeof notificationDetails
>;
