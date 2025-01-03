"use server";

import DAL from "../dal";
import { PaymentDetails } from "@/lib/models/payment";

export async function getPayments(): Promise<PaymentDetails[] | null> {
  const payments = await DAL.getPayments();
  return payments;
}

export async function updatePaymentStatus(
  PaymentId: string
): Promise<{ id: string; status: string } | null> {
  const payment = await DAL.updatePaymentStatus(PaymentId, "Paid");
  return payment;
}
