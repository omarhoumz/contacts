import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(__dirname, "..");
const migrationsDir = path.join(backendRoot, "supabase", "migrations");
const configPath = path.join(backendRoot, "supabase", "config.shared.toml");

if (!existsSync(migrationsDir)) {
  console.error("Missing migrations directory:", migrationsDir);
  process.exit(1);
}

const migrationFiles = readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));
if (migrationFiles.length === 0) {
  console.error("No migration SQL files found in:", migrationsDir);
  process.exit(1);
}

if (!existsSync(configPath)) {
  console.error("Missing shared Supabase config:", configPath);
  process.exit(1);
}

console.log("Backend config check OK.", {
  migrations: migrationFiles.length,
});
