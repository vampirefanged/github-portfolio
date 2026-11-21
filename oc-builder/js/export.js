// export.js
// Converts a normalized character into a Markdown character sheet.

const list = (items) => (items.length ? items.map((t) => `- ${t}`).join("\n") : "- —");

export function toMarkdown(c, source = "") {
  return [
    `# ${c.name}`,
    c.tagline ? `*${c.tagline}*` : "",
    "",
    `**Role:** ${c.role || "—"}  `,
    `**Age:** ${c.age || "—"}  `,
    `**Personality:** ${c.personality.join(", ") || "—"}`,
    "",
    "## Backstory",
    c.backstory || "—",
    "",
    "## Likes", list(c.likes), "",
    "## Dislikes", list(c.dislikes), "",
    "## Strengths", list(c.strengths), "",
    "## Flaws", list(c.flaws), "",
    "## Voice lines", list(c.voiceLines.map((v) => `"${v}"`)), "",
    "## Color palette",
    c.palette.length ? c.palette.map((p) => `- ${p.hex} — ${p.name}${p.use ? ` (${p.use})` : ""}`).join("\n") : "- —",
    "",
    "## Design notes", list(c.designNotes), "",
    "## Story hooks", list(c.storyHooks), "",
    source ? `---\nGenerated with OC Forge · ${source}` : "",
  ].join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}
