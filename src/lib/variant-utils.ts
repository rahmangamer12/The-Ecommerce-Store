// -------------------------------------------------------------
//  CJ (and most suppliers) return one variant per COMBINATION,
//  e.g. "Black-14 inches", "Gray-17.3 inches", … — dumping all of
//  those into a single option list gives 15+ long, ugly buttons
//  that overflow on mobile. Real stores show separate selectors:
//  Color [Black · Gray · Green] and Size [14" · 17.3"].
//
//  splitCombinedValues() turns the flat combined list into those
//  clean, separate groups (like the hand-built sample products).
// -------------------------------------------------------------

export type VariantGroup = {
  name: string;
  values: string[];
  valueImages?: Record<string, string>;
};

const COLOR_WORDS = [
  "black", "white", "gray", "grey", "red", "blue", "green", "pink", "yellow",
  "purple", "brown", "beige", "gold", "silver", "navy", "orange", "khaki",
  "ivory", "tan", "rose", "wine", "coffee", "mint", "sky", "multicolor",
  "multi", "transparent", "clear", "champagne", "graphite",
];

function looksLikeColor(s: string): boolean {
  const t = s.toLowerCase().trim();
  return COLOR_WORDS.some(
    (c) => t === c || t.startsWith(c + " ") || t.endsWith(" " + c) || t.includes(c),
  );
}

function looksLikeSize(s: string): boolean {
  return /(inch|inches|cm|mm|["”]|\bsize\b|\bxx?l\b|\bxs\b|\b[sml]\b|\bml\b|\bkg\b|\d)/i.test(
    s,
  );
}

function nameForColumn(values: string[], index: number): string {
  const colorRatio = values.filter(looksLikeColor).length / values.length;
  if (colorRatio >= 0.6) return "Color";
  const sizeRatio = values.filter(looksLikeSize).length / values.length;
  if (sizeRatio >= 0.6) return "Size";
  return index === 0 ? "Style" : `Option ${index + 1}`;
}

/**
 * Split a flat list of combined variant labels into clean, separate option
 * groups. `valueImages` maps each *full* label to its photo (used to give the
 * Color group its per-colour images). Falls back to a single tidy group when
 * the labels don't split consistently.
 */
export function splitCombinedValues(
  values: string[],
  valueImages: Record<string, string> = {},
): VariantGroup[] {
  const clean = values.map((v) => String(v).trim()).filter(Boolean);
  if (!clean.length) return [];

  const splits = clean.map((label) => ({
    label,
    parts: label.split(/\s*-\s*/).map((p) => p.trim()).filter(Boolean),
  }));

  // Most common number of parts across all labels.
  const freq: Record<number, number> = {};
  for (const s of splits) freq[s.parts.length] = (freq[s.parts.length] ?? 0) + 1;
  const common = Number(
    Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0],
  );
  const matching = splits.filter((s) => s.parts.length === common);

  if (common >= 2 && matching.length >= clean.length * 0.6) {
    const groups: VariantGroup[] = [];
    const usedNames = new Set<string>();
    for (let i = 0; i < common; i++) {
      const seen = new Set<string>();
      const colVals: string[] = [];
      for (const s of matching) {
        const v = s.parts[i];
        if (v && !seen.has(v.toLowerCase())) {
          seen.add(v.toLowerCase());
          colVals.push(v);
        }
      }
      // A column with just one value isn't a choice — skip it.
      if (colVals.length < 2) continue;

      let name = nameForColumn(colVals, i);
      while (usedNames.has(name)) name = `${name} `;
      usedNames.add(name);

      const group: VariantGroup = { name: name.trim() || `Option ${i + 1}`, values: colVals };

      if (group.name === "Color") {
        const vi: Record<string, string> = {};
        for (const s of matching) {
          const c = s.parts[i];
          const img = valueImages[s.label];
          if (c && img && !vi[c]) vi[c] = img;
        }
        if (Object.keys(vi).length) group.valueImages = vi;
      }
      groups.push(group);
    }
    if (groups.length) return groups;
  }

  // Fallback: a single, deduped group (keep any per-value images).
  const uniq = Array.from(new Set(clean));
  const vi: Record<string, string> = {};
  for (const v of uniq) if (valueImages[v]) vi[v] = valueImages[v];
  const group: VariantGroup = { name: "Option", values: uniq };
  if (Object.keys(vi).length) group.valueImages = vi;
  return [group];
}

type RawVariant = {
  name?: string;
  values?: unknown[];
  valueImages?: Record<string, string>;
};

/**
 * Normalise stored variants for display. Curated products (multiple named
 * groups) are left untouched; a single combined "Option" group (how CJ imports
 * were stored) is split into clean Color/Size groups — so already-imported
 * products get the better layout with no re-import.
 */
export function regroupVariants(raw: RawVariant[]): VariantGroup[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;
  if (raw.length === 1 && (!raw[0].name || raw[0].name === "Option")) {
    const values = (raw[0].values ?? []).map(String);
    const split = splitCombinedValues(values, raw[0].valueImages ?? {});
    return split.length ? split : (raw as VariantGroup[]);
  }
  return raw as VariantGroup[];
}
