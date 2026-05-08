import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "fs";
import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function readFile(path) {
  return readFileSync(resolve(ROOT, path), "utf-8");
}

// ─── Server env vars extracted from process.env references ─────────────
function extractServerEnvVars() {
  const srcDir = resolve(ROOT, "server/src");
  const envVars = new Set();
  function walk(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = resolve(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "node_modules") walk(full);
      else if (entry.name.endsWith(".js")) {
        const content = readFileSync(full, "utf-8");
        for (const m of content.matchAll(/process\.env\.([A-Z_][A-Z0-9_]*)/g)) {
          envVars.add(m[1]);
        }
      }
    }
  }
  walk(srcDir);
  return envVars;
}

// ─── Parse YAML (simple flat key:value only — sufficient for env.yaml) ──
function parseFlatYaml(content) {
  const vars = {};
  for (const line of content.split("\n")) {
    // Match KEY: "value" or KEY: value (value may contain template vars like ${_FOO})
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*):\s+(.+?)\s*$/);
    if (m) {
      let val = m[2].trim();
      // Strip surrounding quotes if present
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      vars[m[1]] = val;
    }
  }
  return vars;
}

// ─── Tests ───────────────────────────────────────────────────────────────

describe("Deployment Config Validation", () => {
  // ── 1. No OR_API_KEY remnant ──────────────────────────────────────────
  it("has zero references to legacy OR_API_KEY in source code", () => {
    let result;
    try {
      result = execSync(
        `grep -rn 'OR_API_KEY' server/src/ cloudbuild.yaml deploy_gcp.sh Dockerfile .env .env.cloud-run`,
        { cwd: ROOT, encoding: "utf-8" }
      );
    } catch (e) {
      // grep exits 1 when no matches — that's what we want
      result = "";
    }
    const lines = result.trim().split("\n").filter(Boolean);
    expect(lines, `Found OR_API_KEY references:\n${lines.join("\n")}`).toEqual([]);
  });

  // ── 2. cloudbuild.yaml has --clear-secrets ────────────────────────────
  it("cloudbuild.yaml includes --clear-secrets to prevent type conflicts", () => {
    const yaml = readFile("cloudbuild.yaml");
    expect(yaml).toContain("--clear-secrets");
  });

  // ── 3. --clear-secrets comes before --env-vars-file ───────────────────
  it("--clear-secrets precedes --env-vars-file in deploy args", () => {
    const yaml = readFile("cloudbuild.yaml");
    const clearIdx = yaml.indexOf("--clear-secrets");
    const envFileIdx = yaml.indexOf("--env-vars-file");
    expect(clearIdx).toBeGreaterThan(-1);
    expect(envFileIdx).toBeGreaterThan(-1);
    expect(clearIdx).toBeLessThan(envFileIdx);
  });

  // ── 4. env.yaml vars are plain strings, not secret references ─────────
  it("env.yaml block contains only plain string values (no secretKeyRef)", () => {
    const yaml = readFile("cloudbuild.yaml");

    // Extract the env.yaml heredoc content
    const match = yaml.match(/cat <<EOF > env\.yaml\n([\s\S]*?)EOF/);
    expect(match, "Could not find env.yaml heredoc block").toBeTruthy();

    const envBlock = match[1];
    const secretPatterns = ["secretKeyRef", "valueFrom", "${secret:"];
    for (const pattern of secretPatterns) {
      expect(envBlock, `env.yaml should not contain "${pattern}"`).not.toContain(
        pattern
      );
    }

    // Verify each line is a simple key: "value" pair
    const vars = parseFlatYaml(envBlock);
    expect(Object.keys(vars).length).toBeGreaterThan(0);
    for (const [key, val] of Object.entries(vars)) {
      expect(typeof val, `${key} should be a string`).toBe("string");
      expect(val.length, `${key} should not be empty`).toBeGreaterThan(0);
    }
  });

  // ── 5. All server-required env vars are covered ────────────────────────
  it("env.yaml covers all server process.env references that are DB/LLM-related", () => {
    const yaml = readFile("cloudbuild.yaml");
    const match = yaml.match(/cat <<EOF > env\.yaml\n([\s\S]*?)EOF/);
    expect(match, "Could not find env.yaml heredoc block").toBeTruthy();

    const envYamlVars = new Set(Object.keys(parseFlatYaml(match[1])));
    const serverVars = extractServerEnvVars();

    // env.yaml uses APP_* prefix; server falls back from APP_* to base name.
    // Build the set of base names that are covered by APP_* vars.
    const coveredBaseNames = new Set();
    for (const ev of envYamlVars) {
      coveredBaseNames.add(ev); // direct match
      if (ev.startsWith("APP_")) coveredBaseNames.add(ev.slice(4)); // base name fallback
    }

    // Vars that are expected NOT to be in env.yaml (set elsewhere or optional)
    const exclusions = new Set([
      "DB_STORAGE", // sqlite only, not used in prod
      "APP_DB_STORAGE", // alias for DB_STORAGE, sqlite only
      "DB_PASS", // legacy, DB_PASSWORD used instead
      "JWT_SECRET", // generated at runtime or set differently
      "LM_STUDIO_KEY", // local-only
      "LM_STUDIO_MODEL", // local-only
      "LM_STUDIO_URL", // local-only
      "LLM_API_KEY", // not used in openrouter-only mode
      "TAVILY_API_KEY", // optional tools
      "LLM_ENABLE_TOOLS", // covered by APP_LLM_ENABLE_TOOLS
      "LLM_PROVIDER_STRATEGY", // covered by APP_LLM_PROVIDER_STRATEGY
      "DB_HOST", // covered by APP_DB_HOST
      "DB_USER", // covered by APP_DB_USER
      "DB_PASSWORD", // covered by APP_DB_PASSWORD
      "DB_NAME", // covered by APP_DB_NAME
      "DB_DIALECT", // covered by APP_DB_DIALECT
      "DB_SOCKET_PATH", // covered by APP_DB_SOCKET_PATH
      "OPENROUTER_API_KEY", // covered by APP_OPENROUTER_API_KEY
      "OPENROUTER_URL", // covered by APP_OPENROUTER_URL
      "OPENROUTER_FALLBACKS", // covered by APP_OPENROUTER_FALLBACKS
    ]);

    const missing = [];
    for (const v of serverVars) {
      if (exclusions.has(v)) continue;
      if (!coveredBaseNames.has(v)) missing.push(v);
    }

    expect(missing, `Missing env vars in cloudbuild.yaml env.yaml: ${missing.join(", ")}`).toEqual([]);
  });

  // ── 6. Substitution defaults exist for all env.yaml vars ───────────────
  it("cloudbuild.yaml substitutions cover all env.yaml template vars", () => {
    const yaml = readFile("cloudbuild.yaml");

    // Extract substitution keys
    const subMatch = yaml.match(/substitutions:([\s\S]*?)(?:\n\S|$)/);
    expect(subMatch, "No substitutions block found").toBeTruthy();
    const subVars = new Set();
    for (const m of subMatch[1].matchAll(/^\s+(_[A-Z_]+):/gm)) {
      subVars.add(m[1]);
    }

    // Extract env.yaml template keys (from ${_FOO} patterns)
    const envMatch = yaml.match(/cat <<EOF > env\.yaml\n([\s\S]*?)EOF/);
    expect(envMatch, "No env.yaml block found").toBeTruthy();
    const envBlock = envMatch[1];
    const templateVars = new Set();
    for (const m of envBlock.matchAll(/\$\{_([A-Z_]+)\}/g)) {
      templateVars.add("_" + m[1]);
    }

    const missing = [...templateVars].filter((v) => !subVars.has(v));
    const unused = [...subVars].filter(
      (v) => v !== "_VITE_TLDRAW_LICENSE_KEY" && !templateVars.has(v)
    );

    expect(missing, `env.yaml references substitution vars with no default: ${missing.join(", ")}`).toEqual([]);
    expect(unused, `Substitution vars defined but not used in env.yaml: ${unused.join(", ")}`).toEqual([]);
  });

  // ── 7. .env.cloud-run mirrors required vars ────────────────────────────
  it(".env.cloud-run contains all required production env vars", () => {
    const envFile = readFile(".env.cloud-run");
    const required = [
      "OPENROUTER_API_KEY",
      "OPENROUTER_URL",
      "OPENROUTER_FALLBACKS",
      "LLM_PROVIDER_STRATEGY",
      "DB_HOST",
      "DB_USER",
      "DB_PASSWORD",
      "DB_NAME",
      "DB_DIALECT",
      "DB_SOCKET_PATH",
      "NODE_ENV",
    ];
    const missing = required.filter((v) => !envFile.includes(`${v}=`));
    expect(missing, `Missing in .env.cloud-run: ${missing.join(", ")}`).toEqual([]);
  });

  // ── 8. No conflicting env var types in deploy script ───────────────────
  it("deploy_gcp.sh passes substitution args matching cloudbuild.yaml", () => {
    const script = readFile("deploy_gcp.sh");

    // Extract all --substitutions keys from script
    const scriptSubs = new Set();
    for (const m of script.matchAll(/--substitutions=([^ ]+)/g)) {
      for (const pair of m[1].split(",")) {
        const [key] = pair.split("=");
        if (key) scriptSubs.add(key);
      }
    }

    // Extract substitution keys from cloudbuild.yaml
    const yaml = readFile("cloudbuild.yaml");
    const subMatch = yaml.match(/substitutions:([\s\S]*?)(?:\n\S|$)/);
    expect(subMatch).toBeTruthy();
    const yamlSubs = new Set();
    for (const m of subMatch[1].matchAll(/^\s+(_[A-Z_]+):/gm)) {
      yamlSubs.add(m[1]);
    }

    // Script may have extra LLM_PROVIDER_STRATEGY which is fine
    // But all yaml subs should be in script
    const missing = [...yamlSubs].filter((v) => !scriptSubs.has(v));
    expect(missing, `cloudbuild.yaml substitutions not passed by deploy_gcp.sh: ${missing.join(", ")}`).toEqual([]);
  });

  // ── 9. LLM_PROVIDER_STRATEGY is openrouter-only in deployment ──────────
  it("LLM_PROVIDER_STRATEGY is set to openrouter-only in deployment configs", () => {
    const yaml = readFile("cloudbuild.yaml");
    const envBlock = yaml.match(/cat <<EOF > env\.yaml\n([\s\S]*?)EOF/);
    expect(envBlock).toBeTruthy();
    const vars = parseFlatYaml(envBlock[1]);
    // The env.yaml uses APP_ prefix; verify it references the substitution var
    expect(vars.APP_LLM_PROVIDER_STRATEGY).toBeDefined();
    expect(vars.APP_LLM_PROVIDER_STRATEGY).toContain("_LLM_PROVIDER_STRATEGY");

    // Verify the substitution default is openrouter-only
    const subBlock = yaml.match(/substitutions:([\s\S]*?)(?:\n\S|$)/);
    expect(subBlock).toBeTruthy();
    expect(subBlock[1]).toMatch(/_LLM_PROVIDER_STRATEGY:\s*'openrouter-only'/);
  });

  // ── 10. server/index.js references only OPENROUTER_API_KEY ─────────────
  it("server/index.js references only OPENROUTER_API_KEY (no OR_API_KEY)", () => {
    const index = readFile("server/index.js");
    expect(index).toContain("OPENROUTER_API_KEY");
    expect(index).not.toContain("OR_API_KEY");
  });

  // ── 11. LLMService.js uses only OPENROUTER_API_KEY ────────────────────
  it("LLMService.js uses only OPENROUTER_API_KEY (no OR_API_KEY fallback)", () => {
    const llm = readFile("server/src/services/LLMService.js");
    expect(llm).toContain("process.env.OPENROUTER_API_KEY");
    expect(llm).not.toContain("OR_API_KEY");
  });
});
