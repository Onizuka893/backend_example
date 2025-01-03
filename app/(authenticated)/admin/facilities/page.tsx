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
import { useServerAction } from "@/lib/hooks/useServerAction";
import Actions from "@/lib/server/actions";
import { useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Form from "@/components/form";
import SubmitButtonWithLoading from "@/components/submitButtonWithLoading";
import FormError from "@/components/formError";
import { Loader2 } from "lucide-react";
import { Facility } from "@/lib/models/facilities";
import {
  createFacilitySchema,
  updateFacilitySchema,
} from "@/lib/schemas/facilitySchema";

export default function FacilitiesCrudPage() {
  const [isGettingFacilities, getFacilities] = useServerAction(
    Actions.getFacilities
  );
  const [facilities, setFacilities] = useState<Facility[] | null>([]);

  useEffect(() => {
    const fetchFacilityData = async () => {
      const data = await getFacilities({});
      setFacilities(data);
    };

    fetchFacilityData().catch(console.error);
  }, []);

  return (
    <div className="min-h-dvh w-full p-10 flex-row space-y-4">
      <div className="grid grid-col-1 sm:grid-cols-3 gap-3">
        {!isGettingFacilities ? (
          facilities?.map((f) => <FacilityCard key={f.id} facility={f} />)
        ) : (
          <Loader2 />
        )}
      </div>
      <div>
        <CreateFacilityDialog />
      </div>
    </div>
  );
}

interface FacilityCardProps {
  facility: Facility;
}

function FacilityCard({ facility }: FacilityCardProps) {
  const [isDeleting, deleteFacility] = useServerAction(Actions.deleteFacility);

  const handleDeleteFacility = async () => {
    await deleteFacility(facility.id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{facility.name}</CardTitle>
        <CardDescription>
          <div>location: {facility.location}</div>
          <div>type: {facility.type}</div>
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
                  <Button
                    variant={"destructive"}
                    onClick={handleDeleteFacility}
                  >
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
          <UpdateFacilityDialog facility={facility} />
        </Dialog>
      </CardFooter>
    </Card>
  );
}

function CreateFacilityDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-500">Create Facility</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Facility</DialogTitle>
          <DialogDescription>Nieuwe Facility aanmaken</DialogDescription>
        </DialogHeader>

        <FacilityCreateForm />

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

function FacilityCreateForm() {
  const [actionResult, createFacility] = useActionState(
    Actions.createFacility,
    {
      success: false,
    }
  );

  const hookForm = useForm<z.infer<typeof createFacilitySchema>>({
    resolver: zodResolver(createFacilitySchema),
  });

  return (
    <Form
      hookForm={hookForm}
      action={createFacility}
      actionResult={actionResult}
    >
      <div className="grid grid-cols-2 items-end gap-4">
        <div className="col-span-1">
          {/* Name Field */}
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              {...hookForm.register("name")}
              placeholder="name"
              defaultValue={actionResult?.submittedData?.name ?? ""}
            />
            <FormError
              path="name"
              formErrors={hookForm.formState.errors}
              serverErrors={actionResult}
            />
          </div>

          {/* Type Field */}
          <div>
            <Label htmlFor="type">Type</Label>
            <Input
              {...hookForm.register("type")}
              placeholder="type"
              defaultValue={actionResult?.submittedData?.type ?? ""}
            />
            <FormError
              path="type"
              formErrors={hookForm.formState.errors}
              serverErrors={actionResult}
            />
          </div>

          {/* Location Field */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              {...hookForm.register("location")}
              placeholder="location"
              defaultValue={actionResult?.submittedData?.location ?? ""}
            />
            <FormError
              path="location"
              formErrors={hookForm.formState.errors}
              serverErrors={actionResult}
            />
          </div>
        </div>
        <div className="col-span-1 flex justify-end">
          <SubmitButtonWithLoading
            text="Create Facility"
            loadingText="Creating Facility..."
          />
        </div>
      </div>
    </Form>
  );
}

interface UpdateFacilityDialogProps {
  facility: Facility | null;
}

function UpdateFacilityDialog({ facility }: UpdateFacilityDialogProps) {
  const [actionResult, updateFacility] = useActionState(
    Actions.updateFacility,
    {
      success: false,
    }
  );

  const hookForm = useForm<z.infer<typeof updateFacilitySchema>>({
    resolver: zodResolver(updateFacilitySchema),
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Update Facility</DialogTitle>
        <DialogDescription>Facility Updaten</DialogDescription>
      </DialogHeader>
      <Form
        hookForm={hookForm}
        action={updateFacility}
        actionResult={actionResult}
      >
        <div className="grid grid-cols-2 items-end gap-4">
          <div className="col-span-1">
            <div hidden>
              <Label htmlFor="id" hidden>
                Id
              </Label>
              <Input
                hidden
                {...hookForm.register("id")}
                placeholder="id"
                defaultValue={facility?.id}
              />
            </div>
            {/* Name Field */}
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                {...hookForm.register("name")}
                placeholder="name"
                defaultValue={
                  actionResult?.submittedData?.name ?? facility?.name
                }
              />
              <FormError
                path="name"
                formErrors={hookForm.formState.errors}
                serverErrors={actionResult}
              />
            </div>

            {/* Type Field */}
            <div>
              <Label htmlFor="type">Type</Label>
              <Input
                {...hookForm.register("type")}
                placeholder="type"
                defaultValue={
                  actionResult?.submittedData?.type ?? facility?.type
                }
              />
              <FormError
                path="type"
                formErrors={hookForm.formState.errors}
                serverErrors={actionResult}
              />
            </div>

            {/* Location Field */}
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                {...hookForm.register("location")}
                placeholder="location"
                defaultValue={
                  actionResult?.submittedData?.location ?? facility?.location
                }
              />
              <FormError
                path="location"
                formErrors={hookForm.formState.errors}
                serverErrors={actionResult}
              />
            </div>
          </div>
          <div className="col-span-1 flex justify-end">
            <SubmitButtonWithLoading
              text="Update Facility"
              loadingText="Updating Facility..."
            />
          </div>
        </div>
      </Form>
      <DialogFooter className="sm:justify-start">
        <DialogClose asChild></DialogClose>
        <DialogClose asChild>
          <Button type="button" variant={"destructive"}>
            Cancel
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
