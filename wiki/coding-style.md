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

## Logical Properties — RTL by Design

All layout CSS **must** use [CSS logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values) instead of physical directional properties. This makes every layout bidirectional (LTR/RTL) at zero extra cost.

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

### React inline style examples

```tsx
// ❌ Physical
<div style={{ marginLeft: "auto", paddingLeft: 16, borderLeft: "3px solid blue" }} />

// ✅ Logical
<div style={{ marginInlineStart: "auto", paddingInlineStart: 16, borderInlineStart: "3px solid blue" }} />
```

### When physical properties are acceptable

- `width` / `height` when the value is literally a fixed size not related to reading direction (e.g., avatar circles, icon sizes).
- `top` / `bottom` for vertical stacking unrelated to reading direction.
- Vendor/third-party component APIs that don't support logical properties yet.

### Enforcement

- New code must use logical properties for all inline/block directional styling.
- Existing code is migrated opportunistically — touch it when you're already editing that file.
- The `ui-styles.ts` token file is the reference implementation; all tokens should use logical properties.

---

## Component Conventions

- One component per file.
- Props types are defined inline above the component (`type XxxProps = { ... }`), not exported unless consumed externally.
- Hooks that own domain state live in `use-*-domain.ts` files.
- Pure presentational components live in `*-section.tsx` or `*-route.tsx` files.
