// app.js
// UI controller for OC Forge. All model output is rendered with textContent,
// never innerHTML, so text from the AI can't inject markup into the page.

import { PROVIDERS } from "./providers.js";
import { hasSeeds, PROMPT_VERSION } from "./prompt.js";
import { normalizeCharacter, parseModelJson } from "./schema.js";
import { generateDemoCharacter } from "./demo.js";
import { toMarkdown } from "./export.js";

const $ = (sel) => document.querySelector(sel);
const STORE = { settings: "ocforge.settings", key: "ocforge.key", history: "ocforge.history" };
const MAX_HISTORY = 8;

const els = {
  form: $("#seed-form"),
  provider: $("#provider"),
  model: $("#model"),
  key: $("#api-key"),
  remember: $("#remember-key"),
  keyLink: $("#key-link"),
  mode: () => document.querySelector('input[name="mode"]:checked').value,
  aiSettings: $("#ai-settings"),
  generate: $("#generate"),
  status: $("#status"),
  empty: $("#empty-state"),
  sheet: $("#sheet"),
  history: $("#history"),
};

let current = null;
let inFlight = null;

// ---------- storage helpers (storage can be blocked; never crash) ----------
function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}
function remove(key) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

// ---------- settings ----------
function initSettings() {
  for (const [id, p] of Object.entries(PROVIDERS)) {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = p.label;
    els.provider.append(opt);
  }
  const s = load(STORE.settings, { provider: "gemini", model: PROVIDERS.gemini.defaultModel, mode: "demo" });
  els.provider.value = PROVIDERS[s.provider] ? s.provider : "gemini";
  els.model.value = s.model || PROVIDERS[els.provider.value].defaultModel;
  const savedKey = load(STORE.key, "");
  if (savedKey) { els.key.value = savedKey; els.remember.checked = true; }
  const modeInput = document.querySelector(`input[name="mode"][value="${s.mode === "ai" ? "ai" : "demo"}"]`);
  if (modeInput) modeInput.checked = true;
  syncSettingsUI();

  els.provider.addEventListener("change", () => {
    els.model.value = PROVIDERS[els.provider.value].defaultModel;
    syncSettingsUI();
    persistSettings();
  });
  els.model.addEventListener("change", persistSettings);
  els.remember.addEventListener("change", persistKey);
  els.key.addEventListener("change", persistKey);
  document.querySelectorAll('input[name="mode"]').forEach((r) => r.addEventListener("change", () => { syncSettingsUI(); persistSettings(); }));
}

function syncSettingsUI() {
  els.keyLink.href = PROVIDERS[els.provider.value].keyHelp;
  els.aiSettings.hidden = els.mode() !== "ai";
  els.generate.textContent = els.mode() === "ai" ? "Forge character with AI" : "Forge demo character";
}

function persistSettings() {
  save(STORE.settings, { provider: els.provider.value, model: els.model.value.trim(), mode: els.mode() });
}

function persistKey() {
  if (els.remember.checked && els.key.value.trim()) save(STORE.key, els.key.value.trim());
  else remove(STORE.key);
}

// ---------- generation ----------
function readInputs() {
  const fd = new FormData(els.form);
  return {
    name: fd.get("name"),
    archetype: fd.get("archetype"),
    genre: fd.get("genre"),
    traits: fd.get("traits"),
    vibe: fd.get("vibe"),
    notes: fd.get("notes"),
  };
}

function setStatus(message, kind = "info", { allowRetry = false } = {}) {
  els.status.textContent = "";
  els.status.dataset.kind = kind;
  els.status.hidden = !message;

  if (!message) return;

  els.status.append(document.createTextNode(message));

  if (allowRetry) {
    const retryBtn = document.createElement("button");
    retryBtn.type = "button";
    retryBtn.className = "retry-btn";
    retryBtn.textContent = "Try again";
    retryBtn.addEventListener("click", () => {
      els.form.requestSubmit();
    });
    els.status.append(" ", retryBtn);
  }
}

async function onGenerate(event) {
  event.preventDefault();
  const inputs = readInputs();
  if (!hasSeeds(inputs)) {
    setStatus("Add at least one seed, like a name, archetype, or a few traits.", "error");
    return;
  }

  if (els.mode() === "demo") {
    const { character, problems } = normalizeCharacter(generateDemoCharacter(inputs));
    show(character, { source: "Offline demo (no AI)", problems });
    setStatus("Demo character created offline. Switch to AI mode for a fully original result.", "info");
    return;
  }

  const apiKey = els.key.value.trim();
  if (!apiKey) {
    setStatus("Enter an API key in AI settings, or switch to Demo mode.", "error");
    els.key.focus();
    return;
  }

  inFlight?.abort();
  inFlight = new AbortController();
  const timeout = setTimeout(() => inFlight.abort(), 45000);
  const provider = PROVIDERS[els.provider.value];
  const model = els.model.value.trim() || provider.defaultModel;

  els.generate.disabled = true;
  setStatus("Forging your character…", "busy");
  try {
    const text = await provider.generate({ apiKey, model, inputs, signal: inFlight.signal });
    const { character, problems } = normalizeCharacter(parseModelJson(text));
    show(character, { source: `${provider.label.split(" (")[0]} · ${model} · prompt v${PROMPT_VERSION}`, problems });
    setStatus(problems.length ? `Done, with a few gaps: ${problems.join(" ")}` : "Done! Your character is ready.", problems.length ? "warn" : "ok");
  } catch (err) {
    const msg = err.name === "AbortError" ? "The request timed out. Try again." : err.message;
    setStatus(msg || "Something went wrong.", "error", { allowRetry: true });
  } finally {
    clearTimeout(timeout);
    els.generate.disabled = false;
  }
}

