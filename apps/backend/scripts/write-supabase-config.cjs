"use strict";

const fs = require("fs");
const path = require("path");

const supabaseDir = path.join(__dirname, "..", "supabase");
const sharedPath = path.join(supabaseDir, "config.shared.toml");
const examplePath = path.join(supabaseDir, "config.local.toml.example");
const localPath = path.join(supabaseDir, "config.local.toml");
const outPath = path.join(supabaseDir, "config.toml");

if (!fs.existsSync(sharedPath)) {
  console.error("Missing", sharedPath);
  process.exit(1);
}
if (!fs.existsSync(examplePath)) {
  console.error("Missing", examplePath);
  process.exit(1);
}

let shared = fs.readFileSync(sharedPath, "utf8").trimEnd();

if (fs.existsSync(outPath)) {
  const current = fs.readFileSync(outPath, "utf8");
  const m = current.match(/^project_id\s*=\s*"([^"]+)"/m);
  if (m) {
    shared = shared.replace(/^project_id\s*=.*$/m, `project_id = "${m[1]}"`);
  }
}

const fragment = fs.existsSync(localPath)
  ? fs.readFileSync(localPath, "utf8").trim()
  : fs.readFileSync(examplePath, "utf8").trim();

const out = `${shared}\n\n${fragment}\n`;
fs.writeFileSync(outPath, out, "utf8");
console.log("Wrote", path.relative(process.cwd(), outPath));
