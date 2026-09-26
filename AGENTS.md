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
| Error / Success | `error`, `on-error`, `success`, `on-success` |
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
- **Error / Success**: destructive (delete) and confirming (save/done)
  actions and states. Built the same way as primary/secondary/tertiary
  (fixed reference hue, harmonized toward primary, muted for a light-mode
  button vs. full chroma for a dark-mode one) rather than being generated
  from a seed color - MD3 treats error as a fixed, non-seed color, and
  there's no MD3 "success" at all.
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
| `error` | `on-error` |
| `success` | `on-success` |
| `surface` / any `surface-container-*` | `on-surface` (or `on-surface-variant` for lower emphasis) |
| `inverse-surface` | `inverse-on-surface` (or `inverse-primary` for a link/action on it) |

If you catch yourself mixing pairs (e.g. `text-c-on-primary` on a
`bg-c-surface` element), you want a different role, not an override.

## Categorical colors

For chart series and user-assignable tag colors, where you need several
mutually distinct colors rather than one semantic role: `pink`, `red`,
`yellow`, `green`, `blue` (same `--color-c-*` / `c-*` convention as
everything else). Each one comes as a pair of variants - `<name>` (vivid/
dark) and `<name>-pale` (pale/light) - each with its own `on-<name>` /
`on-<name>-pale` text pair. Same pairing rule as `primary`/`on-primary`.

don't assume `red` means "error" just because it's red.
There is `error` and `on-error` for that.

## Base layer

ponkotsu is the opinionated layer on top of Tailwind v4's and includes a base style.
Preflight: plain `<h1>`/`<button>`/`<input>`/`<table>` markup gets a
themed look for free, so you only reach for a class to set layout or pick
a color/surface variant. Try and avoid adjusting font size, margins and the like on buttons and stuff.

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

**Two emphasis levels**, not MD3's full filled/outlined/text spread - color
carries the meaning within each:

- **Filled** (`btn-primary`, `btn-secondary`, `btn-tertiary`, `btn-error`,
  `btn-success`) - the higher-emphasis default. Main actions.
- **Outlined** (`btn-outlined`, `btn-outlined-primary`,
  `btn-outlined-secondary`, `btn-outlined-tertiary`, `btn-outlined-error`,
  `btn-outlined-success`) - colored border + colored text, no fill.
  Medium emphasis - secondary actions alongside a filled primary button.
  `btn-outlined` alone (no color suffix) is the neutral default (border-
  `outline`, text `on-surface`) - MD3's own base "Outlined Button" isn't
  tied to a color either; the color suffixes are this system's extension,
  same pattern as the filled variants.

**Shape is 2 sizes**: `rounded-sm` (4px - inputs, small controls) and
`rounded-md` (8px - `surface-*` containers).

Everything else (headings, links, `hr`, `code`/`pre`, `table`, `fieldset`,
`label`, form elements, checkboxes/radios/ranges, focus rings) gets a
themed default directly in `@layer base` - see the file, it's short.

## Layout practices

**Spacing**: use Tailwind's default spacing scale (multiples of 4px: `1`,
`2`, `3`, `4`, `6`, `8`, `12`...) for padding, gaps, and margins. Don't
invent one-off pixel values - consistent spacing rhythm matters more than
any single value being "correct".

