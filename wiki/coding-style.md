# Coding Style

Single source of truth for engineering conventions across this codebase.
Update this file whenever a new convention is established or an existing one is refined.

---

## File Naming

- All source files **must** use `kebab-case` — no `camelCase`, `PascalCase`, or `snake_case` in file names.
- Examples: `contacts-section.tsx`, `use-web-app-state.ts`, `sidebar-nav.tsx`
- React component files follow the same rule: the file is `kebab-case`, the exported symbol is `PascalCase`.

```
✅  apps/web/src/contacts-section.tsx   → exports ContactsSection
✅  apps/web/src/use-web-labels-domain.ts
❌  apps/web/src/ContactsSection.tsx
❌  apps/web/src/useWebLabelsDomaints.ts
```

---

## Styling System

- Web (`apps/web`) uses Tailwind utility classes and shadcn-style primitives.
- Mobile (`apps/mobile`) uses NativeWind class-based styling.
- Runtime inline styles (`style={{...}}`) are not allowed in app UI code.
- Shared class composition helper is `cn()` (`clsx` + `tailwind-merge`).

---

## Logical Properties — RTL by Design

All layout CSS and utility choices should stay RTL-safe by default.

### Property mapping

| Physical (❌ avoid) | Logical (✅ use) |
|---|---|
| `left` / `right` (positioning) | `insetInlineStart` / `insetInlineEnd` |
| `top` / `bottom` (positioning) | `insetBlockStart` / `insetBlockEnd` |
| `margin-left` / `marginLeft` | `marginInlineStart` |
| `margin-right` / `marginRight` | `marginInlineEnd` |
| `margin-top` / `marginTop` | `marginBlockStart` |
| `margin-bottom` / `marginBottom` | `marginBlockEnd` |
| `padding-left` / `paddingLeft` | `paddingInlineStart` |
| `padding-right` / `paddingRight` | `paddingInlineEnd` |
| `padding-top` / `paddingTop` | `paddingBlockStart` |
| `padding-bottom` / `paddingBottom` | `paddingBlockEnd` |
| `border-left` / `borderLeft` | `borderInlineStart` |
| `border-right` / `borderRight` | `borderInlineEnd` |
| `text-align: left` | `textAlign: "start"` |
| `text-align: right` | `textAlign: "end"` |
| `width` (for inline sizing intent) | `inlineSize` |
| `height` (for block sizing intent) | `blockSize` |

### Enforcement

- New code must keep directional behavior RTL-safe (`start/end` semantics over hard left/right assumptions).
- Runtime inline style objects are disallowed in app UI.
- Use shared primitives and utility classes instead of per-file style maps.

---

## Component Conventions

- One component per file.
- Props types are defined inline above the component (`type XxxProps = { ... }`), not exported unless consumed externally.
- Hooks that own domain state live in `use-*-domain.ts` files.
- Pure presentational components live in `*-section.tsx` or `*-route.tsx` files.
