import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { authApi, type LoginPayload } from "../api/authApi";
import { Button, Icon, Input, toast } from "@repo/ui";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type LoginFormValues = LoginPayload & z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (values: LoginFormValues) => authApi.login(values),
    onSuccess: () => {
      navigate("/dashboard");
      toast.success("Login successful");
    },
  });

  return (
    <div className="flex justify-center items-center flex-col h-full min-h-screen">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-lg border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-center tracking-tight text-primary ">
          Pet Health Tracker
        </h1>
        <form
          className="flex flex-col gap-4"
          onSubmit={form.handleSubmit((values) => loginMutation.mutate(values))}
        >
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
            disabled={loginMutation.isPending}
            className="mt-2"
            size={"xl"}
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </Button>

          <Link to="/register">
            <Button className="w-full" variant={"ghost"} size={"xl"}>
             Create an account
            </Button>
          </Link>
        </form>
        {loginMutation.isError && (
          <p className="text-sm text-destructive text-center">
            Invalid credentials or server error. Please try again.
          </p>
        )}
      </div>
    </div>
  );
};
