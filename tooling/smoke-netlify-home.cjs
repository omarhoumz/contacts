"use strict";

/**
 * Minimal production check: homepage responds and looks like our Vite app shell.
 * Default URL: widados-contacts Netlify site. Override: NETLIFY_PRODUCTION_URL.
 */

const url = process.env.NETLIFY_PRODUCTION_URL || "https://widados-contacts.netlify.app/";

(async () => {
  const res = await fetch(url, { redirect: "follow" });
  const body = await res.text();
  if (res.status !== 200) {
    console.error("Expected HTTP 200, got", res.status, url);
    process.exit(1);
  }
  if (!body.includes("WidadOS")) {
    console.error("Body missing expected app marker (WidadOS):", url);
    process.exit(1);
  }
  console.log("OK", res.status, url);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
