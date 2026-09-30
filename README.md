# ponkotsu

CSS based on Tailwind for people who are bad at CSS.

Turns 3 colors you pick into a full Material Design 3 color palette for Tailwind v4.
The color math is vendored from Google's [material-color-utilities](https://github.com/material-foundation/material-color-utilities)
(see NOTICE / LICENSE-vendor).

Clone it, generate a palette once, copy the result into your app's stylesheet.


## Use in your app

0. Clone the repo

1. Put your 3 colors in `src/seeds.json`, once for each theme:

   ```json
   {
     "dark": {
       "primary": "#D7BA7D",
       "secondary": "#5AA9E6",
       "tertiary": "#C77DFF",
       "shift": 0
     },
     "light": {
       "primary": "#D7BA7D",
       "secondary": "#5AA9E6",
       "tertiary": "#C77DFF",
       "shift": 0
     }
   }
   ```

   You can make a theme darker or lighter with its `shift` value,
   which is a number from -1 to 1 that dims or brightens that
   theme without hurting contrast.

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

See [SKILL.md](./SKILL.md) for how to write markup with it (it doubles as a skill for agents).
[AGENTS.md](./AGENTS.md) covers working on ponkotsu itself.

### Base style

All the inputs are styled by default,
and base style adds some extra classes for ease of use.

#### Boxes 

The `surface-<n>` class (n is 1-6 inclusive) is meant for nested containers.
The higher `n` the more the surface color changes for contrast.

Just bump the number each time you nest one box inside another:
```html
<div class="surface-1">
  outer box
  <div class="surface-2">
    a box inside that box
    <div class="surface-3">
      <div class="surface-4">
        <div class="surface-5">
          <div class="surface-6">
            there is no box deeper
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

Surfaces have no border. If a box needs a drawn edge, add `surface-border`:
```html
<div class="surface-border">
   Some content in a box
