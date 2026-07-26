import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { authApi, type RegisterPayload } from "../api/authApi";
import { Button, Icon, Input, toast } from "@repo/ui";
import { GoogleIcon } from "../components/GoogleIcon";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters long")
});

type RegisterFormValues = RegisterPayload & z.infer<typeof registerSchema>;

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const RegisterPage = () => {
  const navigate = useNavigate();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" }
  });

  const registerMutation = useMutation({
    mutationFn: (values: RegisterFormValues) => authApi.register(values),
    onSuccess: () => {
      navigate("/login");
      toast.success("Account created! Please sign in.");
    }
  });

  return (
    <div className="flex flex-col justify-center items-center h-full min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-xl border border-border bg-card p-8 shadow-sm">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Icon name="pets" className="text-primary text-2xl" variant="filled" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Start tracking your pet&apos;s health today
          </p>
        </div>

        {/* Google Sign-up */}
        <a href={`${API_URL}/auth/google`} className="block">
          <Button
            type="button"
            variant="outline"
            size="xl"
            className="w-full gap-2 font-medium"
          >
            <GoogleIcon className="h-4 w-4" />
            Sign up with Google
          </Button>
        </a>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or sign up with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
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
              placeholder="Create a password"
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

          {registerMutation.isError && (
            <p className="text-sm text-destructive text-center">
              Could not create your account. Please try again.
            </p>
          )}

          <Button
            type="submit"
            disabled={registerMutation.isPending}
            className="mt-1"
            size="xl"
          >
            {registerMutation.isPending ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
