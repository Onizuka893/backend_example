import { hashPassword } from "@/lib/server/utils/passwordUtils";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create a User
  const user = await prisma.user.create({
    data: {
      email: "test@tester.com",
      password: hashPassword("Test123"),
      name: "John Doe",
    },
  });

  // Create a Facility
  const facility = await prisma.facility.create({
    data: {
      name: "Main Gym",
    },
  });

  // Create a Booking
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const booking = await prisma.booking.create({
    data: {
      facilityId: facility.id,
      userId: user.id,
      date: new Date("2025-01-01T10:00:00Z"),
    },
  });

  // Create a Session
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const session = await prisma.session.create({
    data: {
      id: "session1",
      userId: user.id,
      activeFrom: new Date(),
      activeUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
