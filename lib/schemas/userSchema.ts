import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "The password must be at least 8 characters long." })
    .max(100, { message: "The password can't be longer than 100 characters." }),
  name: z
    .string()
    .min(3, { message: "The name must be at least 3 characters long." }),
});

export const loginSchema = userSchema.pick({ email: true, password: true });

export const createUserSchema = userSchema
  .omit({ id: true })
  // Via extend kunnen we een bestaand schema uitbreiden met extra velden.
  .extend({
    passwordConfirmation: z.string(),
  })
  // De refine methode, die beschikbaar is op properties en het schema zelf, kan gebruikt worden om extra validatie toe
  // te voegen die niet standaard aanwezig is in Zod.
  .refine((data) => data.password === data.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "The password and confirmation do not match.",
  });

export const updateUserSchema = userSchema.pick({ name: true });
