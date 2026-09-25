# ponkotsu

CSS based on Tailwind for people who are bad at CSS.

Turns 3 colors you pick into a full Material Design 3 color palette for Tailwind v4.
The color math is vendored from Google's [material-color-utilities](https://github.com/material-foundation/material-color-utilities)
(see NOTICE / LICENSE-vendor).

Clone it, generate a palette once, copy the result into your app's stylesheet.


## Use in your app

0. Clone the repo

1. Put your 3 colors in `src/seeds.json`:

   ```json
   {
     "primary": "#D7BA7D",
     "secondary": "#5AA9E6",
     "tertiary": "#C77DFF"
   }
   ```

2. `npm install` at least once.

3. Generate the CSS:

   ```bash
   npm run generate --silent > theme.css
   ```

4. Use `theme.css` as a Tailwind 4 config file.

## Class guide

`theme.css` gives you two things: color variables, and a base style built
on top of them. Together they mean plain markup already looks right and
you mostly just pick a color/surface class and lay things out.

See the [AGENTS.md](./AGENTS.md) which is a skill for agents.

### Colors

Every color is `c-<role>`, used like any Tailwind color: `bg-c-primary`,
`text-c-on-primary`, `border-c-outline`.

| Class | Use it for |
|---|---|
| `primary` / `on-primary` | your main buttons, links, the active nav item |
| `secondary` / `on-secondary` | less important actions than primary |
| `tertiary` / `on-tertiary` | an accent, used sparingly (badges, highlights) |
| `error` / `on-error` | destructive stuff (delete) |
| `success` / `on-success` | confirming stuff (save, done) |
| `*-container` / `on-*-container` | a softer fill version of any of the above (e.g. `primary-container`) |
| `surface`, `on-surface`, `on-surface-variant` | page background and its text |
| `outline`, `outline-variant` | borders and dividers |

**The one rule**: only put `on-X` text on an `X` background. `on-primary`
text goes on `primary`, never on `surface` or anything else. Mixing them
is how you end up with unreadable text.

### Base style

Plain HTML elements are already styled just tweak them as needed.

**Boxes**: Use `surface-1`, and bump the number each
time you nest one box inside another:

```html
<div class="surface-1">
  outer box
  <div class="surface-2">
    a box inside that box
  </div>
</div>
```

`surface-3` and `surface-4` exist for deeper nesting. Each step is a
slightly different shade, so nested boxes stay visually distinct without
you thinking about which color to use.

**Buttons**: pick the one that matches what the button does.

| Class | Use it for |
|---|---|
| `btn-primary` | the main action |
| `btn-secondary` | a secondary action |
| `btn-tertiary` | a contrasting accent action |
| `btn-error` | delete / destructive |
| `btn-success` | save / confirm |

That's basically the whole system: pick a `surface-N` for boxes, pick a
`btn-*` for buttons, use `c-*` colors when you need something more
specific, and let everything else (text, forms, tables) style itself.

Then just use Tailwind for layout as normal.

## Try it live

There is a mini app included to preview the colors and feel, includes a copy button to get the generated CSS.

Just run:
```bash
npm install           # one-time, root deps used to build the color generator
npm run app:install   # one-time, the preview app's own deps
npm run app:dev
```