// ---------- rendering ----------
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

function listBlock(title, items, cls = "") {
  const box = el("div", `block ${cls}`);
  box.append(el("h3", "", title));
  if (!items.length) { box.append(el("p", "muted", "—")); return box; }
  const ul = el("ul");
  items.forEach((t) => ul.append(el("li", "", t)));
  box.append(ul);
  return box;
}

function show(character, meta, { remember = true } = {}) {
  current = { character, meta };
  const s = els.sheet;
  s.replaceChildren();

  const head = el("header", "sheet-head");
  const titleWrap = el("div");
  titleWrap.append(el("p", "eyebrow", character.role || "Original character"));
  titleWrap.append(el("h2", "", character.name));
  if (character.tagline) titleWrap.append(el("p", "tagline", character.tagline));
  head.append(titleWrap);
  if (character.age) head.append(el("p", "age", `Age ${character.age}`));
  s.append(head);

  if (character.personality.length) {
    const chips = el("div", "chips");
    character.personality.forEach((t) => chips.append(el("span", "chip", t)));
    s.append(chips);
  }

  if (character.palette.length) {
    const pal = el("div", "palette");
    character.palette.forEach((c) => {
      const sw = el("div", "swatch");
      const color = el("div", "swatch-color");
      color.style.background = c.hex;
      sw.append(color, el("strong", "", c.name), el("span", "", c.hex), el("span", "muted", c.use));
      pal.append(sw);
    });
    s.append(pal);
  }

  const story = el("div", "block wide");
  story.append(el("h3", "", "Backstory"), el("p", "", character.backstory || "—"));
  s.append(story);

  const grid = el("div", "grid");
  grid.append(
    listBlock("Likes", character.likes),
    listBlock("Dislikes", character.dislikes),
    listBlock("Strengths", character.strengths),
    listBlock("Flaws", character.flaws),
  );
  s.append(grid);

  const voice = el("div", "block wide voice");
  voice.append(el("h3", "", "In their own words"));
  character.voiceLines.forEach((v) => voice.append(el("blockquote", "", `“${v.replace(/^["“]|["”]$/g, "")}”`)));
  s.append(voice);

  const lower = el("div", "grid two");
  lower.append(listBlock("Design notes", character.designNotes), listBlock("Story hooks", character.storyHooks));
  s.append(lower);

  const foot = el("footer", "sheet-foot");
  foot.append(el("span", "muted", `Generated by: ${meta.source}`));
  const actions = el("div", "actions");
  const btnMd = el("button", "btn ghost", "Download Markdown");
  btnMd.type = "button";
  btnMd.addEventListener("click", () => download(`${slug(character.name)}.md`, toMarkdown(character, meta.source), "text/markdown"));
  const btnJson = el("button", "btn ghost", "Download JSON");
  btnJson.type = "button";
  btnJson.addEventListener("click", () => download(`${slug(character.name)}.json`, JSON.stringify(character, null, 2), "application/json"));
  const btnCopy = el("button", "btn ghost", "Copy as text");
  btnCopy.type = "button";
  btnCopy.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(toMarkdown(character, meta.source)); setStatus("Copied to clipboard.", "ok"); }
    catch { setStatus("Copy was blocked by the browser. Use Download Markdown instead.", "warn"); }
  });
  actions.append(btnMd, btnJson, btnCopy);
  foot.append(actions);
  s.append(foot);

  els.empty.hidden = true;
  s.hidden = false;
  if (remember) addToHistory(current);
  s.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- history ----------
function addToHistory(entry) {
  const list = load(STORE.history, []).filter((h) => h.character.name !== entry.character.name);
  list.unshift({ ...entry, at: Date.now() });
  save(STORE.history, list.slice(0, MAX_HISTORY));
  renderHistory();
}

function renderHistory() {
  const list = load(STORE.history, []);
  els.history.replaceChildren();
  if (!list.length) { els.history.append(el("li", "muted", "Characters you forge will appear here.")); return; }
  list.forEach((h) => {
    const li = el("li");
    const b = el("button", "history-item");
    b.type = "button";
    const dot = el("span", "dot");
    dot.style.background = h.character.palette?.[0]?.hex || "#999";
    b.append(dot, el("span", "", h.character.name));
    b.addEventListener("click", () => show(h.character, h.meta, { remember: false }));
    li.append(b);
    els.history.append(li);
  });
}

// ---------- utilities ----------
function slug(text) {
  return (text || "character").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "character";
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = el("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

$("#clear-history").addEventListener("click", () => { remove(STORE.history); renderHistory(); });
$("#example").addEventListener("click", () => {
  els.form.name.value = "Kiki";
  els.form.archetype.value = "gentle giant islander";
  els.form.genre.value = "tropical port town";
  els.form.traits.value = "quiet, protective, dry humor, loves coconuts";
  els.form.vibe.value = "warm oranges, curly hair, relaxed streetwear";
  els.form.notes.value = "Hates flies and awkward conversations.";
});

els.form.addEventListener("submit", onGenerate);
initSettings();
renderHistory();
