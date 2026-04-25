import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

export function useMobileAuthSession(client: SupabaseClient) {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  const syncSession = useCallback(async () => {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) {
      setSessionEmail(null);
      return;
    }
    setSessionEmail(data.user.email ?? null);
  }, [client]);

  useEffect(() => {
    void syncSession();
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(() => {
      void syncSession();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [client, syncSession]);

  return {
    sessionEmail,
    setSessionEmail,
    syncSession,
  };
}
