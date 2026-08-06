import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useEffect, useRef } from "react";

import { authApi, type LoginPayload } from "../api/authApi";
import { AuthLayout } from "../components/AuthLayout";
import { GoogleIcon } from "../components/GoogleIcon";
import { LOGIN_PANEL } from "../data/authCopy";
import { Button, Icon, Input, toast } from "@repo/ui";

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
      if (typeof msg === "string" && msg.includes("not verified")) {
        const email = form.getValues("email").trim().toLowerCase();
        toast.error("Please verify your email first.");
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      if (typeof msg === "string" && msg.includes("Google")) {
        toast.error(msg);
      }
    },
  });

  return (
    <AuthLayout
      title="Welcome back"
      lead="Sign in to continue tracking your pet's health."
      panelHeadline={LOGIN_PANEL.headline}
      panelSub={LOGIN_PANEL.sub}
      panelImage={LOGIN_PANEL.image}
      panelImageAlt={LOGIN_PANEL.imageAlt}
      benefits={LOGIN_PANEL.benefits}
      switchLabel="New here?"
      switchTo="Create an account"
      switchHref="/register"
    >
      <a href={`${API_URL}/auth/google`} className="block">
        <Button
          type="button"
          variant="outline"
          size="xl"
          className="w-full gap-2 font-medium cursor-pointer"
        >
          <GoogleIcon className="h-4 w-4" />
          Continue with Google
        </Button>
      </a>

      <div className="auth-divider">
        <span>Or with email</span>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((values) => loginMutation.mutate(values))}
        noValidate
      >
        <div className="flex flex-col gap-1.5 text-sm">
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            title="Email"
            iconLeft={<Icon name="email" />}
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive" role="alert">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 text-sm">
          <Input
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            title="Password"
            iconLeft={<Icon name="password" />}
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-destructive" role="alert">
              {form.formState.errors.password.message}
            </p>
          )}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-[var(--auth-teal-deep)] hover:text-[var(--auth-teal)] cursor-pointer transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {loginMutation.isError && (
          <p className="text-sm text-destructive text-center" role="alert">
            Invalid credentials. Please try again.
          </p>
        )}

        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="auth-cta mt-1 cursor-pointer"
          size="xl"
        >
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
};
