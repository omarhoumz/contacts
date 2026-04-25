import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

export function useWebAuthSession(client: SupabaseClient) {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authResolved, setAuthResolved] = useState(false);

  useEffect(() => {
    const syncInitialSession = async () => {
      const { data, error } = await client.auth.getUser();
      if (error || !data.user) {
        setSessionEmail(null);
      } else {
        setSessionEmail(data.user.email ?? null);
      }
      setAuthResolved(true);
    };

    void syncInitialSession();
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user?.email ?? null);
      setAuthResolved(true);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  return {
    sessionEmail,
    setSessionEmail,
    authResolved,
    setAuthResolved,
  };
}
