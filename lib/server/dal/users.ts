import "server-only";
import { Prisma, Session } from "@prisma/client";
import { randomBytes } from "crypto";
import { cache } from "react";
import { hashPassword } from "../utils/passwordUtils";
import { Profile, SessionProfile, User } from "../../models/users";
import { prismaClient } from "../utils/prismaClient";

/**
 * Create a new user with a hashed and salted password.
 */
export async function createUser(
  data: Prisma.UserCreateInput
): Promise<Profile> {
  const defaultRole = await prismaClient.role.findUnique({
    where: { name: "User" }, // Adjust this to the role you want as default
  });

  if (!defaultRole) {
    throw new Error("Default role not found.");
  }

  return prismaClient.user.create({
    data: {
      ...data,
      password: hashPassword(data.password),
      roles: {
        create: [
          {
            role: {
              connectOrCreate: {
                where: {
                  id: defaultRole.id,
                },
                create: {
                  name: "User",
                },
              },
            },
          },
        ],
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      roles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function getUsers(): Promise<Profile[]> {
  return prismaClient.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      roles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Retrieve a user by email.
 * The result includes the hashed password and should therefore NEVER be exposed to the client.
 *
 * @param email The email address of the user to retrieve.
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  return prismaClient.user.findFirst({
    where: { email },
    include: {
      roles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Create a new session for the given user.
 *
 * @param userId
 */
export async function startSession(userId: string): Promise<Session> {
  // We maken hier een nieuw id aan via de randomBytes functie van Node.js.
  // Dit is een cryptografisch veilige functie om willekeurige strings te genereren.
  // Een V4 UUID is ook een goede optie, de randomBytes functie wordt hier gebruikt ter illustratie.
  // Deze functie is nuttig als je een unieke identifier hebt om een applicatie te ondertekenen.
  const id = randomBytes(32).toString("hex");
  return prismaClient.session.create({
    data: {
      id,
      userId,
      activeFrom: new Date(),
    },
  });
}

/**
 * Retrieve the session and associated user profile.
 * Only return active sessions, even if a session with the given id exists.
 *
 * @param id The id of the session to retrieve.
 */
export const getSessionProfile = cache(
  async (id: string): Promise<SessionProfile | null> => {
    return prismaClient.session.findUnique({
      where: {
        id,
        activeUntil: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            roles: {
              select: {
                role: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }
);

/**
 * Stop the session with the given id.
 *
 * @param id The id of the session to stop.
 */
export async function stopSession(id: string): Promise<void> {
  await prismaClient.session.delete({ where: { id } });
}

/**
 * Extend the session with the given id for 24 hours.
 *
 * @param id The id of the session to extend.
 */
export async function extendSession(id: string): Promise<Session> {
  return prismaClient.session.update({
    where: { id },
    data: {
      activeUntil: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });
}

export async function updateUser(
  userId: string,
  data: Prisma.UserUpdateInput
): Promise<Profile> {
  return prismaClient.user.update({
    where: { id: userId },
    data: {
      ...data,
      id: userId,
    },
    include: {
      roles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function updateUserRole(
  userId: string,
  roleName: string
): Promise<Profile> {
  const role = await prismaClient.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    throw new Error(`Role with name ${roleName} not found.`);
  }

  return prismaClient.user.update({
    where: { id: userId },
    data: {
      roles: {
        create: [
          {
            role: {
              connectOrCreate: {
                where: {
                  id: role.id,
                },
                create: {
                  name: "Undefined",
                },
              },
            },
          },
        ],
      },
    },
    include: {
      roles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}

export async function deleteUser(userId: string): Promise<void> {
  await prismaClient.session.deleteMany({
    where: { userId },
  });

  await prismaClient.booking.deleteMany({
    where: { userId },
  });

  await prismaClient.user.delete({
    where: { id: userId },
  });
}
