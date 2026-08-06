import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { authApi, type RegisterPayload } from "../api/authApi";
import { AuthLayout } from "../components/AuthLayout";
import { GoogleIcon } from "../components/GoogleIcon";
import { REGISTER_PANEL } from "../data/authCopy";
import { Button, Icon, Input, toast } from "@repo/ui";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type RegisterFormValues = RegisterPayload & z.infer<typeof registerSchema>;

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const RegisterPage = () => {
  const navigate = useNavigate();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const registerMutation = useMutation({
    mutationFn: (values: RegisterFormValues) => authApi.register(values),
    onSuccess: (result) => {
      const params = new URLSearchParams({ email: result.email });
      if (result.previewCode) {
        params.set("previewCode", result.previewCode);
      }
      toast.success("Check your email for a verification code.");
      navigate(`/verify-email?${params.toString()}`);
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      if (typeof msg === "string") {
        toast.error(msg);
      }
    },
  });

  return (
    <AuthLayout
      title="Create your account"
      lead="Start free — add your pet and keep their care in one calm place."
      panelHeadline={REGISTER_PANEL.headline}
      panelSub={REGISTER_PANEL.sub}
      panelImage={REGISTER_PANEL.image}
      panelImageAlt={REGISTER_PANEL.imageAlt}
      benefits={REGISTER_PANEL.benefits}
      switchLabel="Already tracking?"
      switchTo="Sign in"
      switchHref="/login"
    >
      <a href={`${API_URL}/auth/google`} className="block">
        <Button
          type="button"
          variant="outline"
          size="xl"
          className="w-full gap-2 font-medium cursor-pointer"
        >
          <GoogleIcon className="h-4 w-4" />
          Sign up with Google
        </Button>
      </a>

      <div className="auth-divider">
        <span>Or with email</span>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit((values) => registerMutation.mutate(values))}
        noValidate
      >
        <div className="flex flex-col gap-1.5 text-sm">
          <Input
            type="text"
            autoComplete="name"
            placeholder="Your name"
            title="Name"
            iconLeft={<Icon name="person" />}
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive" role="alert">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

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
            autoComplete="new-password"
            placeholder="At least 6 characters"
            title="Password"
            iconLeft={<Icon name="password" />}
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-destructive" role="alert">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {registerMutation.isError && (
          <p className="text-sm text-destructive text-center" role="alert">
            Could not create your account. Please try again.
          </p>
        )}

        <Button
          type="submit"
          disabled={registerMutation.isPending}
          className="auth-cta mt-1 cursor-pointer"
          size="xl"
        >
          {registerMutation.isPending ? "Creating account..." : "Create account"}
        </Button>

        <p className="text-center text-xs leading-relaxed text-[var(--auth-muted)]">
          By continuing, you agree to keep your pet&apos;s care organised —
          no spam, just wellness.
        </p>
      </form>
    </AuthLayout>
  );
};
