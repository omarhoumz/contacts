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
      <Text className={props.sessionEmail ? "text-green-700" : "text-slate-500"}>
        Auth: {props.sessionEmail ? `signed in as ${props.sessionEmail}` : "signed out"}
      </Text>
      {props.feedback ? (
        <Text
          className={
            props.feedback.tone === "error"
              ? "text-red-600"
              : props.feedback.tone === "success"
                ? "text-green-700"
                : "text-teal-700"
          }
        >
          {props.feedback.text}
        </Text>
      ) : null}
      {!props.sessionEmail ? (
        <View className="gap-2">
          <TextInput placeholder="Email" value={props.email} onChangeText={props.onEmailChange} autoCapitalize="none" editable={!props.authBusy} />
          <TextInput placeholder="Password" value={props.password} secureTextEntry onChangeText={props.onPasswordChange} editable={!props.authBusy} />
          <Button title={props.authBusy ? "Working..." : "Sign up"} onPress={props.onSignUp} disabled={props.authBusy} />
          <Button title={props.authBusy ? "Working..." : "Sign in"} onPress={props.onSignIn} disabled={props.authBusy} />
        </View>
      ) : (
        <View className="gap-2">
          <Text className="text-slate-600">You are signed in.</Text>
          <Button title={props.authBusy ? "Working..." : "Sign out"} onPress={props.onSignOut} disabled={props.authBusy} />
        </View>
      )}
    </>
  );
}
