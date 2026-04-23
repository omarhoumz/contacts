import { Button, Text, TextInput, View } from "react-native";

type Feedback = { tone: "error" | "success" | "info"; text: string } | null;

type AuthSectionProps = {
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
      <Text style={{ color: props.sessionEmail ? "#166534" : "#6b7280" }}>
        Auth: {props.sessionEmail ? `signed in as ${props.sessionEmail}` : "signed out"}
      </Text>
      {props.feedback ? (
        <Text style={{ color: props.feedback.tone === "error" ? "crimson" : props.feedback.tone === "success" ? "#166534" : "#0f766e" }}>
          {props.feedback.text}
        </Text>
      ) : null}
      {!props.sessionEmail ? (
        <View style={{ gap: 8 }}>
          <TextInput placeholder="Email" value={props.email} onChangeText={props.onEmailChange} autoCapitalize="none" editable={!props.authBusy} />
          <TextInput placeholder="Password" value={props.password} secureTextEntry onChangeText={props.onPasswordChange} editable={!props.authBusy} />
          <Button title={props.authBusy ? "Working..." : "Sign up"} onPress={props.onSignUp} disabled={props.authBusy} />
          <Button title={props.authBusy ? "Working..." : "Sign in"} onPress={props.onSignIn} disabled={props.authBusy} />
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          <Text style={{ color: "#555" }}>You are signed in.</Text>
          <Button title={props.authBusy ? "Working..." : "Sign out"} onPress={props.onSignOut} disabled={props.authBusy} />
        </View>
      )}
    </>
  );
}
