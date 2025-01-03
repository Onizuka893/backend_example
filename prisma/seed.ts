/* eslint-disable @typescript-eslint/no-unused-vars */
import { hashPassword } from "@/lib/server/utils/passwordUtils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create two Roles: Admin and User
  const adminRole = await prisma.role.create({
    data: {
      name: "Admin",
    },
  });

  const userRole = await prisma.role.create({
    data: {
      name: "User",
    },
  });

  // Create a User
  const user = await prisma.user.create({
    data: {
      email: "user@user.com",
      password: hashPassword("User1234"),
      name: "User user",
      roles: {
        create: [{ roleId: userRole.id }],
      },
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@admin.com",
      password: hashPassword("Admin1234"),
      name: "Admin admin",
      roles: {
        create: [{ roleId: adminRole.id }, { roleId: userRole.id }],
      },
    },
  });

  // Create 10 Facilities
  const facilities = await prisma.facility.createMany({
    data: Array.from({ length: 10 }, (_, i) => ({
      name: `Facility ${i + 1}`,
      type: i % 2 === 0 ? "Gym" : "Meeting Room",
      location: `City ${i + 1}`,
    })),
  });

  // Fetch all facility IDs for reference
  const facilityList = await prisma.facility.findMany();

  function generateSingleUtcDateForBooking(): Date {
    const today = new Date();

    // Set the start of the day (local time)
    today.setHours(0, 0, 0, 0);

    // Randomly select a day (0 = today, 1 = tomorrow, 2 = two days later)
    const randomDayOffset = Math.floor(Math.random() * 3); // 0, 1, or 2
    const selectedDate = new Date(today);
    selectedDate.setDate(today.getDate() + randomDayOffset);

    // Randomly select an hour between 08:00 and 21:00
    const randomHour = Math.floor(Math.random() * (21 - 8 + 1)) + 8; // 8 to 21
    selectedDate.setUTCHours(randomHour, 0, 0, 0); // Set to UTC

    return selectedDate;
  }

  // Create 10 Bookings
  const bookings = await prisma.booking.createMany({
    data: Array.from({ length: 10 }, (_, i) => ({
      facilityId: facilityList[i % facilityList.length].id,
      userId: user.id,
      date: generateSingleUtcDateForBooking(),
      status: i % 2 === 0 ? "Confirmed" : "Pending",
    })),
  });

  // Fetch all booking IDs for reference
  const bookingList = await prisma.booking.findMany();

  // Create 10 Payments
  const payments = await prisma.payment.createMany({
    data: Array.from({ length: 10 }, (_, i) => ({
      userId: user.id,
      bookingId: bookingList[i % bookingList.length].id,
      amount: parseFloat((Math.random() * 100).toFixed(2)), // Random payment amount
      status: i % 3 === 0 ? "Paid" : "Pending", // Random statuses
      createdAt: new Date(new Date().setDate(new Date().getDate() - i)),
    })),
  });

  // Create 10 Notifications
  const notifications = await prisma.notification.createMany({
    data: Array.from({ length: 10 }, (_, i) => ({
      userId: user.id,
      message: `This is notification ${i + 1}`,
      createdAt: new Date(new Date().setDate(new Date().getDate() - i)),
      read: i % 2 === 0, // Mark even notifications as read
    })),
  });

  console.log("Database seeded successfully with 10 entries per table!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
