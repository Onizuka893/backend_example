import { ActionResponse } from "@/lib/models/actions";
import { Profile } from "@/lib/models/users";
import { z, ZodSchema } from "zod";
import { getSessionProfileAndOptionallyRenew } from "./index";

interface Error {
  message: string;
}

type UnprotectedFormAction<T extends ZodSchema> = (
  validatedData: z.infer<T>
) => Promise<ActionResponse | void>;
type ProtectedFormAction<T extends ZodSchema> = (
  validatedData: z.infer<T>,
  profile: Profile
) => Promise<ActionResponse | void>;

export async function formAction<T extends ZodSchema>(
  schema: T,
  unvalidatedData: FormData,
  fn: ProtectedFormAction<T>
): Promise<ActionResponse> {
  try {
    const profile =
      fn.length > 1 ? await getSessionProfileAndOptionallyRenew() : undefined;
    const { data, errors } = validateSchema(schema, unvalidatedData);
    if (errors)
      return {
        errors,
        success: false,
        submittedData: Object.fromEntries(unvalidatedData.entries()) as Record<
          string,
          string
        >,
      };

    // Het is noodzakelijk om hier een await te gebruiken.
    // Als we fn rechtstreeks teruggeven worden eventuele opgegooide errors niet opgevangen, maar teruggegeven via de
    // catch methode van de promise.
    const result = await (profile
      ? fn(data, profile)
      : (fn as UnprotectedFormAction<T>)(data));
    return result ?? { success: true };
  } catch (e) {
    const error = e as Error;

    // De redirect functie werkt door een error op te gooien, we mogen deze error dus niet onderscheppen maar moeten
    // deze terug opgooien zodat Next de gebruiker kan redirecten.
    if (error.message === "NEXT_REDIRECT") {
      throw e;
    }

    console.error("Error in formAction:", error);

    return {
      errors: {
        errors: [
          error.message === "User not logged in"
            ? "Not authorized"
            : "Something went wrong, please try again",
        ],
      },
      success: false,
    };
  }
}

type ValidationResult<T> =
  | { data: null; errors: Record<string, string[] | undefined> }
  | { data: T; errors: null };

/**
 * Validate the given data against the given ZodSchema.
 *
 * @param schema The schema to validate the data against.
 * @param data The data to validate, either FormData or a plain object.
 * @return An object which either contains the validated data or the validation errors.
 */
export function validateSchema<T extends ZodSchema>(
  schema: T,
  data: unknown
): ValidationResult<z.infer<T>> {
  const result = schema.safeParse(
    data instanceof FormData ? convertFormData(data) : data
  );
  return result.success
    ? { data: result.data as z.infer<T>, errors: null }
    : { data: null, errors: result.error.flatten().fieldErrors };
}

export function convertFormData<T>(data: FormData): T {
  const result: Record<string, unknown> = {};

  // Voeg alle top-level keys toe aan het resultaat.
  Array.from(data.keys())
    .filter((key) => !key.includes("."))
    .forEach((key) => (result[key] = data.get(key)));

  // Vorm geneste form data met keys zoals arrayName.index.key en objectNaam.object.key om naar een object.
  const multipartKeys = Array.from(data.keys()).filter((key) =>
    key.includes(".")
  );
  // Sorteer zodat we eerst de elementen op positie 0 in de array krijgen en dan de elementen op positie 1, enz.
  multipartKeys.sort();

  for (const multipartKey of multipartKeys) {
    const keyParts = multipartKey.split(".");
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    let current: any = result;

    for (let i = 0; i < keyParts.length; i++) {
      const keyPart = keyParts[i];

      // Als dit het laatste element is, moet dit de naam van een property zijn.
      if (i === keyParts.length - 1) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        current[keyPart] = data.get(multipartKey);
        continue;
      }

      // Als de key nog niet in het resultaat zit moet deze aangemaakt worden.
      // De key kan al bestaand als deze voorkwam in een eerder verwerkte multi-part key
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!current[keyPart]) {
        // Als de volgende key een nummer is, moeten we een array aanmaken omdat het nummer een index is.
        // In het andere geval moeten we een object aanmaken.

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        current[keyPart] = isNaN(parseInt(keyParts[i + 1])) ? {} : [];
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
      current = current[keyPart];
    }
  }

  return result as T;
}
