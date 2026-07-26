import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useEffect, useRef } from "react";

import { authApi, type LoginPayload } from "../api/authApi";
import { Button, Icon, Input, toast } from "@repo/ui";
import { GoogleIcon } from "../components/GoogleIcon";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type LoginFormValues = LoginPayload & z.infer<typeof loginSchema>;

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorHandled = useRef(false);

  useEffect(() => {
    if (errorHandled.current) return;
    const error = searchParams.get("error");
    if (!error) return;
    errorHandled.current = true;
    if (error === "google_auth_failed") {
      toast.error("Google sign-in failed. Please try again.");
    } else {
      toast.error(decodeURIComponent(error));
    }
    const next = new URLSearchParams(searchParams);
    next.delete("error");
    navigate({ search: next.toString() }, { replace: true });
  }, []);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: (values: LoginFormValues) => authApi.login(values),
    onSuccess: () => {
      navigate("/dashboard");
      toast.success("Welcome back!");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message;
      if (typeof msg === "string" && msg.includes("Google")) {
        toast.error(msg);
      }
    },
  });

  return (
    <div className="flex justify-center items-center flex-col h-full min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-xl border border-border bg-card p-8 shadow-sm">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Icon name="pets" className="text-primary text-2xl" variant="filled" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to Pet Health Tracker
          </p>
        </div>

        {/* Google Sign-in */}
        <a href={`${API_URL}/auth/google`} className="block">
          <Button
            type="button"
            variant="outline"
            size="xl"
            className="w-full gap-2 font-medium"
          >
            <GoogleIcon className="h-4 w-4" />
            Continue with Google
          </Button>
        </a>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
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

          {loginMutation.isError && (
            <p className="text-sm text-destructive text-center">
              Invalid credentials. Please try again.
            </p>
          )}

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="mt-1"
            size="xl"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};
