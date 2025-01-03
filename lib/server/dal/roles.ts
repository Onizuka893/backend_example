import "server-only";
import { RoleDetails } from "../../models/role";
import { prismaClient } from "../utils/prismaClient";

export async function getRoles(): Promise<RoleDetails[] | null> {
  return prismaClient.role.findMany({
    select: {
      id: true,
      name: true,
    },
  });
}
