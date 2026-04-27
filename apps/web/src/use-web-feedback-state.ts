import { useEffect, useState } from "react";

export type WebFeedback = { tone: "error" | "success" | "info"; text: string };

export function useWebFeedbackState() {
  const [feedback, setFeedback] = useState<WebFeedback | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timeoutMs = feedback.tone === "error" ? 3500 : 1500;
    const timer = window.setTimeout(() => {
      setFeedback((current) => (current === feedback ? null : current));
    }, timeoutMs);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  return { feedback, setFeedback };
}
