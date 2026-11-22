// providers.js
// One small adapter per AI provider. Each returns the model's raw text.
// The API key is supplied by the user and sent only to the provider they chose.

import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt.js";

export const PROVIDERS = {
  gemini: {
    label: "Google Gemini (free tier available)",
    defaultModel: "gemini-3.5-flash-lite",
    keyHelp: "https://aistudio.google.com/app/apikey",
    async generate({ apiKey, model, inputs, signal }) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      const res = await fetch(url, {
        method: "POST",
        signal,
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: "user", parts: [{ text: buildUserPrompt(inputs) }] }],
          generationConfig: { temperature: 0.9, responseMimeType: "application/json" },
        }),
      });
      const data = await readJson(res);
      const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("");
      if (!text) throw new Error("Gemini returned an empty response. It may have been blocked by a safety filter; try different seeds.");
      return text;
    },
  },

  openai: {
    label: "OpenAI",
    defaultModel: "gpt-4o-mini",
    keyHelp: "https://platform.openai.com/api-keys",
    async generate({ apiKey, model, inputs, signal }) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        signal,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          temperature: 0.9,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: buildUserPrompt(inputs) },
          ],
        }),
      });
      const data = await readJson(res);
      const text = data?.choices?.[0]?.message?.content;
      if (!text) throw new Error("OpenAI returned an empty response.");
      return text;
    },
  },

  anthropic: {
    label: "Anthropic Claude",
    defaultModel: "claude-haiku-4-5",
    keyHelp: "https://console.anthropic.com/settings/keys",
    async generate({ apiKey, model, inputs, signal }) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1500,
          temperature: 0.9,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: buildUserPrompt(inputs) }],
        }),
      });
      const data = await readJson(res);
      const text = data?.content?.filter((b) => b.type === "text").map((b) => b.text).join("");
      if (!text) throw new Error("Claude returned an empty response.");
      return text;
    },
  },
};

/** Parse a fetch response, turning HTTP errors into readable messages. */
async function readJson(res) {
  let data = null;
  try { data = await res.json(); } catch { /* non-JSON error body */ }
  if (!res.ok) {
    const detail = data?.error?.message || data?.error?.type || res.statusText;
    if (res.status === 401 || res.status === 403) throw new Error(`The API key was rejected (${res.status}). Check that it is correct and active.`);
    if (res.status === 404) throw new Error(`Model not found (${res.status}). Check the model name in Settings.`);
    if (res.status === 429) throw new Error("Rate limit reached. Wait a minute and try again.");
    if (res.status === 503) throw new Error("The AI service is busy right now. Wait a minute and try again, or switch to a lighter model in Settings.");
    throw new Error(`Request failed (${res.status}): ${detail}`);
  }
  return data;
}
