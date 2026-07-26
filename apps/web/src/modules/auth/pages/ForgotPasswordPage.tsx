import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { authApi } from "../api/authApi";
import { OtpCodeInput } from "../components/OtpCodeInput";
import { Button, Icon, Input, toast } from "@repo/ui";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email")
});

const passwordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(6, "Please confirm your password")
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

type EmailFormValues = z.infer<typeof emailSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const apiErrorMessage = (error: unknown, fallback: string) => {
  const msg = (error as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;
  if (Array.isArray(msg)) return msg[0] ?? fallback;
  if (typeof msg === "string") return msg;
  return fallback;
};

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [previewCode, setPreviewCode] = useState<string | undefined>();

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" }
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" }
  });

  const requestMutation = useMutation({
    mutationFn: (values: EmailFormValues) =>
      authApi.forgotPassword(values.email.trim().toLowerCase()),
    onSuccess: (result, values) => {
      setEmail(values.email.trim().toLowerCase());
      setPreviewCode(result.previewCode);
      setStep("reset");
      toast.success("If that account exists, a reset code is on its way.");
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, "Could not send a reset code."));
    }
  });

  const resetMutation = useMutation({
    mutationFn: (values: PasswordFormValues) =>
      authApi.resetPassword({
        email,
        code,
        newPassword: values.newPassword
      }),
    onSuccess: () => {
      toast.success("Password updated. You can sign in now.");
      navigate("/login");
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, "Could not reset your password."));
    }
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.forgotPassword(email),
    onSuccess: (result) => {
      setPreviewCode(result.previewCode);
      toast.success("A new reset code was sent.");
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, "Could not resend the code."));
    }
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Icon name="password" className="text-primary text-2xl" variant="filled" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {step === "email" ? "Forgot password" : "Enter reset code"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {step === "email"
              ? "We will email you a 6-digit code to reset your password."
              : (
                <>
                  Enter the code sent to{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </>
              )}
          </p>
        </div>

        {step === "email" ? (
          <form
            className="flex flex-col gap-4"
            onSubmit={emailForm.handleSubmit((values) => requestMutation.mutate(values))}
          >
            <div className="flex flex-col gap-1 text-sm">
              <Input
                type="email"
                placeholder="Enter your email"
                title="Email"
                iconLeft={<Icon name="email" />}
                {...emailForm.register("email")}
              />
              {emailForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <Button type="submit" size="xl" disabled={requestMutation.isPending}>
              {requestMutation.isPending ? "Sending code..." : "Send reset code"}
            </Button>
          </form>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={passwordForm.handleSubmit((values) => resetMutation.mutate(values))}
          >
            {previewCode && (
              <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
                Dev preview code:{" "}
                <span className="font-semibold tracking-widest text-foreground">
                  {previewCode}
                </span>
              </p>
            )}

            <OtpCodeInput
              value={code}
              onChange={setCode}
              disabled={resetMutation.isPending}
              autoFocus
            />

            <div className="flex flex-col gap-1 text-sm">
              <Input
                type="password"
                placeholder="Create a new password"
                title="New password"
                iconLeft={<Icon name="password" />}
                {...passwordForm.register("newPassword")}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-xs text-destructive">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1 text-sm">
              <Input
                type="password"
                placeholder="Confirm new password"
                title="Confirm password"
                iconLeft={<Icon name="password" />}
                {...passwordForm.register("confirmPassword")}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="xl"
              disabled={code.length !== 6 || resetMutation.isPending}
            >
              {resetMutation.isPending ? "Updating..." : "Reset password"}
            </Button>

            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
              disabled={resendMutation.isPending}
              onClick={() => resendMutation.mutate()}
            >
              {resendMutation.isPending ? "Sending..." : "Resend code"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
