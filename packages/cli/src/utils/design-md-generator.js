import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as yamlParse, stringify as yamlStringify } from 'yaml';

/**
 * Generate a design.md file at project root from a .brand/ directory.
 *
 * design.md follows the google-labs-code/design.md spec:
 * https://github.com/google-labs-code/design.md/blob/main/docs/spec.md
 *
 * Sections (in spec-defined order):
 *   1. Overview     ← .brand/overview.md
 *   2. Colors       ← .brand/tokens/colors.md (frontmatter + prose)
 *   3. Typography   ← .brand/tokens/typography.md
 *   4. Layout       ← .brand/tokens/spacing.md
 *   5. Elevation    ← .brand/tokens/surfaces.md (elevation only)
 *   6. Shapes       ← .brand/tokens/surfaces.md (rounded only)
 *   7. Components   ← summary of .brand/components/*.md (if any)
 *   8. Do's and Don'ts ← .brand/composition/anti-patterns.md + overview self-test
 *
 * Frontmatter merges colors / typography / spacing / rounded from token file
 * frontmatters. The XD Toolkit-only `elevation` block is included as well —
 * spec consumers ignore unknown keys per the design.md spec.
 *
 * The function is forgiving — missing files, empty placeholders, and
 * commented-out frontmatter all degrade gracefully to a skeleton output.
 */
export function generateDesignMd(brandDir, brandName = 'Brand') {
  const tokens = {
    colors: readTokensFromFile(brandDir, 'tokens/colors.md', 'colors'),
    typography: readTokensFromFile(brandDir, 'tokens/typography.md', 'typography'),
    spacing: readTokensFromFile(brandDir, 'tokens/spacing.md', 'spacing'),
    rounded: readTokensFromFile(brandDir, 'tokens/surfaces.md', 'rounded'),
    elevation: readTokensFromFile(brandDir, 'tokens/surfaces.md', 'elevation'),
  };

  const frontmatter = buildFrontmatter(brandName, tokens);
  const body = buildBody(brandDir);

  return `${frontmatter}\n${body}`;
}

/**
 * Read a single top-level key from the YAML frontmatter of a brand file.
 * Returns the parsed value or null if the file or key is absent.
 */
function readTokensFromFile(brandDir, relPath, key) {
  const fullPath = join(brandDir, relPath);
  if (!existsSync(fullPath)) return null;

  const content = readFileSync(fullPath, 'utf-8');
  const fm = extractFrontmatter(content);
  if (!fm) return null;

  try {
    const parsed = yamlParse(fm);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed[key] || null;
  } catch {
    return null;
  }
}

/**
 * Extract the YAML frontmatter block from a markdown string.
 * Returns the inner YAML text, or null if no frontmatter is present.
 */
function extractFrontmatter(content) {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith('---')) return null;
  const rest = trimmed.slice(3);
  const end = rest.indexOf('\n---');
  if (end === -1) return null;
  return rest.slice(0, end).trim();
}

/**
 * Build the YAML frontmatter for design.md. Only includes sections that have
 * at least one populated token — empty maps are omitted.
 */
function buildFrontmatter(brandName, tokens) {
  const fm = {
    version: 'alpha',
    name: brandName,
  };

  if (tokens.colors && Object.keys(tokens.colors).length > 0) fm.colors = tokens.colors;
  if (tokens.typography && Object.keys(tokens.typography).length > 0) fm.typography = tokens.typography;
  if (tokens.rounded && Object.keys(tokens.rounded).length > 0) fm.rounded = tokens.rounded;
  if (tokens.spacing && Object.keys(tokens.spacing).length > 0) fm.spacing = tokens.spacing;
  if (tokens.elevation && Object.keys(tokens.elevation).length > 0) fm.elevation = tokens.elevation;

  return `---\n${yamlStringify(fm).trimEnd()}\n---\n`;
}

/**
 * Build the markdown body, stitching together prose from .brand/ files
 * in the spec-defined section order.
 */
