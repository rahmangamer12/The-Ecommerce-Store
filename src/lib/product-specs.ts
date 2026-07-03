// -------------------------------------------------------------
//  Turn a raw product description into a clean, professional
//  layout: a short intro paragraph (any real prose) plus a
//  specifications table built from the "Label: value" lines that
//  CJ (and most suppliers) dump into the description.
// -------------------------------------------------------------

export type Spec = { label: string; value: string };

export type ParsedDescription = {
  intro: string; // free prose (sentences without a "label:" shape)
  specs: Spec[]; // structured key/value rows for a spec table
};

/** Title-case a spec label so "opening method" → "Opening method". */
function tidyLabel(s: string): string {
  const t = s.trim().replace(/\s+/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function parseDescription(description: string): ParsedDescription {
  const lines = description
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const specs: Spec[] = [];
  const introLines: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    // A spec looks like "Label: value" where the label is a short phrase.
    const m = line.match(/^([A-Za-z][A-Za-z0-9 /&()'-]{1,32}):\s*(.+)$/);
    if (m) {
      const label = tidyLabel(m[1]);
      const value = m[2].replace(/\s+/g, " ").trim();
      const key = label.toLowerCase();
      if (value && value.length <= 160 && !seen.has(key)) {
        seen.add(key);
        specs.push({ label, value });
        continue;
      }
    }
    // Otherwise it's prose — keep it for the intro paragraph, but skip bare
    // section headers like "Product information:" (a label with no value).
    if (line.length > 12 && !/:\s*$/.test(line)) introLines.push(line);
  }

  return {
    intro: introLines.join(" ").replace(/\s+/g, " ").slice(0, 600).trim(),
    specs,
  };
}
