# Working on ponkotsu-css

This file is for changing ponkotsu itself. For how to write UI with it, see
[SKILL.md](./SKILL.md).

ponkotsu turns 3 seed colors into an MD3 style tonal palette (CSS custom
properties for Tailwind v4) and ships an opinionated base style on top.

## Layout

| Path | What |
|---|---|
| `src/seeds.json` | Per theme (`dark`, `light`): seed colors, `shift` (-1..1 brightness knob) and `dimBaseline` (chroma of the main roles) |
| `src/scheme.ts` | The role table: which palette and tone each `c-*` role comes from, plus the state and categorical colors |
| `src/generate.ts` | CLI: prints the color blocks followed by `app/src/base.css` |
| `vendor/` | Vendored material-color-utilities (HCT, tonal palettes). Do not edit |
| `app/src/base.css` | The base style: element defaults, `input-like`, `std-focus`, `surface-*`, `btn-*` |
| `app/` | Preact + Vite preview: a fake app and a reference page, with live seed controls |
| `output/theme.css` | Last generated output |
| `SKILL.md` | Usage guide for agents writing UI with ponkotsu |

## Commands

```bash
npm run generate --silent > output/theme.css   # regenerate
npm run app:dev                                # preview app (builds the generator first)
npm run app:build                              # production build of the preview
```

Consumers vendor `output/theme.css` (karopon keeps it as
`src/ui/src/ponkotsu.css`, prettier formatted) and `SKILL.md`. Neither is
edited in the consumer; change it here and copy it over.

## Changing the base style

- `base.css` is the design. When a rule changes, update the preview app
  (`FakeApp.tsx`, `ReferencePage.tsx`) to show it, and update `SKILL.md` if
  it changes how markup should be written.
- Element rules live in `@layer base` so any utility in markup still wins.
  Inside the base layer, a later rule overrides an earlier one only if its
  selector is at least as specific. `input-like` uses
  `not-disabled:not-aria-disabled:` variants, so an override for `button`
  must use the same chain.
- `app/src/styles.css` holds fallback values for every role so Tailwind
  generates the `bg-c-*` classes the preview uses. Add new roles there too.

## Changing colors

- Roles follow MD3 tones: plain role 40 (light) / 80 (dark), container
  90 / 30, `on-*` 96 / 20, `on-*-container` 10 / 90.
- `shift` moves every role by up to 10 tones unless its spec sets
  `shiftMultiplier` or `naturalDirectionOnly`. `on-surface` and
  `on-surface-variant` ignore it so dark-mode text never clips to pure white.
- Add a role only when no existing one fits. Derive it from a palette in
  `scheme.ts`; never hand-pick a hex value. Fixed-hue roles (like `error`,
  `success`) get their own hue and are harmonized toward primary.
