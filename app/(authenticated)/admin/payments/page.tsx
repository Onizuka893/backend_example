"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useServerAction } from "@/lib/hooks/useServerAction";
import { PaymentDetails } from "@/lib/models/payment";
import Actions from "@/lib/server/actions";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function PaymentsPage() {
  const [isGetting, getPayments] = useServerAction(Actions.getPayments);
  const [payments, setPayments] = useState<PaymentDetails[] | null>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getPayments({});
      setPayments(data);
    };

    fetchData().catch(console.error);
  }, []);

  return (
    <div className="min-h-dvh w-full p-10 flex-row space-y-4">
      <div className="text-4xl border bg-slate-100 rounded-md text-center p-3 m-3">
        Total Amount Received: $
        {payments?.reduce((total, p) => total + p.amount, 0).toFixed(2)}
      </div>
      <div className="grid grid-col-1 sm:grid-cols-3 gap-3">
        {!isGetting ? (
          payments?.map((p) => <PaymentCard key={p.id} payment={p} />)
        ) : (
          <Loader2 />
        )}
      </div>
    </div>
  );
}

interface PaymentCardProps {
  payment: PaymentDetails;
}

function PaymentCard({ payment }: PaymentCardProps) {
  const [isUpdating, updatePaymentStatus] = useServerAction(
    Actions.updatePaymentStatus
  );
  const bookingDate = payment.booking.date;
  const bookingTime = `${String(bookingDate.getUTCHours()).padStart(
    2,
    "0"
  )}:${String(bookingDate.getUTCMinutes()).padStart(2, "0")}`;

  const handleUpdateStatus = async () => {
    const updatedPayment = await updatePaymentStatus(payment.id);
    payment.status = updatedPayment?.status as string;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment: {payment.id}</CardTitle>
        <CardDescription>User: {payment.user.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <div>Amount: ${payment.amount.toFixed(2)}</div>
        <div>Status: {payment.status}</div>
        <div>Created At: {payment.createdAt.toLocaleDateString()}</div>
        <div>Booked Facility: {payment.booking.facility.name}</div>
        <div>
          Booked Date:{" "}
          {payment.booking.date.toLocaleDateString() + " - " + bookingTime}
        </div>
      </CardContent>
      <CardFooter>
        {payment.status === "Pending" && !isUpdating ? (
          <Button className="bg-green-500" onClick={handleUpdateStatus}>
            Payment Made
          </Button>
        ) : (
          <Button disabled>Has been paid</Button>
        )}
      </CardFooter>
    </Card>
  );
}
