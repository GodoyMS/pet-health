/**
 * Builds a subsetted Material Symbols Outlined font containing only the icons
 * this monorepo actually renders.
 *
 * The `material-symbols` npm package ships three full variable fonts
 * (outlined + rounded + sharp, 12.4 MB total). We only ever use "outlined",
 * and of its ~3800 glyphs we use ~150. Google Fonts will serve a subset built
 * from an explicit `icon_names` list, so we fetch that once and vendor the
 * result into packages/ui — Docker builds stay hermetic and offline.
 *
 *   node scripts/build-icon-font.mjs           regenerate the font + manifest
 *   node scripts/build-icon-font.mjs --check   verify the manifest is current
 *
 * `--check` needs no network. Run it after adding an icon: an icon missing
 * from the subset renders as its own name in plain text, which is easy to miss
 * in review and impossible to miss in production.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const OUT_DIR = path.join(ROOT, "packages/ui/src/assets");
const FONT_FILE = path.join(OUT_DIR, "material-symbols-outlined-subset.woff2");
const MANIFEST_FILE = path.join(OUT_DIR, "material-symbols.icons.json");

/**
 * Directories scanned for icon names. apps/api is in the list because the API
 * serves icon names to the client (see pet-lifestyle-guidance.service.ts and
 * pet-preventive-care-item.service.ts) — miss it and those tabs render text.
 */
const SOURCE_DIRS = [
  "apps/web/src",
  "apps/admin/src",
  "apps/api/src",
  "packages/ui/src",
];

/**
 * Icons that no static scan can see: names that arrive from the database, or
 * that a future API row might use. Cheap insurance — each glyph is ~200 bytes.
 */
const ALWAYS_INCLUDE = [
  "check_circle",
  "error",
  "help",
  "info",
  "pets",
  "warning",
];

/** Every axis the <Icon /> component exposes, so all its props keep working. */
const AXES = "opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200";

/** Without a browser UA, Google serves legacy truetype instead of woff2. */
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * The name list comes from Google rather than `material-symbols`' own type
 * union: that union is missing common icons (expand_more, auto_awesome, …),
 * and a name the API rejects fails the whole subset request with a 400.
 */
async function validIconNames() {
  const res = await fetch(
    "https://fonts.google.com/metadata/icons?incomplete=1&key=material_symbols",
    { headers: { "User-Agent": UA } },
  );
  if (!res.ok) throw new Error(`Icon metadata request failed: ${res.status}`);
  // The response is served with an anti-JSON-hijacking prefix.
  const body = (await res.text()).replace(/^\)\]\}'\n?/, "");
  return new Set(JSON.parse(body).icons.map((icon) => icon.name));
}

async function sourceFiles(dir) {
  const entries = await fs.readdir(path.join(ROOT, dir), {
    recursive: true,
    withFileTypes: true,
  });
  return entries
    .filter((e) => e.isFile() && /\.(ts|tsx)$/.test(e.name))
    .filter((e) => !/\.(test|spec|stories)\.tsx?$/.test(e.name))
    .map((e) => path.join(e.parentPath ?? e.path, e.name));
}

/**
 * Two shapes cover every icon in the codebase: the JSX prop and an `icon`
 * property on a config/meta object. Both are always string literals — a grep
 * for `name={\`` / `icon: \`` finds no template literals.
 */
const PATTERNS = [
  /<Icon\b[^>]*?\bname="([a-z0-9_]+)"/gs,
  /\bicon\s*[:=]\s*"([a-z0-9_]+)"/g,
];

/** Every icon-shaped literal in the tree, real Material Symbol or not. */
async function collectCandidates() {
  const candidates = new Set(ALWAYS_INCLUDE);
  for (const dir of SOURCE_DIRS) {
    for (const file of await sourceFiles(dir)) {
      const source = await fs.readFile(file, "utf8");
      for (const pattern of PATTERNS) {
        for (const [, name] of source.matchAll(pattern)) candidates.add(name);
      }
    }
  }
  return [...candidates].sort();
}

async function readManifest() {
  try {
    return JSON.parse(await fs.readFile(MANIFEST_FILE, "utf8"));
  } catch {
    return null;
  }
}

async function fetchSubset(icons) {
  const cssUrl =
    `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:${AXES}` +
    // The API rejects an unsorted icon_names list with a 400.
    `&icon_names=${icons.join(",")}`;

  const cssRes = await fetch(cssUrl, { headers: { "User-Agent": UA } });
  if (!cssRes.ok) {
    throw new Error(`Google Fonts CSS request failed: ${cssRes.status} ${await cssRes.text()}`);
  }
  const css = await cssRes.text();

  const fontUrl = css.match(/url\((https:\/\/[^)]+)\)/)?.[1];
  if (!fontUrl) throw new Error(`No font URL in Google Fonts response:\n${css}`);

  const fontRes = await fetch(fontUrl, { headers: { "User-Agent": UA } });
  if (!fontRes.ok) throw new Error(`Font download failed: ${fontRes.status}`);

  return Buffer.from(await fontRes.arrayBuffer());
}

async function main() {
  const candidates = await collectCandidates();

  // Offline: a candidate the last build never classified is either a new icon
  // or a new non-icon, and both need a rebuild to tell apart.
  if (process.argv.includes("--check")) {
    const manifest = await readManifest();
    if (!manifest) {
      console.error("No icon manifest. Run: pnpm icons:build");
      process.exit(1);
    }
    const known = new Set([...manifest.icons, ...manifest.ignored]);
    const unclassified = candidates.filter((name) => !known.has(name));
    if (unclassified.length) {
      console.error(
        `${unclassified.length} icon name(s) are used but not in the subset font. ` +
          `If they are real Material Symbols they will render as plain text:\n  ` +
          `${unclassified.join("\n  ")}\n\nRun: pnpm icons:build`,
      );
      process.exit(1);
    }
    console.log(`Icon subset is up to date (${manifest.icons.length} icons).`);
    return;
  }

  const valid = await validIconNames();
  const icons = candidates.filter((name) => valid.has(name));
  // `icon: "..."` also matches unrelated config — lucide names, CSS classes.
  // Recording them is what lets --check run without hitting the network.
  const ignored = candidates.filter((name) => !valid.has(name));

  console.log(`Subsetting Material Symbols Outlined to ${icons.length} icons…`);
  const font = await fetchSubset(icons);

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(FONT_FILE, font);
  await fs.writeFile(
    MANIFEST_FILE,
    `${JSON.stringify(
      { generatedBy: "scripts/build-icon-font.mjs — do not edit by hand", icons, ignored },
      null,
      2,
    )}\n`,
  );

  console.log(
    `  ${path.relative(ROOT, FONT_FILE)} — ${(font.length / 1024).toFixed(1)} kB ` +
      `(the full outlined font is 3829 kB)`,
  );
  if (ignored.length) {
    console.log(`  ${ignored.length} non-Material-Symbols name(s) skipped: ${ignored.join(", ")}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
