import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanText, cleanList, isHexColor, cleanPalette, normalizeCharacter, parseModelJson } from "../js/schema.js";

test("cleanText trims, collapses spaces, and truncates", () => {
  assert.equal(cleanText("  hello   world  "), "hello world");
  assert.equal(cleanText(42), "");
  assert.equal(cleanText("abcdefghij", 5), "abcd…");
});

test("cleanList accepts arrays or comma strings and removes duplicates", () => {
  assert.deepEqual(cleanList("brave, Brave, kind,, loyal"), ["brave", "kind", "loyal"]);
  assert.deepEqual(cleanList(["a", "b", "c"], 2), ["a", "b"]);
  assert.deepEqual(cleanList(null), []);
});

test("isHexColor only accepts 6-digit hex", () => {
  assert.equal(isHexColor("#A1b2C3"), true);
  assert.equal(isHexColor("#FFF"), false);
  assert.equal(isHexColor("red"), false);
});

test("cleanPalette drops invalid swatches and uppercases hex", () => {
  const out = cleanPalette([{ hex: "#aabbcc", name: "Sky" }, { hex: "blue" }, "#112233"]);
  assert.deepEqual(out.map((s) => s.hex), ["#AABBCC", "#112233"]);
  assert.equal(out[1].name, "Unnamed");
});

test("normalizeCharacter fills a missing name and reports problems", () => {
  const { character, problems } = normalizeCharacter({ backstory: "x", personality: ["calm"], palette: [] });
  assert.equal(character.name, "Unnamed Character");
  assert.ok(problems.some((p) => p.includes("name")));
  assert.ok(problems.some((p) => p.includes("Palette")));
});

test("normalizeCharacter handles non-object input without throwing", () => {
  const { character, problems } = normalizeCharacter("not json");
  assert.equal(character.name, "Unnamed Character");
  assert.ok(problems.length > 0);
});

test("parseModelJson reads fenced or wrapped JSON", () => {
  assert.deepEqual(parseModelJson('```json\n{"name":"Ada"}\n```'), { name: "Ada" });
  assert.deepEqual(parseModelJson('Sure! {"name":"Bo"} Hope this helps.'), { name: "Bo" });
  assert.throws(() => parseModelJson("no json here"));
});
