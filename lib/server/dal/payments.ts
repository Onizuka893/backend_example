import "server-only";
import { Prisma } from "@prisma/client";
import { PaymentDetails } from "../../models/payment";
import { prismaClient } from "../utils/prismaClient";

/**
 * Create a new payment.
 */
export async function createPayment(
  data: Prisma.PaymentCreateInput
): Promise<PaymentDetails> {
  return prismaClient.payment.create({
    data: {
      ...data,
    },
    select: {
      id: true,
      amount: true,
      status: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          email: true,
        },
      },
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
    },
  });
}

export async function getPayments(): Promise<PaymentDetails[]> {
  return prismaClient.payment.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
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
    },
  });
}

export async function updatePaymentStatus(
  paymentId: string,
  newStatus: string
): Promise<{
  id: string;
  status: string;
}> {
  return prismaClient.payment.update({
    where: {
      id: paymentId,
    },
    data: {
      status: newStatus,
    },
    select: {
      id: true,
      status: true,
      createdAt: false,
    },
  });
}
