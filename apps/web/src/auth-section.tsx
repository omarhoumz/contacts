import { Card } from "@widados/ui-lib";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { cn } from "./lib/cn";

type Feedback = { tone: "error" | "success" | "info"; text: string } | null;

type AuthSectionProps = {
  isAuthenticated: boolean;
  authResolved: boolean;
  sessionEmail: string | null;
  authBusy: boolean;
  email: string;
  password: string;
  feedback: Feedback;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSignUp: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
};

export function AuthSection(props: AuthSectionProps) {
  return (
    <>
      <p className={cn("mb-2 text-sm", props.isAuthenticated ? "text-success" : "text-muted-foreground")}>
        Auth: {props.isAuthenticated ? `signed in as ${props.sessionEmail}` : props.authResolved ? "signed out" : "checking session..."}
      </p>
      {props.feedback ? (
        <p
          className={cn(
            "mb-2.5 mt-0 text-sm",
            props.feedback.tone === "error" && "text-destructive",
            props.feedback.tone === "success" && "text-success",
            props.feedback.tone === "info" && "text-info",
          )}
        >
          {props.feedback.text}
        </p>
      ) : null}
      {!props.isAuthenticated && props.authResolved ? (
        <Card>
          <h3>Sign in / Sign up</h3>
          <Input
            placeholder="Email"
            value={props.email}
            onChange={(e) => props.onEmailChange(e.target.value)}
            disabled={props.authBusy}
            className="mb-2"
          />
          <Input
            placeholder="Password"
            type="password"
            value={props.password}
            onChange={(e) => props.onPasswordChange(e.target.value)}
            disabled={props.authBusy}
            className="mb-2"
          />
          <Button onClick={props.onSignUp} disabled={props.authBusy}>
            {props.authBusy ? "Working..." : "Sign up"}
          </Button>
          <Button onClick={props.onSignIn} variant="secondary" className="ml-2" disabled={props.authBusy}>
            {props.authBusy ? "Working..." : "Sign in"}
          </Button>
        </Card>
      ) : props.isAuthenticated ? (
        <Card>
          <h3>Session</h3>
          <p className="mt-0 text-muted-foreground">You are signed in.</p>
          <Button onClick={props.onSignOut} disabled={props.authBusy} variant="secondary">
            {props.authBusy ? "Working..." : "Sign out"}
          </Button>
        </Card>
      ) : null}
    </>
  );
}
