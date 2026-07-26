import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { authApi } from "../api/authApi";
import { OtpCodeInput } from "../components/OtpCodeInput";
import { Button, Icon, toast } from "@repo/ui";

const apiErrorMessage = (error: unknown, fallback: string) => {
  const msg = (error as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;
  if (Array.isArray(msg)) return msg[0] ?? fallback;
  if (typeof msg === "string") return msg;
  return fallback;
};

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = (searchParams.get("email") ?? "").trim().toLowerCase();
  const previewFromQuery = searchParams.get("previewCode") ?? undefined;

  const [code, setCode] = useState("");
  const [previewCode, setPreviewCode] = useState<string | undefined>(previewFromQuery);

  const verifyMutation = useMutation({
    mutationFn: () => authApi.verifyEmail({ email, code }),
    onSuccess: () => {
      toast.success("Email verified. Welcome!");
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, "Could not verify that code."));
    }
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendVerification(email),
    onSuccess: (result) => {
      setPreviewCode(result.previewCode);
      toast.success("A new verification code was sent.");
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, "Could not resend the code."));
    }
  });

  if (!email) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">Missing email</h1>
          <p className="text-sm text-muted-foreground">
            Start from registration to receive a verification code.
          </p>
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Icon name="email" className="text-primary text-2xl" variant="filled" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Check your email
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code we sent to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        {previewCode && (
          <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
            Dev preview code:{" "}
            <span className="font-semibold tracking-widest text-foreground">{previewCode}</span>
          </p>
        )}

        <OtpCodeInput
          value={code}
          onChange={setCode}
          disabled={verifyMutation.isPending}
          autoFocus
        />

        <Button
          type="button"
          size="xl"
          disabled={code.length !== 6 || verifyMutation.isPending}
          onClick={() => verifyMutation.mutate()}
        >
          {verifyMutation.isPending ? "Verifying..." : "Verify email"}
        </Button>

        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <button
            type="button"
            className="font-medium text-primary hover:underline disabled:opacity-50"
            disabled={resendMutation.isPending}
            onClick={() => resendMutation.mutate()}
          >
            {resendMutation.isPending ? "Sending..." : "Resend code"}
          </button>
          <Link to="/login" className="hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
