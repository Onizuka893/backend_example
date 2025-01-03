import { getSessionProfileOrRedirect } from "@/lib/server/mediators";
import AccountForm from "./accountForm";

export default async function AccountPage() {
  const profile = await getSessionProfileOrRedirect();
  return (
    <div className="flex justify-center items-center w-dvw min-h-dvh">
      <div className="flex-row justify-center items-center p-5">
        <div>Hello to Home: {profile.name}</div>
        <div>
          Roles: {profile.roles.map((role) => role.role.name).join(", ")}
        </div>
        <AccountForm
          id={profile.id}
          email={profile.email}
          name={profile.name}
          roles={profile.roles}
        />
      </div>
    </div>
  );
}
