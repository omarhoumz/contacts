import { Card } from "@widados/ui-lib";
import { feedbackColor, ui } from "./ui-styles";

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
      <p style={{ color: props.isAuthenticated ? "#166534" : "#6b7280", marginBottom: 8 }}>
        Auth: {props.isAuthenticated ? `signed in as ${props.sessionEmail}` : props.authResolved ? "signed out" : "checking session..."}
      </p>
      {props.feedback ? (
        <p style={{ color: feedbackColor(props.feedback.tone), marginTop: 0, marginBottom: 10 }}>
          {props.feedback.text}
        </p>
      ) : null}
      {!props.isAuthenticated && props.authResolved ? (
        <Card>
          <h3>Sign in / Sign up</h3>
          <input
            placeholder="Email"
            value={props.email}
            onChange={(e) => props.onEmailChange(e.target.value)}
            disabled={props.authBusy}
            style={{ ...ui.input, marginBottom: 8 }}
          />
          <input
            placeholder="Password"
            type="password"
            value={props.password}
            onChange={(e) => props.onPasswordChange(e.target.value)}
            disabled={props.authBusy}
            style={{ ...ui.input, marginBottom: 8 }}
          />
          <button onClick={props.onSignUp} disabled={props.authBusy} style={ui.primaryButton}>
            {props.authBusy ? "Working..." : "Sign up"}
          </button>
          <button onClick={props.onSignIn} style={{ ...ui.secondaryButton, marginLeft: 8 }} disabled={props.authBusy}>
            {props.authBusy ? "Working..." : "Sign in"}
          </button>
        </Card>
      ) : props.isAuthenticated ? (
        <Card>
          <h3>Session</h3>
          <p style={{ marginTop: 0, color: "#555" }}>You are signed in.</p>
          <button onClick={props.onSignOut} disabled={props.authBusy} style={ui.secondaryButton}>
            {props.authBusy ? "Working..." : "Sign out"}
          </button>
        </Card>
      ) : null}
    </>
  );
}
