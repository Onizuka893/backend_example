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
import Actions from "@/lib/server/actions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schemas/userSchema";
import Form from "@/components/form";
import FormError from "@/components/formError";
import SubmitButtonWithLoading from "@/components/submitButtonWithLoading";

export default function SignIn() {
  const [actionResponse, signin] = useActionState(Actions.signIn, {
    success: false,
  });
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Sign In
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form
            hookForm={form}
            action={signin}
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

            <SubmitButtonWithLoading
              loadingText={"Signing In..."}
              text={"Sign In"}
            />
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-600">
            Heb je geen Account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
