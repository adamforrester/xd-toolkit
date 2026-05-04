import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Generate condensed brand context for the Impeccable skill.
 *
 * Impeccable reads `.impeccable.md` from the project root on every interaction
 * and uses it to inform design decisions. The file must be DENSE — every line
 * is loaded into context. Aim for ~200-400 tokens, not a wall of text.
 *
 * Inputs:
 *   - .brand/overview.md     → brand identity, personality, visual language, anti-patterns, self-test
 *   - .brand/voice.md        → voice attributes, anti-attributes (top-level only)
 *
 * Output: a single-file Markdown summary with pointers to deeper sources.
 *
 * The function is forgiving — if .brand/ files are missing or empty, it
 * produces a stub with TODO markers rather than failing.
 */
export function generateImpeccableMd(brandDir, brandName = 'Brand') {
  const overview = readBrandFile(brandDir, 'overview.md');
  const voice = readBrandFile(brandDir, 'voice.md');

  const sections = [];
  sections.push(`# Brand Context — ${brandName}`);
  sections.push('');
  sections.push('Loaded by the Impeccable skill on every interaction. Generated from `.brand/` — edit there, not here. Re-run `xd-toolkit refresh-impeccable` (or `/brand-extract`) to regenerate.');
  sections.push('');

  sections.push(buildIdentityBlock(overview));
  sections.push(buildPersonalityBlock(overview));
  sections.push(buildVisualBlock(overview));
  sections.push(buildVoiceBlock(voice));
  sections.push(buildAntiPatternsBlock(overview));
  sections.push(buildSelfTestBlock(overview));
  sections.push(buildPointersBlock(brandDir));

  return sections.filter(Boolean).join('\n\n') + '\n';
}

function readBrandFile(brandDir, relPath) {
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
  return content;
}

/**
 * Pull a section by H2 heading. Returns the body text (without the heading)
 * up to the next H2 or end of file. Returns empty string if not found.
 */
function pullSection(content, headingPattern) {
  if (!content) return '';
  const re = new RegExp(`##\\s+${headingPattern}[^\\n]*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, 'i');
  const m = content.match(re);
  return m ? m[1].trim() : '';
}

function buildIdentityBlock(overview) {
  const block = pullSection(overview, '(Brand Identity|Identity)');
  if (!block) return '## Identity\n\n_Run `/brand-extract` to populate from brand sources._';
  return `## Identity\n\n${block}`;
}

function buildPersonalityBlock(overview) {
  const block = pullSection(overview, '(Brand Personality|Personality)');
  if (!block) return '';
  return `## Personality\n\n${block}`;
}

function buildVisualBlock(overview) {
  const block = pullSection(overview, '(Visual Language|Visual)');
  if (!block) return '';
  return `## Visual language\n\n${block}`;
}

function buildVoiceBlock(voice) {
  if (!voice) return '';
  // Pull just the top-level voice principles, not the observed-voice section.
  const principles = pullSection(voice, '(Voice Principles|Principles)');
  if (!principles) return '';
  return `## Voice (summary)\n\n${principles}\n\n_Full voice rules live at \`.brand/voice.md\`._`;
}

function buildAntiPatternsBlock(overview) {
  // Aesthetic anti-patterns are typically in the "Competitive Context" section.
  const competitive = pullSection(overview, '(Competitive Context|Competitive|Differentiation)');
  if (!competitive) return '';

  // Try to extract the anti-pattern lines if they're called out specifically.
  const antiMatch = competitive.match(/(?:Aesthetic anti-patterns?|Anti-patterns?|NOT)[^\n]*\n([\s\S]*?)(?=\n\*\*|$)/i);
  if (antiMatch) {
    return `## Aesthetic anti-patterns\n\n${antiMatch[0].trim()}`;
  }
  return `## Competitive context\n\n${competitive}`;
}

function buildSelfTestBlock(overview) {
  const block = pullSection(overview, '(Brand self-test|Self-test)');
  if (!block) return '';
  return `## Brand self-test (run before presenting)\n\n${block}`;
}

function buildPointersBlock(brandDir) {
  const candidates = [
    ['tokens/colors.md', 'Color tokens'],
    ['tokens/typography.md', 'Typography tokens'],
    ['tokens/spacing.md', 'Spacing tokens'],
    ['tokens/surfaces.md', 'Radius and shadow tokens'],
    ['voice.md', 'Full voice rules'],
    ['composition/anti-patterns.md', 'Composition anti-patterns'],
    ['conflicts.md', 'Active brand conflicts'],
  ];
  const lines = [];
  for (const [rel, label] of candidates) {
    if (existsSync(join(brandDir, rel))) {
      lines.push(`- \`.brand/${rel}\` — ${label}`);
    }
  }
  if (lines.length === 0) return '';
  return `## Deeper context\n\nLoad these files when their domain comes up:\n\n${lines.join('\n')}`;
}
