# AI Prompt Log

**Project:** COSC 4272 Senior Seminar Portfolio and OC Forge
**Student:** Chiara Melagrani
**AI tool used:** Claude, Gemini
**Dates:** November 2026

This log records how I used AI during development: what I asked, what the AI produced, and what I decided, checked, or changed myself.

## How I used AI

| Area | AI's role | My role |
| --- | --- | --- |
| Project idea | Suggested three AI-assistant ideas tied to my interests | Chose OC Forge because it matches my character design work |
| Website | Adapted my original portfolio design into GitHub Pages files | Supplied initial website, artwork, Roblox items, facts, and writing; decided which art to show |
| OC Forge code | Wrote the first version of the JavaScript modules, CSS, and tests | Defined features, reviewed,edited, and tested the code, checked the output, added my own tweaks |
| Documentation | N/A | Utilized AI's prior assistance to complete the documentation |

## Prompt log

### 1. Choosing the project

> **My prompt:** Shared the instructions of the project with Claude.

**AI response:** Read the requirements and asked me to choose between three AI-assistant ideas (OC Character Builder, Roblox Listing Assistant, Game Story Pitch Generator).

**My decision:** OC Character Builder

**Why:** Character design is my specialty. Building a tool for my own workflow shows both my creative focus and my programming skills.

---

### 2. Designing OC Forge

**Requirements I gave or approved:**

- Turn seed ideas into a full character sheet: backstory, personality, likes/dislikes, palette, design notes.
- Must work for visitors who don't have an API key.
- Must be a static site so it runs on GitHub Pages.

**AI response:** Proposed a module structure (`prompt.js`, `providers.js`, `schema.js`, `demo.js`, `export.js`, `app.js`), support for three providers, and an offline demo mode.

**Key design decisions:**

| Decision | Reason |
| --- | --- |
| Model must return strict JSON in a fixed shape | Lets the app render consistent sections instead of free text |
| Validate and clean every field (`schema.js`) | Models sometimes skip fields or add extra text; the app should warn, not crash |
| Render with `textContent`, never `innerHTML` | Prevents AI output from injecting HTML or scripts into the page |
| User supplies their own API key | GitHub Pages has no server, and a key in public code would be stolen |
| Offline demo mode, labeled as "no AI" | Recruiters can try the app without a key, and it's honest about what is AI-generated |

---

### 3. The system prompt

**Final prompt (v1.2), in `js/prompt.js`:**

```
You are OC Forge, a character design assistant for game developers and artists.
Turn the user's seed ideas into one original character sheet.
Rules:
- Create an ORIGINAL character. Never copy or reference existing franchises,
  celebrities, or copyrighted characters.
- Keep content suitable for a general audience.
- Make personality, backstory, likes and dislikes consistent with each other
  and with the seed traits.
- Design notes must be visual and drawable: silhouette, shape language,
  clothing, signature accessories.
- The palette must contain 4 or 5 colors as 6-digit hex codes.
- Respond with ONLY a JSON object, no markdown, matching exactly this shape: {...}
```

**Iterations:** The prompt was written in one pass. The key choices were requiring an exact JSON shape, requiring original characters, and asking for "drawable" design notes so results are usable for real art. Here are recorded changes:

| Version | Change | Why |
| --- | --- | --- |
| 1.2 | Initial version | — |
| 1.3 | Second version | Error 404 and 503 fix, added gemini-3.8-flash-lite as the default |
| 1.4 | Third version | Added live character count, more examples, and more for the offline demo. |


---

### 4. Testing and fixes

**Step:** unit tests for the schema, prompt, demo, and export modules.

**AI output:** 13 tests using Node's built-in test runner.

**Issue found:** `node --test tests/` failed to find the tests with Node 22. Running `node --test` with no folder argument fixed it, so `package.json` uses `"test": "node --test"`.

**Browser testing:**

| Check | Result |
| --- | --- |
| Demo mode with the example seeds | Passed |
| AI mode with a simulated Gemini reply | Passed |
| Reply containing an invalid color and HTML tags | Invalid color dropped; HTML shown as plain text |
| Simulated 401 (bad key) | Showed "The API key was rejected (401)…" |
| Phone width | No sideways scrolling |
| Added live character count | Allowed users to see the 300 character limit |

| Testing | Result |
| --- |  --- |
| Testing Gemini Key AQ.Ab8RN6KcZytIput_vo6qg0hWI5q2YXktaPp5tcE_GGT99dPnug with gemini-2.5-flash | Initially gave error 404 |
| Testing Gemini Key (2) AQ.Ab8RN6KcZytIput_vo6qg0hWI5q2YXktaPp5tcE_GGT99dPnug with gemini-3.8-flash | Gave error 504 |
| Testing Gemini Key (3) AQ.Ab8RN6KcZytIput_vo6qg0hWI5q2YXktaPp5tcE_GGT99dPnug with gemini-3.8-flash-lite | Passed |
| Testing live character count | Passed |
| Utilized Node.js to run 'npm tests' locally after updating the word lists, adding character count, and retry button. | 13/13 Passed
---

### 5. Portfolio website and documents

**Step:** adapt original portfolio into the required sections: Home, About (with provided written information)

**AI response:** Built `index.html`, `css/style.css`, and `js/main.js`; pasted the provided 266-word About section.

**My review:** Checked .html, .css, and .js and made my own changes.

**Step:** Help with job search

**AI response:** Searched for current entry-level game design postings, summarized their requirements, and compared them with my skills.

**My review:** Reviewed what was found, changed what was written.

## Reflection on using AI

AI made me much faster at writing boilerplate code and CSS, and it was useful for thinking through edge cases like malformed model output. It was not a substitute, as I still had to decide what the tool should do, choose what to show employers, check every fact, alter coding, and test that the app actually works. The most valuable lesson was that AI output needs to be treated like any untrusted input. That is true when building with an AI model, and it's also true when using one as a coding assistant.
