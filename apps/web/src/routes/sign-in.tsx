import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSignInSchema, type AuthSignInForm } from "@widados/shared";
import { useWebApp } from "../web-app-context";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  const s = useWebApp();
  const form = useForm<AuthSignInForm>({
    resolver: zodResolver(authSignInSchema),
    defaultValues: { email: s.email, password: s.password },
  });

  return (
    <div className="w-full max-w-md">
      <h1 className="mb-1 text-3xl font-bold tracking-tight text-foreground">WidadOS</h1>
      <p className="mb-7 text-sm text-muted-foreground">Your contacts, private and organised.</p>

      <Card className="p-5">
        <form
          className="flex flex-col gap-2.5"
          onSubmit={form.handleSubmit(async (data) => {
            await s.signIn(data);
          })}
        >
          <Input
            placeholder="Email"
            autoComplete="email"
            disabled={s.authBusy}
            className="mb-0"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          ) : null}
          <Input
            placeholder="Password"
            type="password"
            autoComplete="current-password"
            disabled={s.authBusy}
            aria-invalid={Boolean(form.formState.errors.password)}
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
          ) : null}
          <Button type="submit" disabled={s.authBusy} className="w-full">
            {s.authBusy ? "Working…" : "Sign in"}
          </Button>
          {s.canResendVerification ? (
            <Button
              type="button"
              onClick={() => void s.resendVerification(form.getValues("email"))}
              disabled={s.authBusy}
              variant="secondary"
              className="w-full"
            >
              {s.authBusy ? "Sending…" : "Resend verification"}
            </Button>
          ) : null}
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link to="/sign-up" className="font-medium text-primary underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
