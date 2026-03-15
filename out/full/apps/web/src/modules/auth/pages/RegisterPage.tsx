import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { authApi, type RegisterPayload } from "../api/authApi";
import { Button, Icon, Input } from "@repo/ui";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
});

type RegisterFormValues = RegisterPayload & z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const navigate = useNavigate();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  const registerMutation = useMutation({
    mutationFn: (values: RegisterFormValues) => authApi.register(values),
    onSuccess: () => {
      navigate("/login");
    }
  });

  return (
    <div className="flex flex-col justify-center items-center  h-full min-h-screen">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lg border-border bg-card p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((values) => registerMutation.mutate(values))}
      >
        <div className="flex flex-col gap-1 text-sm">
          <Input
            type="text"
            placeholder="Enter your name"
            title="Name"
            iconLeft={<Icon name="person" />}
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <Input
            type="email"
            placeholder="Enter your email"
            title="Email"
            iconLeft={<Icon name="email" />}
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <Input
            type="password"
            placeholder="Enter your password"
            title="Password"
            iconLeft={<Icon name="password" />}
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={registerMutation.isPending}
          className="mt-2"
          size={"xl"}
        >
          {registerMutation.isPending ? "Creating account..." : "Sign up"}
        </Button>
      </form>
      {registerMutation.isError && (
        <p className="text-sm text-destructive">
          Could not create your account. Please try again.
        </p>
      )}
    </div>
    </div>
  );
};

