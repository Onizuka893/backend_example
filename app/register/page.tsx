"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Actions from "../../lib/server/actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema } from "@/lib/schemas/userSchema";
import Form from "@/components/form";
import SubmitButtonWithLoading from "@/components/submitButtonWithLoading";
import FormError from "@/components/formError";

export default function Register() {
  const [actionResponse, register] = useActionState(Actions.register, {
    success: false,
  });
  const form = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Register
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form
            hookForm={form}
            action={register}
            actionResult={actionResponse}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                {...form.register("email")}
                placeholder="Email"
                defaultValue={actionResponse?.submittedData?.email ?? ""}
              />
              <FormError
                path="email"
                formErrors={form.formState.errors}
                serverErrors={actionResponse}
              />
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                {...form.register("name")}
                placeholder="Voornaam Naam"
                defaultValue={actionResponse?.submittedData?.name ?? ""}
              />
              <FormError
                path="name"
                formErrors={form.formState.errors}
                serverErrors={actionResponse}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                {...form.register("password")}
                placeholder="Password"
                type="password"
                defaultValue={actionResponse?.submittedData?.password ?? ""}
              />
              <FormError
                path="password"
                formErrors={form.formState.errors}
                serverErrors={actionResponse}
              />
            </div>

            <div>
              <Label htmlFor="passwordConfirmation">
                Confirm your password
              </Label>
              <Input
                {...form.register("passwordConfirmation")}
                placeholder="Confirm you password"
                type="password"
                defaultValue={
                  actionResponse?.submittedData?.passwordConfirmation ?? ""
                }
              />
              <FormError
                path="passwordConfirmation"
                formErrors={form.formState.errors}
                serverErrors={actionResponse}
              />
            </div>

            <SubmitButtonWithLoading
              loadingText={"Creating your account..."}
              text={"Register"}
            />
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-600">
            Heb je al een Account?{" "}
            <Link href="/signin" className="text-blue-600 hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
