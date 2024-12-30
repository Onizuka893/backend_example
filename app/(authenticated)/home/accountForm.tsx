"use client";

import { FormEventHandler, FunctionComponent, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useServerAction from "@/lib/hooks/useServerAction";
import Actions from "@/lib/server/actions";
import { Profile } from "@/lib/models/users";
import { Loader2 } from "lucide-react";

const AccountForm: FunctionComponent<Profile> = (profile) => {
  const [name, setName] = useState<string>(profile?.name ?? "");
  const [isUpdating, updateProfile] = useServerAction(Actions.updateProfile);

  const handleFormSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault();
    // De void operator zorgt er voor dat ESLint geen foutmelding geeft over het gebruik van promises waarvoor geen
    // await, of then en catch gebruikt wordt.
    void updateProfile({ name });
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4 items-center">
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {!isUpdating ? (
        <Button type="submit" className="w-full">
          Update
        </Button>
      ) : (
        <Button type="submit" disabled className="w-full">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        </Button>
      )}

      <Button
        onClick={(evt) => {
          evt.preventDefault();
          void Actions.signOut();
        }}
        variant="destructive"
        className="w-full"
      >
        Log out
      </Button>
    </form>
  );
};

export default AccountForm;
