import * as SecureStore from "expo-secure-store";

/**
 * Supabase Auth session persistence via Keychain / Android Keystore.
 * @see https://supabase.com/docs/reference/javascript/initializing#custom-storage
 */
export const supabaseAuthStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),

  setItem: (key: string, value: string) =>
    SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    }),

  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};
