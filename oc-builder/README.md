# OC Forge: AI Character Builder

OC Forge is a browser app that turns a few seed ideas into a complete, original character sheet. You enter a name, archetype, setting, traits, and visual vibe; the app sends a structured prompt to an AI model and displays a character with a backstory, personality, likes and dislikes, voice lines, a color palette, design notes, and story hooks.

**Live demo:** https://vampirefanged.github.io/github-portfolio/projects/oc-builder/

![OC Forge character sheet](../../assets/screenshots/oc-forge-sheet.png)

## Why I built it

I design original characters (OCs) for my art and Roblox work, and the slowest part is often the start: turning a vague idea into a consistent personality, backstory, and color palette. OC Forge speeds up that brainstorming step so I can spend more time drawing. It is a starting point for a designer, not a replacement for one.

## Features

- **Two modes**
  - **Demo mode:** works offline with no API key. It builds a character from hand-written building blocks, seeded by your inputs, so the same seeds give the same result. It does not use AI.
  - **AI mode:** sends your seeds to Google Gemini, OpenAI, or Anthropic Claude using your own API key.
- **Structured output:** the model must return JSON in a fixed shape, which the app validates before displaying.
- **Safe rendering:** all AI text is inserted with `textContent`, never `innerHTML`, so model output cannot inject HTML or scripts.
- **Color palette:** swatches with hex codes, names, and where each color is used.
- **Export:** download the sheet as Markdown or JSON, or copy it as text.
- **History:** your last 8 characters are saved in your browser.
- **Responsive and accessible:** works on phones, keyboard friendly, respects reduced-motion settings, and supports dark mode.

## Technologies

| Area | Used |
| --- | --- |
| Front end | HTML5, CSS3, JavaScript (ES modules), no framework |
| AI APIs | Google Gemini `generateContent`, OpenAI Chat Completions, Anthropic Messages |
| Testing | Node.js built-in test runner (`node --test`) |
| Hosting | GitHub Pages (static) |
| AI-assisted development | Claude (see [AI prompt log](../../docs/ai-prompt-log.md)) |

## How it works

```
Seed form ──► prompt.js ──► providers.js ──► AI provider API
                 │                               │
                 │                       raw JSON text
                 ▼                               ▼
          demo.js (offline)            schema.js: parse + validate
                 │                               │
                 └────────────► app.js: render safely, export, history
```

| File | Responsibility |
| --- | --- |
| `js/prompt.js` | Cleans form input and builds the system prompt and user prompt. The prompt is versioned (`PROMPT_VERSION`). |
| `js/providers.js` | One adapter per AI provider. Converts HTTP errors (401, 404, 429) into readable messages. |
| `js/schema.js` | Extracts JSON from the model's reply and normalizes it: trims text, limits list lengths, and drops invalid hex colors. Reports any missing fields instead of crashing. |
| `js/demo.js` | Deterministic offline generator for the demo mode. |
| `js/export.js` | Converts a character to Markdown. |
| `js/app.js` | UI controller: settings, generation, rendering, history, downloads. |

### Prompt design

The system prompt (in `js/prompt.js`) tells the model to:

1. Create an **original** character and never copy existing franchises or real people.
2. Keep content suitable for a general audience.
3. Keep personality, backstory, likes, and dislikes consistent with the seed traits.
4. Write design notes that an artist can actually draw (silhouette, shape language, clothing).
5. Return **only** a JSON object in an exact shape, with 4–5 hex colors in the palette.

Asking for strict JSON, and then validating it anyway, was the most important design decision. Models sometimes wrap JSON in extra text or skip fields, so `parseModelJson` and `normalizeCharacter` handle those cases and tell the user what was missing.

## Running it

### Use the live site

Open the live demo link above. Demo mode works immediately. For AI mode, open **AI** under Mode, choose a provider, and paste your API key. Google Gemini offers a free tier: create a key at [Google AI Studio](https://aistudio.google.com/app/apikey).

### Run locally

ES modules need a local web server (opening the file directly will not work):

```bash
cd projects/oc-builder
python -m http.server 8000
# then open http://localhost:8000
```

### Run the tests

Requires Node.js 18 or newer.

```bash
cd projects/oc-builder
npm test
```

There are 13 tests covering input cleaning, prompt building, JSON parsing, schema validation, palette filtering, the demo generator, and Markdown export.

## Security and privacy

- The app has **no back end**. Your API key goes directly from your browser to the provider you choose and is never sent to this site.
- The key is kept only in memory unless you tick **Remember key on this device**, which stores it in your browser's local storage. Don't use that option on a shared computer.
- For a production app, the key would belong on a server-side proxy instead of in the browser. That is listed under future improvements.
- Use a key with a low spending limit, and delete it when you're done testing.

## Testing done

| Test | Result |
| --- | --- |
| 13 unit tests (`npm test`) | All pass |
| Demo mode with the example seeds | Character sheet renders |
| AI mode with a simulated Gemini response | Sheet renders; invalid hex color dropped; HTML in the response shown as plain text |
| Rejected API key (simulated 401) | Clear error message shown |
| Phone width (390 px) | No horizontal scrolling |

## Known limitations

- AI output quality depends on the model and on the seeds you give it.
- The demo mode uses a fixed set of phrases, so its characters are less varied than AI ones.
- History is stored per browser and is not synced across devices.

## Future improvements

- A small serverless proxy so visitors can use AI mode without their own key.
- "Regenerate this section" buttons for backstory or palette only.
- Generating a simple reference image from the design notes.
- Saving characters to a shared gallery.

## Screenshots

| Desktop | Phone | AI settings |
| --- | --- | --- |
| ![Desktop](../../assets/screenshots/oc-forge-sheet.png) | ![Phone](../../assets/screenshots/oc-forge-mobile.png) | ![Settings](../../assets/screenshots/oc-forge-settings.png) |

## Author

Chiara (Chi) Melagrani · B.S. Computer Science, Computer Game Development, Lamar University (Dec 2026)
