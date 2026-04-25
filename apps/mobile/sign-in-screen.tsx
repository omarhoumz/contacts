import { Button, Text, TextInput, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSignInSchema, type AuthSignInForm } from "@widados/shared";

type Feedback = { tone: "error" | "success" | "info"; text: string } | null;

type SignInScreenProps = {
  authBusy: boolean;
  feedback: Feedback;
  onSignIn: (creds: AuthSignInForm) => void | Promise<void>;
  onNavigateSignUp: () => void;
};

export function SignInScreen(props: SignInScreenProps) {
  const form = useForm<AuthSignInForm>({
    resolver: zodResolver(authSignInSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <View className="gap-3">
      <Text className="text-2xl font-bold">Sign in</Text>
      <Text className="text-slate-600">WidadOS — same flows as web (/sign-in).</Text>
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
      <Controller
        control={form.control}
        name="email"
        render={({ field }) => (
          <TextInput
            placeholder="Email"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            autoCapitalize="none"
            editable={!props.authBusy}
            className="rounded-md border border-slate-300 p-2"
          />
        )}
      />
      {form.formState.errors.email ? (
        <Text className="text-xs text-red-600">{form.formState.errors.email.message}</Text>
      ) : null}
      <Controller
        control={form.control}
        name="password"
        render={({ field }) => (
          <TextInput
            placeholder="Password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            secureTextEntry
            editable={!props.authBusy}
            className="rounded-md border border-slate-300 p-2"
          />
        )}
      />
      {form.formState.errors.password ? (
        <Text className="text-xs text-red-600">{form.formState.errors.password.message}</Text>
      ) : null}
      <Button
        title={props.authBusy ? "Working…" : "Sign in"}
        onPress={form.handleSubmit((data) => void props.onSignIn(data))}
        disabled={props.authBusy}
      />
      <Button title="Create an account" onPress={props.onNavigateSignUp} disabled={props.authBusy} />
    </View>
  );
}
