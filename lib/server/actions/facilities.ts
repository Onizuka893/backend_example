"use server";

import DAL from "../dal";
import { Facility } from "@/lib/models/facilities";

export async function getFacilities(): Promise<Facility[] | null> {
  const facilities = await DAL.getFacilities();
  return facilities;
}
