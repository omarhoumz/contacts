import { useEffect, useState } from "react";

type Breakpoint = "mobile" | "tablet" | "desktop";

function detect(): Breakpoint {
  const w = window.innerWidth;
  if (w <= 640) return "mobile";
  if (w <= 1023) return "tablet";
  return "desktop";
}

export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(detect);

  useEffect(() => {
    const update = () => setBp(detect());
    // Both resize and matchMedia change events for maximum compatibility
    window.addEventListener("resize", update);
    const mq640 = window.matchMedia("(max-width: 640px)");
    const mq1023 = window.matchMedia("(max-width: 1023px)");
    mq640.addEventListener("change", update);
    mq1023.addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      mq640.removeEventListener("change", update);
      mq1023.removeEventListener("change", update);
    };
  }, []);

  return bp;
}
