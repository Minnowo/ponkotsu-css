---
name: ponkotsu-css
description: This repo's simplified color + layout system, inspired by Material Design 3 but not a full MD3 implementation. Use when adding a UI color, picking a token for a component, changing theme colors, or laying out a screen.
---

# ponkotsu design system

A simplified, opinionated take on two parts of Material Design 3: its
color system (seed colors -> tonal palettes -> roles with guaranteed
contrast) and some of its layout thinking (spacing rhythm, elevation via
tone, canonical page shapes). This is plain CSS custom properties plus 
a Tailwind v4 base layer.

## Color system

Every token is `--color-c-<role>`, exposed to Tailwind as `bg-c-<role>`,
`text-c-<role>`, `border-c-<role>`, etc.

| Group | Roles |
|---|---|
| Primary | `primary`, `on-primary`, `primary-container`, `on-primary-container` |
| Secondary | `secondary`, `on-secondary`, `secondary-container`, `on-secondary-container` |
| Tertiary | `tertiary`, `on-tertiary`, `tertiary-container`, `on-tertiary-container` |
| Error | `error`, `on-error`, `error-container`, `on-error-container` |
| Success (not part of MD3's spec) | `success`, `on-success`, `success-container`, `on-success-container` |
| Surface | `surface`, `on-surface`, `on-surface-variant`, `surface-container-lowest`, `surface-container-low`, `surface-container`, `surface-container-high`, `surface-container-highest`, `surface-dim`, `surface-bright` |
| Outline | `outline`, `outline-variant` |
| Inverse | `inverse-surface`, `inverse-on-surface`, `inverse-primary` |

What each group is for:

- **Primary**: the most prominent interactive elements - main buttons, the
  active nav item, links.
- **Secondary**: less prominent than primary - secondary buttons, chips,
  selected-but-not-primary states.
- **Tertiary**: a contrasting accent used sparingly to balance primary and
  secondary - badges, highlights, an input field's accent.
- **Error**: destructive actions and error states.
- **Success**: confirmations and positive actions (save/done). Not part of
  MD3's spec; added because most apps need it.
- **Surface**: backgrounds. Plain `surface` for the page background;
  `surface-container-*` (or the `surface-1..4` base-layer classes) for
  anything stacked visually above the page, to create depth without a new
  color.
- **Outline**: `outline` for boundaries needing real contrast (input
  borders, dividers that must stand out). `outline-variant` for decorative,
  low-emphasis boundaries.
- **Inverse**: elements that intentionally invert against the current
  theme (a toast that must read clearly on any background).

**Pairing rule, never break this**: a container color is a fill; only its
`on-*` counterpart is guaranteed readable on top of it.

| Fill | Text/icon on it |
|---|---|
| `primary` / `-container` | `on-primary` / `on-primary-container` |
| `secondary` / `-container` | `on-secondary` / `on-secondary-container` |
| `tertiary` / `-container` | `on-tertiary` / `on-tertiary-container` |
| `error` / `-container` | `on-error` / `on-error-container` |
| `success` / `-container` | `on-success` / `on-success-container` |
| `surface` / any `surface-container-*` | `on-surface` (or `on-surface-variant` for lower emphasis) |
| `inverse-surface` | `inverse-on-surface` (or `inverse-primary` for a link/action on it) |

If you catch yourself mixing pairs (e.g. `text-c-on-primary` on a
`bg-c-surface` element), you want a different role, not an override.

## Base layer

ponkotsu is the opinionated layer on top of Tailwind v4's and includes a base style.
Preflight: plain `<h1>`/`<button>`/`<input>`/`<table>` markup gets a
themed look for free, so you only reach for a class to set layout or pick
a color/surface variant.

**Elevation is a numbered ladder, not one flat "container" style** -
nesting depth comes from stepping up the tone, not repeating a box:

| Class | Backing tone |
|---|---|
| `surface-1` | `surface-container-low` (first box on the page) |
| `surface-2` | `surface-container` (nested inside a `surface-1`) |
| `surface-3` | `surface-container-high` (nested inside that) |
| `surface-4` | `surface-container-highest` (deepest) |
| `surface-outlined` | `surface` + `outline-variant` border, no tone step (rare - a box flush with the page that still needs a boundary) |

Each level also gets a thin `outline-variant` border - the tone step alone
can be too subtle, especially in the light theme. Reach for the next
number, not a new role, when nesting one box inside another. Avoid
box-shadow for elevation; the tone step is the depth cue here.

**Buttons are filled-only**, color carries the meaning (not MD3's full
filled/outlined/text emphasis spread - one visual style keeps this
simple): `btn-primary` (main action), `btn-secondary` (less prominent),
`btn-tertiary` (contrasting accent), `btn-error` (destructive),
`btn-success` (confirming).

**Shape is 2 sizes**: `rounded-sm` (4px - inputs, small controls) and
`rounded-md` (8px - `surface-*` containers). Buttons use Tailwind's plain
`rounded` (4px) - less rounded than MD3's pill default, by preference.

Everything else (headings, links, `hr`, `code`/`pre`, `table`, `fieldset`,
`label`, form elements, checkboxes/radios/ranges, focus rings) gets a
themed default directly in `@layer base` - see the file, it's short.

## Layout practices

**Spacing**: use Tailwind's default spacing scale (multiples of 4px: `1`,
`2`, `3`, `4`, `6`, `8`, `12`...) for padding, gaps, and margins. Don't
invent one-off pixel values - consistent spacing rhythm matters more than
any single value being "correct".

**Breakpoints**: 3 tiers are usually enough for an app this size -
compact (< 600px, single column), medium (600-839px, 2 columns or a
narrow side panel), expanded (840px+, multi-pane). Tailwind's `sm`/`md`/
`lg` work fine; align a custom `md3` breakpoint at 840px only if a layout
specifically needs that exact cutover.

**Common page shapes** - start from one of these instead of a raw grid:

- *Feed* (browsable collection: list of logs, food items): single column
  compact, 2-3 column grid at medium/expanded.
- *List-detail* (browse + inspect one thing): stacked on compact (list OR
  detail, not both), list + detail side by side from medium up.
- *Supporting pane* (primary content + secondary info): stacked on
  compact, ~2:1 primary:secondary split from medium up.

**Readability**: constrain body content to a max width (roughly 640-1040px)
and center it on wide screens - don't stretch a single column of text or
a form across an ultra-wide viewport.

**Hover states**: gate them behind `@media (hover: hover)` so touch
devices don't get stuck-hover artifacts; a subtle tone shift (e.g.
`hover:bg-c-surface-container-high` on a `surface-1` row) reads better
here than a shadow.
