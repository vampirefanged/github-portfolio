// demo.js
// Offline demo generator. It does NOT use AI: it assembles a character from
// hand-written building blocks so visitors can try the app without an API key.
// Output is seeded by the inputs, so the same seeds give the same character.

import { cleanInputs } from "./prompt.js";

const NAMES = ["Vesper", "Kiki", "Odalys", "Rook", "Marlow", "Juniper", "Taro", "Sable", "Ines", "Corvin", "Valerio", "Sasha", "Daisy", "Beau", "Karlo"];
const ROLES = ["wandering mapmaker", "retired monster hunter", "night-market cook", "lighthouse keeper", "rogue archivist", "traveling tinkerer", "wrestler", "retired", "teacher", "barkeep"];
const PERSONALITY = ["stubborn", "warm", "curious", "dry-humored", "loyal", "restless", "soft-spoken", "reckless", "patient", "proud", "hot headed", "short tempered",  "joyful", "clueless", "confident", "optimistic"];
const LIKES = ["rainy mornings", "coconuts", "old maps", "quiet company", "spicy food", "collecting buttons", "late-night radio", "the color orange", "dancing in the rain", "midnight walks", "counting the stars", "traveling"];
const DISLIKES = ["flies", "awkward small talk", "being rushed", "broken promises", "crowded markets", "cold soup", "having nothing to do", "personal bubble popped", "horror movies", "romcoms", "the smell of wet dog"];
const STRENGTHS = ["reads people quickly", "never panics", "fixes anything with tape", "remembers every face", "doesn't hesitate" , "jack of all trades", "never smells bad", "lives in the moment" ];
const FLAWS = ["holds grudges", "takes on too much", "avoids asking for help", "trusts too easily", "egotistical" , "overthinker"];
const PALETTES = [
  [["#2E3A59", "Midnight Navy", "Main outfit"], ["#E07A3F", "Ember Orange", "Accents"], ["#F2D7A0", "Sand", "Skin highlights"], ["#7FB7A4", "Sea Glass", "Accessories"]],
  [["#3B1F2B", "Plum Shadow", "Hair"], ["#C94F6D", "Rose", "Scarf"], ["#F4E3D7", "Cream", "Shirt"], ["#5B8C5A", "Moss", "Bag"]],
  [["#1F2A2E", "Charcoal", "Jacket"], ["#D9B44A", "Brass", "Buttons and trim"], ["#8E5A3C", "Leather", "Boots"], ["#A7C4D9", "Fog Blue", "Eyes"]],
];

/** Small deterministic hash so the same inputs produce the same demo character. */
export function seedFrom(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function picker(seed) {
  let s = seed || 1;
  const next = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
  return {
    one: (arr) => arr[Math.floor(next() * arr.length)],
    some: (arr, n) => [...arr].sort(() => next() - 0.5).slice(0, n),
  };
}

export function generateDemoCharacter(raw) {
  const i = cleanInputs(raw);
  const p = picker(seedFrom(JSON.stringify(i)));
  const name = i.name || p.one(NAMES);
  const role = i.archetype ? `${i.archetype} ${p.one(ROLES)}` : p.one(ROLES);
  const genre = i.genre || "a small coastal city";
  const traits = i.traits.length ? i.traits.slice(0, 4) : p.some(PERSONALITY, 4);

  return {
    name,
    tagline: `A ${traits[0]} ${role} who keeps one secret too many.`,
    role,
    age: String(18 + Math.floor(seedFrom(name) % 30)),
    personality: traits,
    backstory: `${name} grew up in ${genre}, where everyone knew everyone's business. After a mistake cost them their home, they became a ${role} and learned to rely on no one. Being ${traits[0]} keeps them alive, but it also keeps people at arm's length. Now an old friend has returned asking for help, and ${name} has to decide whether the past is worth facing.`,
    likes: p.some(LIKES, 3),
    dislikes: p.some(DISLIKES, 3),
    strengths: p.some(STRENGTHS, 2),
    flaws: p.some(FLAWS, 2),
    voiceLines: ["I said I'd help. I didn't say I'd be happy about it.", "Give me five minutes and something sticky.", "We're not lost. We're exploring."],
    palette: p.one(PALETTES).map(([hex, nm, use]) => ({ hex, name: nm, use })),
    designNotes: [
      `Silhouette built on ${traits.includes("warm") ? "round, soft shapes" : "sharp, angular shapes"} to read their personality at a glance`,
      i.vibe ? `Overall vibe: ${i.vibe}` : "Layered, worn clothing that shows years of travel",
      "One signature accessory they never take off",
    ],
    storyHooks: [`An old friend asks ${name} to return to ${genre}.`, `Someone has been forging ${name}'s signature.`],
  };
}
