import { Prisma } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const paymentDetails = Prisma.validator<Prisma.PaymentDefaultArgs>()({
  select: {
    id: true,
    amount: true,
    status: true,
    createdAt: true,
    booking: {
      select: {
        id: true,
        date: true,
        facility: {
          select: {
            name: true,
          },
        },
      },
    },
    user: {
      select: {
        id: true,
        email: true,
      },
    },
  },
});

export type PaymentDetails = Prisma.PaymentGetPayload<typeof paymentDetails>;
