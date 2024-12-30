import "server-only";
import { cookies } from "next/headers";
import { Session } from "@prisma/client";

const cookieName = "sessionId";

export async function setSessionCookie(session: Session): Promise<void> {
  const awaitedCookies = await cookies();
  awaitedCookies.set({
    name: cookieName,
    value: session.id,
    // De httpOnly optie zorgt ervoor dat het cookie niet via JavaScript kan worden uitgelezen.
    // De browser leest het cookie uit en stuurt het mee met elke request naar de server.
    httpOnly: true,
    // In productie moet de secure optie aanstaan, dit zorgt ervoor dat het cookie alleen over HTTPS wordt verstuurd.
    secure: process.env.NODE_ENV === "production",
    // Deze optie zorgt ervoor dat het cookie enkel verstuurd wordt als het request gemaakt wordt naar hetzelfde
    // domein en schema (HTTP/HTTPS) dat het cookie ingesteld heeft.
    sameSite: "strict",
    // Het cookie mag uitgelezen worden/beschikbaar zijn voor de volledige website.
    path: "/",
    // Het moment waarop het cookie verwijderd wordt, in dit voorbeeld wordt een vervaltijd van 24 uur gebruikt.
    // Alhoewel 24 uur een redelijke tijd is, moet dit interval aangepast worden afhankelijk van de gevoeligheid van
    // de data die verwerkt wordt door de applicatie.
    expires: session.activeUntil,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const awaitedCookies = await cookies();
  awaitedCookies.delete(cookieName);
}

export async function getSessionId(): Promise<string | undefined> {
  return (await cookies()).get(cookieName)?.value;
}
