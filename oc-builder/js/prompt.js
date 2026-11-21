// prompt.js
// Builds the system and user prompts sent to the AI model.
// Kept separate from the UI so it can be unit tested and versioned.

import { cleanText, cleanList } from "./schema.js";

export const PROMPT_VERSION = "1.2";

export const SYSTEM_PROMPT = `You are OC Forge, a character design assistant for game developers and artists.
Turn the user's seed ideas into one original character sheet.
Rules:
- Create an ORIGINAL character. Never copy or reference existing franchises, celebrities, or copyrighted characters.
- Keep content suitable for a general audience (no graphic violence or sexual content).
- Make personality, backstory, likes and dislikes consistent with each other and with the seed traits.
- Design notes must be visual and drawable: silhouette, shape language, clothing, signature accessories.
- The palette must contain 4 or 5 colors as 6-digit hex codes that fit the character's mood.
- Respond with ONLY a JSON object, no markdown, matching exactly this shape:
{
  "name": string,
  "tagline": string (one sentence),
  "role": string (their role in a story or game),
  "age": string,
  "personality": string[] (3-5 single words or short phrases),
  "backstory": string (90-150 words),
  "likes": string[] (3-4),
  "dislikes": string[] (3-4),
  "strengths": string[] (2-3),
  "flaws": string[] (2-3),
  "voiceLines": string[] (3 short lines of dialogue in their voice),
  "palette": [{"hex": "#RRGGBB", "name": string, "use": string}],
  "designNotes": string[] (3-5),
  "storyHooks": string[] (2-3 quest or plot ideas)
}`;

/** Clean and bound the raw form inputs before they go into a prompt. */
export function cleanInputs(raw = {}) {
  return {
    name: cleanText(raw.name, 40),
    archetype: cleanText(raw.archetype, 60),
    genre: cleanText(raw.genre, 60),
    traits: cleanList(raw.traits, 5, 30),
    vibe: cleanText(raw.vibe, 80),
    notes: cleanText(raw.notes, 300),
  };
}

/** Build the user prompt from cleaned inputs. Empty fields are left to the model. */
export function buildUserPrompt(raw) {
  const i = cleanInputs(raw);
  const lines = ["Create a character from these seeds:"];
  lines.push(`- Name: ${i.name || "(invent a fitting name)"}`);
  lines.push(`- Archetype or species: ${i.archetype || "(your choice)"}`);
  lines.push(`- Genre or setting: ${i.genre || "(your choice)"}`);
  lines.push(`- Key traits: ${i.traits.length ? i.traits.join(", ") : "(your choice)"}`);
  lines.push(`- Visual vibe: ${i.vibe || "(your choice)"}`);
  if (i.notes) lines.push(`- Extra notes from the designer: ${i.notes}`);
  return lines.join("\n");
}

/** True when the user gave at least one meaningful seed. */
export function hasSeeds(raw) {
  const i = cleanInputs(raw);
  return Boolean(i.name || i.archetype || i.genre || i.traits.length || i.vibe || i.notes);
}
