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
      password: hashPassword("User123"),
      name: "User user",
      roles: {
        create: [{ roleId: userRole.id }],
      },
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@admin.com",
      password: hashPassword("Admin123"),
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

  // Create 10 Bookings
  const bookings = await prisma.booking.createMany({
    data: Array.from({ length: 10 }, (_, i) => ({
      facilityId: facilityList[i % facilityList.length].id,
      userId: user.id,
      date: new Date(new Date().setDate(new Date().getDate() + i)),
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
