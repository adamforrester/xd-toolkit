import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * Render a Mustache-style template with variables.
 *
 * Supports:
 *   {{variable}}            — simple substitution
 *   {{#section}}...{{/section}} — conditional block (included if value is truthy)
 *
 * The {{name}} in routing rules is intentionally NOT a variable — it's literal
 * text meaning "the component name the agent is working on." The template
 * renderer leaves unmatched {{...}} tokens in place.
 */
export function renderTemplate(templateContent, vars) {
  let result = templateContent;

  // Process conditional sections: {{#key}}...{{/key}}
  result = result.replace(
    /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (_, key, content) => {
      return vars[key] ? content : '';
    }
  );

  // Process simple substitutions — only for known variables
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value || '');
  }

  return result;
}

/**
 * Read a template file, render it, and write to the output path.
 */
export function renderTemplateFile(templatePath, outputPath, vars) {
  const template = readFileSync(templatePath, 'utf-8');
  const rendered = renderTemplate(template, vars);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, rendered, 'utf-8');
}
