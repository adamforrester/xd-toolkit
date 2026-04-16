---
name: figma-plugin-dev
description: |
  Figma plugin development — two-context architecture, message passing,
  NEVER/ALWAYS rules preventing common LLM mistakes. Auto-triggers on
  any Figma plugin work.
---

# Figma Plugin Development

This skill provides rules and patterns for building Figma plugins correctly.
Figma plugins have a unique two-context architecture that LLMs frequently
get wrong. These rules prevent the most common mistakes.

## Architecture: Two Contexts

Figma plugins run in TWO separate JavaScript contexts that communicate
via message passing:

```
┌─────────────────────┐     postMessage()     ┌─────────────────────┐
│   Plugin Sandbox    │ ◄──────────────────► │     UI (iframe)      │
│                     │                       │                     │
│ - figma.* API       │                       │ - DOM access         │
│ - No DOM            │                       │ - No figma.* API     │
│ - No fetch          │                       │ - fetch OK           │
│ - No localStorage   │                       │ - localStorage OK    │
│                     │                       │                     │
│ code.ts / code.js   │                       │ ui.html + ui.ts      │
└─────────────────────┘                       └─────────────────────┘
```

## NEVER Do These (Common LLM Mistakes)

1. **NEVER import figma API in UI code.** The `figma` global only exists
   in the sandbox context. UI code cannot access it.

2. **NEVER use DOM APIs in plugin code (code.ts).** `document`,
   `window`, `fetch`, `localStorage` — none of these exist in the
   sandbox. Use `figma.ui.postMessage()` to ask the UI to do it.

3. **NEVER import UI framework code into code.ts.** React, Preact,
   etc. need DOM — they only work in the UI iframe.

4. **NEVER use `require()`.** Figma plugins use ES modules or bundled
   code. No CommonJS.

5. **NEVER assume synchronous communication.** `postMessage` is async.
   Use a request/response pattern with message IDs.

6. **NEVER put API keys in plugin code.** The sandbox code is visible
   to users. Use the UI iframe to make authenticated requests.

7. **NEVER use `figma.currentPage.selection` without null checks.**
   Selection can be empty. Always check `selection.length > 0`.

8. **NEVER call `figma.closePlugin()` without cleaning up.** Cancel
   any pending async operations first.

## ALWAYS Do These

1. **ALWAYS separate code into three directories:**
   ```
   plugin/          ← Sandbox code (code.ts)
   ui/              ← UI iframe (ui.html, ui.tsx, styles)
   shared/          ← Types and constants shared between both
   ```

2. **ALWAYS use typed messages.** Define a discriminated union for
   all messages:
   ```typescript
   // shared/messages.ts
   type PluginMessage =
     | { type: 'CREATE_RECT'; width: number; height: number }
     | { type: 'GET_SELECTION' }
     | { type: 'SELECTION_RESULT'; nodes: SerializedNode[] };
   ```

3. **ALWAYS use `figma.ui.postMessage()` from sandbox → UI** and
   `parent.postMessage({ pluginMessage: data }, '*')` from UI → sandbox.

4. **ALWAYS handle `figma.ui.onmessage` in code.ts** to receive
   messages from the UI.

5. **ALWAYS use esbuild for bundling.** It's fast and handles the
   dual-context build correctly:
   ```json
   // Two separate build targets
   { "entryPoints": ["plugin/code.ts"], "outfile": "dist/code.js" }
   { "entryPoints": ["ui/ui.tsx"], "outfile": "dist/ui.js" }
   ```

6. **ALWAYS set up manifest.json correctly:**
   ```json
   {
     "name": "Plugin Name",
     "id": "unique-id",
     "api": "1.0.0",
     "main": "dist/code.js",
     "ui": "dist/ui.html",
     "editorType": ["figma"]
   }
   ```

7. **ALWAYS use `figma.loadFontAsync()` before modifying text nodes.**
   Text operations fail silently without loaded fonts.

8. **ALWAYS wrap async operations in try/catch.** The sandbox has
   limited error reporting.

## TypeScript Configuration

Two separate tsconfig files — one per context:

```json
// plugin/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "types": ["@figma/plugin-typings"]
    // NO "dom" in lib — sandbox has no DOM
  }
}

// ui/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx"
    // NO @figma/plugin-typings — UI has no figma API
  }
}
```

## Message Passing Pattern

```typescript
// shared/messages.ts
export type ToUI =
  | { type: 'SELECTION_CHANGED'; count: number }
  | { type: 'EXPORT_RESULT'; data: Uint8Array };

export type ToPlugin =
  | { type: 'CREATE_FRAME'; name: string }
  | { type: 'EXPORT_SELECTION'; format: 'PNG' | 'SVG' };

// plugin/code.ts
figma.ui.onmessage = (msg: ToPlugin) => {
  switch (msg.type) {
    case 'CREATE_FRAME':
      const frame = figma.createFrame();
      frame.name = msg.name;
      break;
    case 'EXPORT_SELECTION':
      // ... handle export
      break;
  }
};

// ui/ui.tsx — sending to plugin
function createFrame(name: string) {
  parent.postMessage(
    { pluginMessage: { type: 'CREATE_FRAME', name } satisfies ToPlugin },
    '*'
  );
}
```

## Build Setup (esbuild)

```javascript
// build.mjs
import { build } from 'esbuild';

// Plugin sandbox
await build({
  entryPoints: ['plugin/code.ts'],
  bundle: true,
  outfile: 'dist/code.js',
  target: 'es2020',
  format: 'esm',
});

// UI iframe
await build({
  entryPoints: ['ui/ui.tsx'],
  bundle: true,
  outfile: 'dist/ui.js',
  target: 'es2020',
  format: 'esm',
  jsx: 'automatic',
  loader: { '.css': 'css' },
});
```

## Common Patterns

### Reading Selection
```typescript
// plugin/code.ts
figma.on('selectionchange', () => {
  const sel = figma.currentPage.selection;
  figma.ui.postMessage({
    type: 'SELECTION_CHANGED',
    count: sel.length,
  });
});
```

### Loading and Modifying Text
```typescript
// plugin/code.ts — ALWAYS load fonts first
async function updateText(node: TextNode, newText: string) {
  await figma.loadFontAsync(node.fontName as FontName);
  node.characters = newText;
}
```

### Traversing the Document
```typescript
// plugin/code.ts — recursive node traversal
function walk(node: BaseNode, callback: (n: BaseNode) => void) {
  callback(node);
  if ('children' in node) {
    for (const child of node.children) {
      walk(child, callback);
    }
  }
}
```
