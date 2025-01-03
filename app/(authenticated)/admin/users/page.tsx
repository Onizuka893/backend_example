"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useServerAction,
  useServerActionMultipleParams,
} from "@/lib/hooks/useServerAction";
import { Profile } from "@/lib/models/users";
import { createUserSchema } from "@/lib/schemas/userSchema";
import Actions from "@/lib/server/actions";
import { useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Form from "@/components/form";
import SubmitButtonWithLoading from "@/components/submitButtonWithLoading";
import FormError from "@/components/formError";
import { RoleDetails } from "@/lib/models/role";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export default function UsersPage() {
  const [isGettingUsers, getUsers] = useServerAction(Actions.getUsers);
  const [isGettingRoles, getRoles] = useServerAction(Actions.getRoles);
  const [users, setUsers] = useState<Profile[] | null>([]);
  const [roles, setRoles] = useState<RoleDetails[] | null>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await getUsers({});
      setUsers(data);
    };

    const fetchRoleData = async () => {
      const data = await getRoles({});
      setRoles(data);
    };

    fetchUserData().catch(console.error);
    fetchRoleData().catch(console.error);
  }, []);

  return (
    <div className="min-h-dvh w-full p-10 flex-row space-y-4">
      <div className="grid grid-col-1 sm:grid-cols-3 gap-3">
        {!isGettingUsers && !isGettingRoles ? (
          users?.map((u) => <UserCard key={u.id} user={u} roles={roles} />)
        ) : (
          <Loader2 />
        )}
      </div>
      <div>
        <CreateUserDialog />
      </div>
    </div>
  );
}

interface UserCardProps {
  user: Profile;
  roles: RoleDetails[] | null;
}

function UserCard({ user, roles }: UserCardProps) {
  const [isDeleting, deleteUser] = useServerAction(Actions.deleteUser);

  const handleDeleteUser = async () => {
    await deleteUser(user.id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
        <CardDescription>
          <div>
            Roles: {user.roles.map((role) => role.role.name).join(", ")}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter className="sm:justify-start gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant={"destructive"}>Delete</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete?</DialogTitle>
              <DialogDescription>Ben je zeker?</DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-start">
              {isDeleting ? (
                <Button disabled variant={"destructive"}>
                  is deleting...
                </Button>
              ) : (
                <DialogClose asChild>
                  <Button variant={"destructive"} onClick={handleDeleteUser}>
                    Ja
                  </Button>
                </DialogClose>
              )}
              <DialogClose asChild>
                <Button type="button">Nee</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Update</Button>
          </DialogTrigger>
          <UpdateUserRoleDialog userId={user.id} roles={roles} />
        </Dialog>
      </CardFooter>
    </Card>
  );
}

function CreateUserDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-500">Create User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>Nieuwe User aanmaken</DialogDescription>
        </DialogHeader>

        <UserForm />

        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant={"destructive"}>
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UserForm() {
  const [actionResult, createTag] = useActionState(Actions.createUser, {
    success: false,
  });

  const hookForm = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
  });

  return (
    <Form hookForm={hookForm} action={createTag} actionResult={actionResult}>
      <div className="grid grid-cols-2 items-end gap-4">
        <div className="col-span-1">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              {...hookForm.register("name")}
              placeholder="voornaam achternaam"
              defaultValue={actionResult?.submittedData?.name ?? ""}
            />
            <FormError
              path="name"
              formErrors={hookForm.formState.errors}
              serverErrors={actionResult}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              {...hookForm.register("email")}
              placeholder="voornaam@achternaam.com"
              defaultValue={actionResult?.submittedData?.email ?? ""}
            />
            <FormError
              path="email"
              formErrors={hookForm.formState.errors}
              serverErrors={actionResult}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              {...hookForm.register("password")}
              placeholder="password"
              defaultValue={actionResult?.submittedData?.password ?? ""}
            />
            <FormError
              path="password"
              formErrors={hookForm.formState.errors}
              serverErrors={actionResult}
            />
          </div>

          <div>
            <Label htmlFor="passwordConfirmation">Password Confirmation</Label>
            <Input
              {...hookForm.register("passwordConfirmation")}
              placeholder="password confirmation"
              defaultValue={
                actionResult?.submittedData?.passwordConfirmation ?? ""
              }
            />
            <FormError
              path="passwordConfirmation"
              formErrors={hookForm.formState.errors}
              serverErrors={actionResult}
            />
          </div>
        </div>
        <div className="col-span-1 flex justify-end">
          <SubmitButtonWithLoading
            text="Create User"
            loadingText="Creating User..."
          />
        </div>
      </div>
    </Form>
  );
}

interface UpdateUserRoleDialogProps {
  userId: string;
  roles: RoleDetails[] | null;
}

function UpdateUserRoleDialog({ userId, roles }: UpdateUserRoleDialogProps) {
  const [isUpdating, updateRole] = useServerActionMultipleParams(
    Actions.updateUserProfileRole
  );
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const handleUpdateRole = async () => {
    await updateRole(userId, value);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>User Role aanpassen</DialogTitle>
        <DialogDescription>Roles toevoegen aan een user</DialogDescription>
      </DialogHeader>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-[200px] justify-between"
          >
            {value
              ? roles?.find((framework) => framework.name === value)?.name
              : "Select Role..."}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandEmpty>No Roles found.</CommandEmpty>
              <CommandGroup>
                {roles?.map((role) => (
                  <CommandItem
                    key={role.id}
                    value={role.name}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    {role.name}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === role.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogFooter className="sm:justify-start">
        <DialogClose asChild>
          {!isUpdating ? (
            <Button
              type="button"
              className="bg-green-500"
              onClick={handleUpdateRole}
            >
              Add
            </Button>
          ) : (
            <Button disabled className="bg-green-500">
              <Loader2 />
            </Button>
          )}
        </DialogClose>
        <DialogClose asChild>
          <Button type="button" variant={"destructive"}>
            Cancel
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
