"use server";

import DAL from "../dal";
import { redirect } from "next/navigation";
import { Profile } from "@/lib/models/users";
import { Prisma } from "@prisma/client";
import {
  clearSessionCookie,
  getSessionId,
  setSessionCookie,
  verifyPassword,
} from "../utils";
import { revalidatePath } from "next/cache";
import { getSessionProfileAndOptionallyRenew } from "../mediators";

interface SignInOrRegisterParams {
  email: string;
  password: string;
  name?: string;
}

export async function signInOrRegister(
  params: SignInOrRegisterParams
): Promise<void> {
  let profile: Profile | null = null;
  if (params.name !== undefined) {
    profile = await DAL.createUser({ ...params, name: params.name });
  } else {
    const user = await DAL.getUserByEmail(params.email);

    // In de volgende les wordt besproken hoe we foutmeldingen en validaties kunnen doen in een server action.
    if (!user) throw new Error("No user found");

    const isValidPassword = verifyPassword(user.password, params.password);

    if (!isValidPassword)
      throw new Error(
        "No user found with the provided user/password combination."
      );

    profile = user;
  }

  // Een sessie aanmaken in de database is niet voldoende, we moeten de sessie ook doorgeven aan de gebruiken.
  // Hiervoor gebruiken we een cookie.
  const session = await DAL.startSession(profile.id);
  await setSessionCookie(session);

  // De gebruiker is ingelogd, dus redirecten we naar de contactenpagina.
  redirect("/home");
}

export async function register(params: {
  email: string;
  password: string;
  name: string;
}): Promise<void> {
  // Create a new user profile
  const profile = await DAL.createUser({ ...params });

  // Create a session for the new user
  const session = await DAL.startSession(profile.id);
  await setSessionCookie(session);

  // Redirect the user to the contacts page after successful registration
  redirect("/home");
}

export async function signIn(params: {
  email: string;
  password: string;
}): Promise<void> {
  // Fetch the user by email
  const user = await DAL.getUserByEmail(params.email);

  // Validate user existence
  if (!user) {
    throw new Error("No user found");
  }

  // Verify the provided password
  const isValidPassword = verifyPassword(user.password, params.password);
  if (!isValidPassword) {
    throw new Error(
      "No user found with the provided email/password combination."
    );
  }

  // Create a session for the signed-in user
  const session = await DAL.startSession(user.id);
  await setSessionCookie(session);

  // Redirect the user to the contacts page after successful sign-in
  redirect("/home");
}

export async function signOut(): Promise<void> {
  const sessionId = await getSessionId();
  if (sessionId) {
    await DAL.stopSession(sessionId);
    await clearSessionCookie();
  }
}

export async function updateProfile(
  profile: Prisma.UserUpdateInput
): Promise<void> {
  const sessionProfile = await getSessionProfileAndOptionallyRenew();
  await DAL.updateUser(sessionProfile.id, profile);
  revalidatePath("/", "layout");
}
