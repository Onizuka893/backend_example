import { getSessionProfileOrRedirect } from "@/lib/server/mediators";

export default async function HomePage() {
  const profile = await getSessionProfileOrRedirect();
  return (
    <div className="flex justify-center items-center w-dvw min-h-dvh">
      <div className="flex-row justify-center items-center p-5">
        <div>Hello to Home: {profile.name}</div>
      </div>
    </div>
  );
}
