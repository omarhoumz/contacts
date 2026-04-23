import { createContext, useContext } from "react";
import type { useWebAppState } from "./use-web-app-state";

export type WebAppState = ReturnType<typeof useWebAppState>;

const WebAppContext = createContext<WebAppState | null>(null);

export { WebAppContext };

export function useWebApp(): WebAppState {
  const ctx = useContext(WebAppContext);
  if (!ctx) throw new Error("useWebApp must be used inside WebAppContext.Provider");
  return ctx;
}