</div>
```

#### Buttons

Just using `<button>` without any class will be themed already.

For solid colored buttons use classes:
```html
<button class="btn-primary"> Primary </button>
<button class="btn-secondary"> Secondary </button>
<button class="btn-tertiary"> Tertiary </button>
<button class="btn-success"> Done </button>
<button class="btn-error"> Delete </button>
```

For wire-frame buttons use classes:
```html
<button class="btn-outlined"> Regular </button>
<button class="btn-outlined-primary"> Primary </button>
<button class="btn-outlined-secondary"> Secondary </button>
<button class="btn-outlined-tertiary"> Tertiary </button>
<button class="btn-outlined-success"> Done </button>
<button class="btn-outlined-error"> Delete </button>
```

The button utilities already handle hover, focus, active, and disabled
states.

### Colors

All colors use Tailwind's theme variable format, with a `c-` prefix.
This makes auto complete easier for colors.

For example:
```html
<button class="bg-c-primary text-c-on-primary">Save</button>
```

All the defined colors are in the table below, (remember you need to include `c-` when using them from Tailwind utilities)

**The one rule**: if the background color is `X`, the text color should be `on-X`, this guarantees the text is readable on the surface.

| Foreground | Background | Description |
|---|---|---|
| `on-primary` | `primary` | Main brand/action color |
| - | `primary-hover` | Hover color of `primary` |
| - | `primary-focus` | Focus color of `primary` |
| - | `primary-hover-tint` | Translucent version of `primary`, for hover over a transparent/non-solid background |
| - | `primary-focus-tint` | Translucent version of `primary`, for focus over a transparent/non-solid background |
| `on-primary-container` | `primary-container` | Container using primary color |
| `on-secondary` | `secondary` | Secondary emphasis/action color |
| - | `secondary-hover` | Hover color of `secondary` |
| - | `secondary-focus` | Focus color of `secondary` |
| - | `secondary-hover-tint` | Translucent version of `secondary`, for hover over a transparent/non-solid background |
| - | `secondary-focus-tint` | Translucent version of `secondary`, for focus over a transparent/non-solid background |
| `on-secondary-container` | `secondary-container` | Container using secondary color |
| `on-tertiary` | `tertiary` | Additional accent color |
| - | `tertiary-hover` | Hover color of `tertiary` |
| - | `tertiary-focus` | Focus color of `tertiary` |
| - | `tertiary-hover-tint` | Translucent version of `tertiary`, for hover over a transparent/non-solid background |
| - | `tertiary-focus-tint` | Translucent version of `tertiary`, for focus over a transparent/non-solid background |
| `on-tertiary-container` | `tertiary-container` | Container using tertiary color |
| `on-error` | `error` | Error or destructive state |
| - | `error-hover` | Hover color of `error` |
| - | `error-focus` | Focus color of `error` |
| - | `error-hover-tint` | Translucent version of `error`, for hover over a transparent/non-solid background |
| - | `error-focus-tint` | Translucent version of `error`, for focus over a transparent/non-solid background |
| `on-error-container` | `error-container` | Container using error color |
| `on-success` | `success` | Success or confirmation state |
| - | `success-hover` | Hover color of `success` |
| - | `success-focus` | Focus color of `success` |
| - | `success-hover-tint` | Translucent version of `success`, for hover over a transparent/non-solid background |
| - | `success-focus-tint` | Translucent version of `success`, for focus over a transparent/non-solid background |
| `on-success-container` | `success-container` | Container using success color |
| `on-surface` | `surface` | Page background and primary content |
| `on-surface-variant` | `surface` | Lower-emphasis text on the page background (e.g. a caption or hint) |
| - | `on-surface-hover-tint` | Translucent version of `on-surface`, for hover over a transparent/non-solid background - what the neutral `btn-outlined` uses |
| - | `on-surface-focus-tint` | Translucent version of `on-surface`, for focus over a transparent/non-solid background - what the neutral `btn-outlined` uses |
| `on-surface` | `surface-container-1` | Backs `surface-1` |
| - | `surface-container-1-hover` | Hover color of `surface-container-1`, used by the neutral (colorless) `<button>` |
| - | `surface-container-1-focus` | Focus color of `surface-container-1`, used by the neutral (colorless) `<button>` |
| `on-surface` | `surface-container-2` | Backs `surface-2` |
| `on-surface` | `surface-container-3` | Backs `surface-3` |
| `on-surface` | `surface-container-4` | Backs `surface-4` |
| `on-surface` | `surface-container-5` | Backs `surface-5` |
| `on-surface` | `surface-container-6` | Backs `surface-6` |
| `on-surface` | `surface-dim` | Dimmed surface |
| `on-surface` | `surface-bright` | Bright surface |
| `inverse-on-surface` | `inverse-surface` | Inverted surface for things like toasts and tooltips |
| `inverse-primary` | - | Accent for a link/action on top of `inverse-surface` |
| `on-pink` | `pink` | Pink color (pale, default) |
| `on-l-pink` | `l-pink` | Lighter pink color |
| `on-d-pink` | `d-pink` | Darker/more vivid pink color |
| `on-red` | `red` | Red color (pale, default) |
| `on-l-red` | `l-red` | Lighter red color |
| `on-d-red` | `d-red` | Darker/more vivid red color |
| `on-yellow` | `yellow` | Yellow color (pale, default) |
| `on-l-yellow` | `l-yellow` | Lighter yellow color |
| `on-d-yellow` | `d-yellow` | Darker/more vivid yellow color |
| `on-green` | `green` | Green color (pale, default) |
| `on-l-green` | `l-green` | Lighter green color |
| `on-d-green` | `d-green` | Darker/more vivid green color |
| `on-blue` | `blue` | Blue color (pale, default) |
| `on-l-blue` | `l-blue` | Lighter blue color |
| `on-d-blue` | `d-blue` | Darker/more vivid blue color |
| - | `outline` | Borders and dividers |
| - | `outline-variant` | Subtle borders and dividers |


## Try it live

There is a mini app included to preview the colors and feel, includes a copy button to get the generated CSS.

Just run:
```bash
npm install           # one-time, root deps used to build the color generator
npm run app:install   # one-time, the preview app's own deps
npm run app:dev
```
