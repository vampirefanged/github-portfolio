# AI Prompt Log

**Project:** COSC 4272 Senior Seminar Portfolio and OC Forge
**Student:** Chiara Melagrani
**AI tool used:** Claude (Anthropic), in the Claude desktop app
**Dates:** November 2026

This log records how I used AI during development: what I asked, what the AI produced, and what I decided, checked, or changed myself. It is meant to be an honest account of the development process.

## How I used AI

| Area | AI's role | My role |
| --- | --- | --- |
| Project idea | Suggested three AI-assistant ideas tied to my interests | Chose OC Forge because it matches my character design work |
| Website | Adapted the portfolio design we had built earlier into GitHub Pages files | Supplied all artwork, Roblox items, facts, and wording choices; decided which art to show |
| OC Forge code | Wrote the first version of the JavaScript modules, CSS, and tests | Defined the features, reviewed and tested the code, and checked the output |
| Documentation | Drafted READMEs and analysis documents | Reviewed for accuracy and filled in personal details |

## Prompt log

### 1. Choosing the project

> **My prompt:** *[Uploaded the COSC 4272 project PDF]* "As a graduating Computer Science student, you are expected to demonstrate your technical abilities… The detailed instructions are attached."

**AI response:** Read the requirements and asked me to choose between three AI-assistant ideas (OC Character Builder, Roblox Listing Assistant, Game Story Pitch Generator), how the website should look, and which accounts I already had.

**My decision:** OC Character Builder, adapting my existing portfolio design, and I already have GitHub and LinkedIn accounts.

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

**Iterations:** The prompt was written in one pass (v1.2 is the version number in the code). The key choices were requiring an exact JSON shape, requiring original characters, and asking for "drawable" design notes so results are usable for real art. Record any changes you make after testing with a real key in the table below.

| Version | Change | Why |
| --- | --- | --- |
| 1.2 | Initial version | — |

*[Add any prompt changes you make after testing with your own API key.]*

---

### 4. Testing and fixes

**Step (done by the AI as part of building the project, not a separate prompt from me):** unit tests for the schema, prompt, demo, and export modules.

**AI output:** 13 tests using Node's built-in test runner.

**Issue found:** `node --test tests/` failed to find the tests with Node 22. Running `node --test` with no folder argument fixed it, so `package.json` uses `"test": "node --test"`.

**Browser testing (with the AI's help):**

| Check | Result |
| --- | --- |
| Demo mode with the example seeds | Passed |
| AI mode with a simulated Gemini reply | Passed |
| Reply containing an invalid color and HTML tags | Invalid color dropped; HTML shown as plain text |
| Simulated 401 (bad key) | Showed "The API key was rejected (401)…" |
| Phone width | No sideways scrolling |

*[Add your own test with a real Gemini key here: the seeds you used, the character it returned, and anything you changed.]*

---

### 5. Portfolio website and documents

**Step (from my choice "Adapt my current portfolio"):** adapt the portfolio into the required sections: Home, About (250+ words), Resume, Projects, Skills, Contact.

**AI response:** Built `index.html`, `css/style.css`, and `js/main.js`; wrote a 266-word About section from facts I had shared; built a one-page resume PDF.

**My review:** Checked every fact (graduation date, Roblox numbers, jobs). Filled in the placeholders marked with brackets: phone, LinkedIn, GitHub, course project, certifications, and photo.

**Step (part of the same request):** job search analysis and skills gap analysis.

**AI response:** Searched for current entry-level game design postings, summarized their requirements, and compared them with my skills.

**My review:** *[Note any postings you added or changed.]*

## Reflection on using AI

AI made me much faster at writing boilerplate code, CSS, and documentation, and it was useful for thinking through edge cases like malformed model output. It was not a substitute for judgment: I still had to decide what the tool should do, choose what to show employers, check every fact, and test that the app actually works. The most valuable lesson was that AI output needs to be treated like any untrusted input. That is true when building with an AI model, and it's also true when using one as a coding assistant.

*[Rewrite this reflection in your own words.]*
