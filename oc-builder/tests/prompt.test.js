import { test } from "node:test";
import assert from "node:assert/strict";
import { buildUserPrompt, cleanInputs, hasSeeds, SYSTEM_PROMPT } from "../js/prompt.js";
import { generateDemoCharacter } from "../js/demo.js";
import { normalizeCharacter } from "../js/schema.js";
import { toMarkdown } from "../js/export.js";

test("hasSeeds is false for empty input and true with any seed", () => {
  assert.equal(hasSeeds({}), false);
  assert.equal(hasSeeds({ name: "   " }), false);
  assert.equal(hasSeeds({ traits: "brave" }), true);
});

test("cleanInputs limits trait count and length", () => {
  const i = cleanInputs({ traits: "a,b,c,d,e,f,g" });
  assert.equal(i.traits.length, 5);
});

test("buildUserPrompt includes provided seeds and placeholders for missing ones", () => {
  const p = buildUserPrompt({ name: "Kiki", traits: "quiet, protective" });
  assert.match(p, /Name: Kiki/);
  assert.match(p, /Key traits: quiet, protective/);
  assert.match(p, /Genre or setting: \(your choice\)/);
});

test("system prompt asks for JSON only and original characters", () => {
  assert.match(SYSTEM_PROMPT, /ONLY a JSON object/);
  assert.match(SYSTEM_PROMPT, /ORIGINAL character/);
});

test("demo generator is deterministic and produces a valid sheet", () => {
  const seeds = { name: "Rook", traits: "warm, loyal" };
  const a = generateDemoCharacter(seeds);
  const b = generateDemoCharacter(seeds);
  assert.deepEqual(a, b);
  const { character, problems } = normalizeCharacter(a);
  assert.equal(character.name, "Rook");
  assert.deepEqual(problems, []);
});

test("toMarkdown renders headings and palette", () => {
  const { character } = normalizeCharacter(generateDemoCharacter({ name: "Ines" }));
  const md = toMarkdown(character, "demo");
  assert.match(md, /^# Ines/);
  assert.match(md, /## Color palette\n- #[0-9A-F]{6}/);
});
