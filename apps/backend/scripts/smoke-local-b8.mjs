/**
 * Local B8-style smoke: signup → sign-in → contact CRUD, label, trash, list (search proxy = filter client-side N/A).
 * Requires: `pnpm db:start` and local stack on API_URL (default http://127.0.0.1:54321).
 * If publishable key / API_URL are unset, reads them from `supabase status -o env` (apps/backend cwd).
 */
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, "..");

function statusEnv() {
  const raw = execFileSync("npx", ["supabase", "status", "-o", "env"], {
    cwd: backendRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const out = {};
  const re = /^([A-Z0-9_]+)="((?:\\.|[^"\\])*)"/gm;
  let m;
  while ((m = re.exec(raw)) !== null) {
    out[m[1]] = m[2].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  return out;
}

const fromStatus =
  !process.env.PUBLISHABLE_KEY &&
  !process.env.SUPABASE_PUBLISHABLE_KEY
    ? statusEnv()
    : {};
const API_URL = process.env.API_URL ?? fromStatus.API_URL ?? "http://127.0.0.1:54321";
const PUBLISHABLE_KEY =
  process.env.PUBLISHABLE_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  fromStatus.PUBLISHABLE_KEY;

function must(cond, msg) {
  if (!cond) {
    console.error(msg);
    process.exit(1);
  }
}

async function auth(path, body) {
  const r = await fetch(`${API_URL}/auth/v1/${path}`, {
    method: "POST",
    headers: {
      apikey: PUBLISHABLE_KEY,
      Authorization: `Bearer ${PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { ok: r.ok, status: r.status, data };
}

async function rest(method, path, { token, body, prefer } = {}) {
  const headers = {
    apikey: PUBLISHABLE_KEY,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  if (prefer) headers.Prefer = prefer;
  const r = await fetch(`${API_URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { ok: r.ok, status: r.status, data, headers: r.headers };
}

async function main() {
  must(
    PUBLISHABLE_KEY,
    "Set PUBLISHABLE_KEY or SUPABASE_PUBLISHABLE_KEY.",
  );

  const email = `b8smoke${Date.now()}@test.local`;
  const password = "SmokeTestPass123!";

  const signUp = await auth("signup", { email, password });
  must(signUp.ok, `signup failed ${signUp.status}: ${JSON.stringify(signUp.data)}`);

  const signIn = await auth("token?grant_type=password", { email, password });
  must(signIn.ok, `sign-in failed ${signIn.status}: ${JSON.stringify(signIn.data)}`);
  const accessToken = signIn.data.access_token;
  const userId = signIn.data.user?.id;
  must(userId, "missing user id");

  const ins = await rest("POST", "contacts", {
    token: accessToken,
    body: { display_name: "Smoke Contact", user_id: userId },
    prefer: "return=representation",
  });
  must(ins.ok, `insert contact ${ins.status}: ${JSON.stringify(ins.data)}`);
  const contactId = ins.data[0]?.id;
  must(contactId, "missing contact id");

  const lab = await rest("POST", "labels", {
    token: accessToken,
    body: { name: "SmokeLabel", color: "#112233", user_id: userId },
    prefer: "return=representation",
  });
  must(lab.ok, `insert label ${lab.status}: ${JSON.stringify(lab.data)}`);
  const labelId = lab.data[0]?.id;

  const cl = await rest("POST", "contact_labels", {
    token: accessToken,
    body: { contact_id: contactId, label_id: labelId, user_id: userId },
    prefer: "return=representation",
  });
  must(cl.ok, `contact_labels insert ${cl.status}: ${JSON.stringify(cl.data)}`);

  const del = await rest("DELETE", `contact_labels?contact_id=eq.${contactId}&label_id=eq.${labelId}`, {
    token: accessToken,
  });
  must(del.ok, `contact_labels delete ${del.status}`);

  const soft = await rest("PATCH", `contacts?id=eq.${contactId}`, {
    token: accessToken,
    body: { deleted_at: new Date().toISOString() },
    prefer: "return=representation",
  });
  must(soft.ok, `soft delete ${soft.status}: ${JSON.stringify(soft.data)}`);

  const trashList = await rest(
    "GET",
    `contacts?user_id=eq.${userId}&deleted_at=not.is.null&select=id,display_name`,
    { token: accessToken },
  );
  must(trashList.ok, `trash list ${trashList.status}`);
  must(
    Array.isArray(trashList.data) && trashList.data.some((c) => c.id === contactId),
    "contact not in trash list",
  );

  const restore = await rest("PATCH", `contacts?id=eq.${contactId}`, {
    token: accessToken,
    body: { deleted_at: null },
    prefer: "return=representation",
  });
  must(restore.ok, `restore ${restore.status}`);

  const soft2 = await rest("PATCH", `contacts?id=eq.${contactId}`, {
    token: accessToken,
    body: { deleted_at: new Date().toISOString() },
  });
  must(soft2.ok, "soft delete again");

  const hard = await rest("DELETE", `contacts?id=eq.${contactId}`, { token: accessToken });
  must(hard.ok, `hard delete ${hard.status}`);

  const list = await rest(
    "GET",
    `contacts?user_id=eq.${userId}&deleted_at=is.null&select=id,display_name`,
    { token: accessToken },
  );
  must(list.ok, `list active ${list.status}`);
  must(
    !Array.isArray(list.data) || !list.data.some((c) => c.id === contactId),
    "contact still listed after hard delete",
  );

  console.log("OK local B8 smoke:", { email, userId, contactId, labelId });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
