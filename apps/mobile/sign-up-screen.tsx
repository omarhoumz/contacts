import { Button, Text, TextInput, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authSignUpSchema, type AuthSignUpForm } from "@widados/shared";

type Feedback = { tone: "error" | "success" | "info"; text: string } | null;

type SignUpScreenProps = {
  authBusy: boolean;
  feedback: Feedback;
  onSignUp: (creds: AuthSignUpForm) => void | Promise<void>;
  onNavigateSignIn: () => void;
};

export function SignUpScreen(props: SignUpScreenProps) {
  const form = useForm<AuthSignUpForm>({
    resolver: zodResolver(authSignUpSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <View className="gap-3">
      <Text className="text-2xl font-bold">Sign up</Text>
      <Text className="text-slate-600">WidadOS — same flows as web (/sign-up).</Text>
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
        title={props.authBusy ? "Working…" : "Sign up"}
        onPress={form.handleSubmit((data) => void props.onSignUp(data))}
        disabled={props.authBusy}
      />
      <Button title="Already have an account? Sign in" onPress={props.onNavigateSignIn} disabled={props.authBusy} />
    </View>
  );
}
