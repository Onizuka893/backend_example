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
import { ActionResponse } from "@/lib/models/actions";
import { createUserSchema, loginSchema } from "@/lib/schemas/userSchema";
import { formAction } from "@/lib/server/mediators";

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

export async function register(
  _prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  return formAction(createUserSchema, formData, async (data) => {
    const input = { ...data } as Prisma.UserCreateInput & {
      passwordConfirmation?: string;
    };
    delete input.passwordConfirmation; // Remove unnecessary field

    // Create a new user
    const profile = await DAL.createUser(input);

    // Start a session for the new user
    const session = await DAL.startSession(profile.id);
    await setSessionCookie(session);

    // Redirect to the contacts page
    redirect("/home");
  });
}

export async function signIn(
  _prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  return formAction(loginSchema, formData, async (data) => {
    // Get user by email
    const user = await DAL.getUserByEmail(data?.email);

    // Define error response in case of invalid login
    const errorResponse = {
      errors: {
        errors: ["No user found with the provided user/password combination."],
      },
      success: false,
    };
    if (!user) return errorResponse;

    // Verify the password
    const isValidPassword = verifyPassword(user.password, data.password);
    if (!isValidPassword) return errorResponse;

    // Start a session for the user
    const session = await DAL.startSession(user.id);
    await setSessionCookie(session);

    // Redirect to the contacts page
    redirect("/home");
  });
}

export async function signOut(): Promise<void> {
  const sessionId = await getSessionId();
  if (sessionId) {
    await DAL.stopSession(sessionId);
    await clearSessionCookie();
  }
}

export async function getUsers(): Promise<Profile[] | null> {
  const users = await DAL.getUsers();
  return users;
}

export async function updateProfile(
  profile: Prisma.UserUpdateInput
): Promise<void> {
  const sessionProfile = await getSessionProfileAndOptionallyRenew();
  await DAL.updateUser(sessionProfile.id, profile);
  revalidatePath("/", "layout");
}

export async function updateUserProfileRole(
  userId: string,
  role: string
): Promise<void> {
  await DAL.updateUserRole(userId, role);
  revalidatePath("/", "layout");
}

export async function deleteUser(userId: string): Promise<void> {
  await DAL.deleteUser(userId);
  revalidatePath("/", "layout");
}

export async function createUser(
  _prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const profile = await getSessionProfileAndOptionallyRenew();
  if (!profile.roles.some((r) => r.role.name === "Admin")) {
    return {
      success: false,
      errors: { authorisation: ["User had not the right roles"] },
    };
  }

  // Converteer de FormData naar een object
  const formDataObject = Object.fromEntries(formData.entries());
  const { data, error } = createUserSchema.safeParse(formDataObject);

  if (error) return { errors: error.flatten().fieldErrors, success: false };

  const createData = {
    email: data.email,
    password: data.password,
    name: data.name,
  };

  await DAL.createUser(createData);
  revalidatePath("/users");
  return { success: true };
}
