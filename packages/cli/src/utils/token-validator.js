/**
 * Basic format validation for personal access tokens.
 * Not a security check — just catches obvious copy/paste mistakes.
 */

export function validateFigmaToken(token) {
  if (!token || token.trim().length === 0) {
    return { valid: false, message: 'Token is empty' };
  }
  const t = token.trim();
  if (t.startsWith('figd_') && t.length > 10) {
    return { valid: true };
  }
  // Older Figma tokens don't have a prefix
  if (t.length > 20 && !t.includes(' ')) {
    return { valid: true, message: 'Token format looks unusual (no figd_ prefix) but may still work' };
  }
  return { valid: false, message: 'Figma tokens usually start with figd_ — double-check your token' };
}

export function validateGitHubToken(token) {
  if (!token || token.trim().length === 0) {
    return { valid: false, message: 'Token is empty' };
  }
  const t = token.trim();
  // Classic tokens: ghp_, fine-grained: github_pat_
  if ((t.startsWith('ghp_') || t.startsWith('github_pat_')) && t.length > 10) {
    return { valid: true };
  }
  if (t.length > 20 && !t.includes(' ')) {
    return { valid: true, message: 'Token format looks unusual but may still work' };
  }
  return { valid: false, message: 'GitHub tokens usually start with ghp_ or github_pat_ — double-check your token' };
}

export function validateFirecrawlKey(key) {
  if (!key || key.trim().length === 0) {
    return { valid: false, message: 'Key is empty' };
  }
  const k = key.trim();
  if (k.startsWith('fc-') || k.startsWith('fc_')) {
    return { valid: true };
  }
  return { valid: true, message: 'Key format looks unusual (no fc- prefix) but may still work' };
}