function buildBody(brandDir) {
  const sections = [];

  sections.push(buildOverviewSection(brandDir));
  sections.push(buildTokenSection(brandDir, 'tokens/colors.md', 'Colors'));
  sections.push(buildTokenSection(brandDir, 'tokens/typography.md', 'Typography'));
  sections.push(buildTokenSection(brandDir, 'tokens/spacing.md', 'Layout & Spacing'));
  sections.push(buildSurfacesSplit(brandDir));
  sections.push(buildComponentsSection(brandDir));
  sections.push(buildDosAndDontsSection(brandDir));

  return sections.filter(Boolean).join('\n\n');
}

/**
 * Read prose-only content from a .brand/ file (everything after the frontmatter
 * and the first H1). Returns an empty string if the file doesn't exist.
 */
function readProse(brandDir, relPath) {
  const fullPath = join(brandDir, relPath);
  if (!existsSync(fullPath)) return '';

  let content = readFileSync(fullPath, 'utf-8');

  // Strip frontmatter
  const trimmed = content.trimStart();
  if (trimmed.startsWith('---')) {
    const rest = trimmed.slice(3);
    const end = rest.indexOf('\n---');
    if (end !== -1) content = rest.slice(end + 4).trimStart();
  }

  // Strip leading H1
  content = content.replace(/^#\s+[^\n]+\n+/, '');

  return content.trim();
}

function buildOverviewSection(brandDir) {
  const prose = readProse(brandDir, 'overview.md');
  if (!prose) {
    return '## Overview\n\n<!-- Populate .brand/overview.md with brand identity, personality, and visual language. -->';
  }
  return `## Overview\n\n${prose}`;
}

function buildTokenSection(brandDir, relPath, heading) {
  const prose = readProse(brandDir, relPath);
  if (!prose) {
    return `## ${heading}\n\n<!-- Populate .brand/${relPath} (frontmatter for tokens, prose for rationale). -->`;
  }
  return `## ${heading}\n\n${prose}`;
}

/**
 * Surfaces splits into two design.md sections: Elevation & Depth and Shapes.
 * The .brand/tokens/surfaces.md file's prose is included whole under
 * Elevation & Depth; if the file isn't populated, both sections get skeletons.
 */
function buildSurfacesSplit(brandDir) {
  const prose = readProse(brandDir, 'tokens/surfaces.md');
  if (!prose) {
    return [
      '## Elevation & Depth\n\n<!-- Populate .brand/tokens/surfaces.md (elevation portion). -->',
      '## Shapes\n\n<!-- Populate .brand/tokens/surfaces.md (radius portion). -->',
    ].join('\n\n');
  }
  // No reliable structural split between elevation and shapes inside the prose,
  // so include the whole prose under Elevation & Depth and a pointer under Shapes.
  return [
    `## Elevation & Depth\n\n${prose}`,
    '## Shapes\n\nSee Elevation & Depth above and the `rounded` tokens in the frontmatter.',
  ].join('\n\n');
}

function buildComponentsSection(brandDir) {
  const componentsDir = join(brandDir, 'components');
  if (!existsSync(componentsDir)) return '';

  // Could enumerate components/*.md and summarise each, but for now just
  // point readers at the directory. /brand-extract will fill in detail.
  return '## Components\n\n<!-- See .brand/components/ for per-component specs. design.md component token mappings will be auto-populated by /brand-extract. -->';
}

function buildDosAndDontsSection(brandDir) {
  const antiPatterns = readProse(brandDir, 'composition/anti-patterns.md');
  const overview = readProse(brandDir, 'overview.md');

  const selfTestMatch = overview.match(/##\s+Brand self-test[^\n]*\n([\s\S]*?)(?=\n##\s|$)/i);
  const selfTest = selfTestMatch ? selfTestMatch[1].trim() : '';

  const parts = [];
  if (antiPatterns) parts.push(antiPatterns);
  if (selfTest) parts.push(`### Brand self-test\n\n${selfTest}`);

  if (parts.length === 0) {
    return "## Do's and Don'ts\n\n<!-- Populate .brand/composition/anti-patterns.md and the brand self-test in overview.md. -->";
  }

  return `## Do's and Don'ts\n\n${parts.join('\n\n')}`;
}
