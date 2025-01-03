"use server";

import DAL from "../dal";
import { RoleDetails } from "@/lib/models/role";

export async function getRoles(): Promise<RoleDetails[] | null> {
  const roles = await DAL.getRoles();
  return roles;
}
