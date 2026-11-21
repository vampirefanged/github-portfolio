// schema.js
// Validates and normalizes a character sheet returned by an AI model (or the
// offline demo generator) so the UI never has to trust raw model output.

export const LIMITS = {
  text: 600,       // max characters for long text fields
  short: 80,       // max characters for short fields
  listItems: 6,    // max items in any list
  paletteMin: 3,
  paletteMax: 6,
};

const HEX = /^#[0-9a-f]{6}$/i;

/** Trim a value to a string of at most `max` characters. Non-strings become "". */
export function cleanText(value, max = LIMITS.text) {
  if (typeof value !== "string") return "";
  const t = value.replace(/\s+/g, " ").trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}

/** Turn a value into a list of short, non-empty, de-duplicated strings. */
export function cleanList(value, maxItems = LIMITS.listItems, maxLen = 160) {
  const arr = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[,;\n]/) : [];
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    const t = cleanText(String(item ?? ""), maxLen);
    const key = t.toLowerCase();
    if (t && !seen.has(key)) {
      seen.add(key);
      out.push(t);
    }
    if (out.length >= maxItems) break;
  }
  return out;
}

/** True if the string is a 6-digit hex color like #A1B2C3. */
export function isHexColor(value) {
  return typeof value === "string" && HEX.test(value.trim());
}

/** Normalize a palette: keep only valid {hex, name} swatches. */
export function cleanPalette(value) {
  if (!Array.isArray(value)) return [];
  const out = [];
  for (const sw of value) {
    const hex = typeof sw === "string" ? sw : sw?.hex;
    if (!isHexColor(hex)) continue;
    out.push({
      hex: hex.trim().toUpperCase(),
      name: cleanText(typeof sw === "object" ? sw.name : "", 40) || "Unnamed",
      use: cleanText(typeof sw === "object" ? sw.use : "", 60),
    });
    if (out.length >= LIMITS.paletteMax) break;
  }
  return out;
}

/**
 * Normalize a raw character object into the exact shape the UI renders.
 * Returns { character, problems } where problems lists anything that was
 * missing or invalid, so the app can warn the user instead of crashing.
 */
export function normalizeCharacter(raw) {
  const problems = [];
  const src = raw && typeof raw === "object" ? raw : {};
  if (src !== raw) problems.push("Response was not an object.");

  const character = {
    name: cleanText(src.name, LIMITS.short),
    tagline: cleanText(src.tagline, 140),
    role: cleanText(src.role, LIMITS.short),
    age: cleanText(String(src.age ?? ""), 30),
    personality: cleanList(src.personality, 6, 40),
    backstory: cleanText(src.backstory, 900),
    likes: cleanList(src.likes),
    dislikes: cleanList(src.dislikes),
    strengths: cleanList(src.strengths, 4),
    flaws: cleanList(src.flaws, 4),
    voiceLines: cleanList(src.voiceLines, 3, 200),
    palette: cleanPalette(src.palette),
    designNotes: cleanList(src.designNotes, 5, 200),
    storyHooks: cleanList(src.storyHooks, 3, 220),
  };

  if (!character.name) { problems.push("Missing name."); character.name = "Unnamed Character"; }
  if (!character.backstory) problems.push("Missing backstory.");
  if (character.personality.length === 0) problems.push("Missing personality traits.");
  if (character.palette.length < LIMITS.paletteMin) problems.push("Palette has fewer than 3 valid colors.");

  return { character, problems };
}

/** Extract a JSON object from model text that may include code fences or extra prose. */
export function parseModelJson(text) {
  if (typeof text !== "string") throw new Error("Model returned no text.");
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("No JSON object found in the model response.");
  return JSON.parse(candidate.slice(start, end + 1));
}
