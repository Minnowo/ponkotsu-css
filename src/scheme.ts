/**
 * Pure role-mapping logic: turns 3 seed colors into the app's `c-*` roles
 * for light and dark, plus a categorical palette for charts/tags. No Node
 * built-ins here so this can be imported from both the CLI (generate.ts)
 * and the browser preview (app/src/App.tsx).
 *
 * error/success aren't seed colors - MD3 treats them as fixed, non-seed
 * colors - but they're built the same way primary/secondary/tertiary are
 * (see ERROR_SEED_HEX/SUCCESS_SEED_HEX below): harmonized toward primary,
 * muted for a light-mode button, full chroma for a dark-mode one. They
 * used to just alias two categorical (chart/tag) colors instead, which was
 * simpler but meant error/success buttons were stuck with the categorical
 * set's chip/badge tone rather than a proper button tone - fine for a
 * badge, too pastel/washed-out next to primary/secondary/tertiary as a
 * button.
 */
import {CorePalette} from '../vendor/palettes/core_palette.js';
import {TonalPalette} from '../vendor/palettes/tonal_palette.js';
import {Hct} from '../vendor/hct/hct.js';
import {Blend} from '../vendor/blend/blend.js';

export interface Seeds {
  primary: string;
  secondary: string;
  tertiary: string;
  // Shifts every role's tone by the same amount, uniformly, within
  // whichever theme (light or dark) is being built - 0 (default) leaves
  // that theme exactly as tuned; positive makes it lighter, negative
  // makes it darker. This is NOT a light<->dark blend (that was tried and
  // reverted - lerping each role independently toward the *other* theme's
  // endpoint made everything converge on gray in the middle, since
  // opposite roles move in opposite directions and meet partway). A
  // uniform shift instead keeps every role's tone *gap* from every other
  // role fixed - contrast never degrades, the whole theme just gets
  // uniformly lighter or darker, like MD3's own light/dark are two fixed
  // points. Optional/defaults to 0 so existing seeds.json files still
  // generate exactly the same output as before. Range roughly -1..1;
  // MAX_SHIFT_TONE below is the actual tone-point range that maps to.
  shift?: number;
  // Chroma factor for primary/secondary/tertiary/error/success at shift 0
  // (see DIM_CHROMA_BASELINE below) - exposed here so it's tunable without
  // editing the constant directly. Optional/defaults to
  // DIM_CHROMA_BASELINE.
  dimBaseline?: number;
}

// The `shift` range (-1..1) is normalized so it means the same thing
// regardless of theme; this is the actual tone-point swing that maps to.
// A role near the tone scale's edge (e.g. on-surface at tone 10/90) hits
// pure black/white - and stops visibly responding to further shift - once
// its tone + this swing clips past 0 or 100. 20 clipped roles like that
// halfway across the slider's range rather than at its extreme; 10 keeps
// them changing across (almost) the whole range instead.
const MAX_SHIFT_TONE = 10;

const clampTone = (tone: number) => Math.max(0, Math.min(100, tone));

export function argbFromHex(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return (255 << 24 | (r & 255) << 16 | (g & 255) << 8 | b & 255) >>> 0;
}

export function hexFromArgb(argb: number): string {
  const r = (argb >> 16) & 255;
  const g = (argb >> 8) & 255;
  const b = argb & 255;
  const toHex = (c: number) => c.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// sRGB <-> OKLab (Bjorn Ottosson's formulas: https://bottosson.github.io/posts/oklab/),
// used by mixOklab below to replicate CSS's `color-mix(in oklab, ...)` at
// generation time instead of at paint time - see base.css's *-hover/-focus
// variables for why.
function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function linearToSrgb(v: number): number {
  const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  return Math.round(Math.max(0, Math.min(1, c)) * 255);
}

interface Oklab {
  l: number;
  a: number;
  b: number;
}

function oklabFromArgb(argb: number): Oklab {
  const r = srgbToLinear((argb >> 16) & 255);
  const g = srgbToLinear((argb >> 8) & 255);
  const b = srgbToLinear(argb & 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return {
    l: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  };
}

function argbFromOklab(color: Oklab): number {
  const l_ = color.l + 0.3963377774 * color.a + 0.2158037573 * color.b;
  const m_ = color.l - 0.1055613458 * color.a - 0.0638541728 * color.b;
  const s_ = color.l - 0.0894841775 * color.a - 1.2914855480 * color.b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  const r = linearToSrgb(+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s);
  const g = linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s);
  const b = linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s);
  return (255 << 24 | (r & 255) << 16 | (g & 255) << 8 | b & 255) >>> 0;
}

/** Matches CSS's `color-mix(in oklab, hexA percent%, hexB)` - percent% of hexA blended into hexB. */
function mixOklab(hexA: string, percent: number, hexB: string): string {
  const a = oklabFromArgb(argbFromHex(hexA));
  const b = oklabFromArgb(argbFromHex(hexB));
  const t = percent / 100;
  return hexFromArgb(argbFromOklab({
    l: b.l + (a.l - b.l) * t,
    a: b.a + (a.a - b.a) * t,
    b: b.b + (a.b - b.b) * t,
  }));
}

/**
 * Matches CSS's `color-mix(in oklab, hex percent%, transparent)` - hex's own
 * color kept as-is, with alpha set to percent% (mixing any opaque color into
 * fully transparent leaves its hue/lightness untouched and just scales
 * alpha). Returned as an 8-digit hex so it composites correctly over
 * whatever background it's placed on, unlike a precomputed opaque blend.
 */
function alphaTint(hex: string, percent: number): string {
  const alpha = Math.round((percent / 100) * 255);
  return `${hex}${alpha.toString(16).padStart(2, '0')}`;
}

// Categorical palette for charts and tag colors - needs to stay mutually
// distinct regardless of the seed colors, so these are fixed reference
// hues, each harmonized toward primary (MD3's Blend.harmonize). Names
// match the app's existing tag/chart color set, minus flamingo, sky,
// sapphire, mauve, rosewater, lavender, peach, and teal - harmonizing
// pulls every hue toward the same primary, and those ended up within a
// few degrees of red, blue, blue, lavender, red, and green respectively
// (or, for peach, still blended into maroon/yellow even after a couple of
// hue-only nudges), reading as duplicates rather than distinct colors.
// the original "red" was dropped outright rather than re-spaced again - it
// sat right next to maroon on every wheel tried so far - and "maroon" was
// renamed to "red" afterward (same hex/hue/chroma, just the name), since
// there was no longer a separate red to conflict with.
// yellow is shifted down from its "natural" hue (~130) toward true yellow
// (~100) rather than the greener/olive hue it landed on before.
const CATEGORICAL_SEEDS: Record<string, string> = {
  'pink': '#b48fb0',
  'red': '#c97e6d',
  'yellow': '#9c9250',
  'green': '#699c7c',
  'blue': '#3f8bcc',
};

// Applied to every harmonized categorical color's chroma after
// Blend.harmonize, before picking a tone in buildScheme. A straight
// harmonize at full chroma reads as too vivid/saturated for colors meant
// to sit quietly (a subtle badge, a chart line) rather than shout - this
// pulls them back toward the reference colors' original, more muted
// character. Same factor and tone for both themes (see categoricalTone
// below) - light pastel or fully re-tuned-per-theme versions read as too
// far from the reference colors or too washed out.
const MUTED_CHROMA_FACTOR = 0.5;

// Fixed reference hues for error/success - same red/green character as the
// categorical set's own 'red'/'green' (so a red error and a red tag don't
// clash), but built as an independent color like primary/secondary/
// tertiary rather than aliased onto the categorical roles - see the file
// header comment.
const ERROR_SEED_HEX = '#c97e6d';
const SUCCESS_SEED_HEX = '#699c7c';

/** Full-chroma tonal palette for a fixed reference hex, harmonized toward primary. */
function harmonizedPalette(hex: string, primaryArgb: number): TonalPalette {
  const harmonized = Hct.fromInt(Blend.harmonize(argbFromHex(hex), primaryArgb));
  return TonalPalette.fromHueAndChroma(harmonized.hue, harmonized.chroma);
}

export type Roles = Record<string, string>;

// Each categorical color gets 3 tones instead of 1 flat one - a pale/light
// variant (<name>) as the default, an even paler variant (l-<name>), and a
// vivid/dark variant (d-<name>) as the special/emphasis one - since a
// single shared tone wasn't enough to keep every color visually distinct
// even after widening hue gaps (see CATEGORICAL_SEEDS above).
// Unlike the single-tone version before it, these DO need separate light/
// dark theme tones now: a pale chip (tone 72-87) reads fine against a
// near-black dark-theme page, but nearly disappears against a light-theme
// page that's a similarly high tone - so light theme needs a much lower
// (darker) chip tone to actually contrast against its own near-white
// background, the same reason primary/secondary/tertiary flip their tone
// between themes. Both themes pair their chips with dark text; white text
// on a mid-tone light theme chip read washed out.
// (this is what made btn-error/btn-success look off in dark mode - their
// bg/text were built from this pair, and on-tone 95 on a tone-65 bg was
// under 3:1 contrast).
const WHEEL_DARK_THEME_TONE = 71;
const WHEEL_DARK_THEME_ON_TONE = 10;
const WHEEL_DARK_THEME_L_TONE = 80;
const WHEEL_DARK_THEME_L_ON_TONE = 10;
const WHEEL_DARK_THEME_D_TONE = 62;
const WHEEL_DARK_THEME_D_ON_TONE = 10;

// Variants also differ in chroma, so they stay distinct at any tone:
// d- is a deeper shade, l- a paler tint.
const WHEEL_D_CHROMA = 1.2;
const WHEEL_L_CHROMA = 0.75;

// In the light theme d- and the default are dark enough to take light text; l- takes dark text.
const WHEEL_LIGHT_THEME_TONE = 42;
const WHEEL_LIGHT_THEME_ON_TONE = 88;
const WHEEL_LIGHT_THEME_L_TONE = 68;
const WHEEL_LIGHT_THEME_L_ON_TONE = 5;
const WHEEL_LIGHT_THEME_D_TONE = 30;
const WHEEL_LIGHT_THEME_D_ON_TONE = 88;

// Mid tones read as muddy on a light page unless they carry more chroma.
const WHEEL_LIGHT_THEME_CHROMA = 1.3;

// MD3's "state layer": hover/focus on a filled button tints the fill with
// a translucent wash of the button's own on-* color (8% hover, 12%
// focus). Generated here (via mixOklab) rather than left as a
// `color-mix()` in base.css so any element - not just the built-in
// btn-* utilities - can reuse the exact same hover/focus color a button
// uses, and so the 8%/12% constants live in one place. [fillRole, onRole]
// pairs to generate <fillRole>-hover/-focus for.
const STATE_LAYER_FILL_PAIRS: Array<[string, string]> = [
  ['primary', 'on-primary'],
  ['secondary', 'on-secondary'],
  ['tertiary', 'on-tertiary'],
  ['error', 'on-error'],
  ['success', 'on-success'],
  // The base (colorless) button and neutral outlined button don't have
  // their own on-* role - they tint with on-surface instead.
  ['surface-container-1', 'on-surface'],
];

// Same idea, for outlined buttons: the tint is the role's own color at
// 8%/12% alpha over transparent (not blended into a fill), generating
// <role>-hover-tint/-focus-tint. alphaTint keeps an actual alpha channel
// rather than baking in one specific background, so it still composites
// correctly however it's placed.
const STATE_LAYER_TINT_ROLES = ['primary', 'secondary', 'tertiary', 'error', 'success', 'on-surface'];
const STATE_LAYER_HOVER_PERCENT = 12;
const STATE_LAYER_FOCUS_PERCENT = 24;

export function corePaletteFromSeeds(seeds: Seeds): CorePalette {
  return CorePalette.contentFromColors({
    primary: argbFromHex(seeds.primary),
    secondary: argbFromHex(seeds.secondary),
    tertiary: argbFromHex(seeds.tertiary),
  });
}

type Axis = 'p' | 's' | 't' | 'n' | 'nv' | 'error' | 'success';

interface RoleSpec {
  axis: Axis;
  lightTone: number;
  darkTone: number;
  // How much of `shift` this role feels - 1 (full) by default. primary/
  // secondary/tertiary/error/success (and their on-* pairs) are set to 0 -
  // they're already tuned to look right regardless of the seed colors' own
  // brightness (that's what pMuted/sMuted/tMuted/eMuted/suMuted are for
  // elsewhere in the file), and don't need to visibly track this knob at
  // all - except see naturalDirectionOnly below. Only the derived roles
  // (on-*-container, *-container, surfaces, outlines) use the plain 1.
  shiftMultiplier?: number;
  // Overrides shiftMultiplier: only follow `shift` when it pushes further
  // in the direction this theme is already going (dark getting darker,
  // light getting lighter), not when it pulls toward the opposite theme's
  // territory (dark getting lighter, light getting darker) - see
  // naturalDirectionMultiplier below. Used for the same "shouldn't move"
  // roles as shiftMultiplier 0, but a shove deep enough in the theme's own
  // direction should still carry them along rather than leave them static
  // forever.
  naturalDirectionOnly?: boolean;
  // For primary/secondary/tertiary/error/success only - their chroma is
  // Seeds.dimBaseline flat, in both themes, completely independent of
  // `shift` (which only moves their tone, via naturalDirectionOnly above).
  dimmable?: boolean;
}

// isDark + shiftTone < 0 = dark going darker; !isDark + shiftTone > 0 =
// light going lighter. Either of those is "this theme's own direction" -
// full multiplier. The opposite direction (pulling toward the other
// theme) - 0, same as shiftMultiplier 0 would give.
function naturalDirectionMultiplier(isDark: boolean, shiftTone: number): number {
  return (isDark ? shiftTone < 0 : shiftTone > 0) ? 1 : 0;
}

// primary/secondary/tertiary/error/success's chroma, flat in both themes,
// fully independent of Seeds.shift - overridden by Seeds.dimBaseline.
const DIM_CHROMA_BASELINE = 0.65;

// One row per role that varies between light and dark - buildScheme picks
// lightTone/lightChroma or darkTone/darkChroma depending on isDark, then
// applies the uniform `shift` (see Seeds.shift above) on top. Categorical
// colors aren't here - they don't vary between themes at all (see
// WHEEL_TONE above), though they do still get shifted.
const ROLE_SPECS: Record<string, RoleSpec> = {
  'primary': {axis: 'p', lightTone: 40, darkTone: 80, naturalDirectionOnly: true, dimmable: true},
  'on-primary': {axis: 'p', lightTone: 96, darkTone: 20, naturalDirectionOnly: true},
  'primary-container': {axis: 'p', lightTone: 90, darkTone: 30, dimmable: true},
  'on-primary-container': {axis: 'p', lightTone: 10, darkTone: 90},
  'secondary': {axis: 's', lightTone: 40, darkTone: 80, naturalDirectionOnly: true, dimmable: true},
  'on-secondary': {axis: 's', lightTone: 96, darkTone: 20, naturalDirectionOnly: true},
  'secondary-container': {axis: 's', lightTone: 90, darkTone: 30, dimmable: true},
  'on-secondary-container': {axis: 's', lightTone: 10, darkTone: 90},
  'tertiary': {axis: 't', lightTone: 40, darkTone: 80, naturalDirectionOnly: true, dimmable: true},
  'on-tertiary': {axis: 't', lightTone: 96, darkTone: 20, naturalDirectionOnly: true},
  'tertiary-container': {axis: 't', lightTone: 90, darkTone: 30, dimmable: true},
  'on-tertiary-container': {axis: 't', lightTone: 10, darkTone: 90},
  // error/success: same shape as primary/secondary/tertiary above - see
  // the file header comment for why they're not just seeds like those 3.
  // Same naturalDirectionOnly treatment too - they're buttons, not derived
  // roles, so they shouldn't move except per naturalDirectionMultiplier.
  'error': {axis: 'error', lightTone: 40, darkTone: 80, naturalDirectionOnly: true, dimmable: true},
  'on-error': {axis: 'error', lightTone: 96, darkTone: 20, naturalDirectionOnly: true},
  'error-container': {axis: 'error', lightTone: 90, darkTone: 30, dimmable: true},
  'on-error-container': {axis: 'error', lightTone: 10, darkTone: 90},
  'success': {axis: 'success', lightTone: 40, darkTone: 80, naturalDirectionOnly: true, dimmable: true},
  'on-success': {axis: 'success', lightTone: 96, darkTone: 20, naturalDirectionOnly: true},
  'success-container': {axis: 'success', lightTone: 90, darkTone: 30, dimmable: true},
  'on-success-container': {axis: 'success', lightTone: 10, darkTone: 90},
  'surface': {axis: 'n', lightTone: 98, darkTone: 6},
  // Text stays at MD3's tones; shift would push dark-mode text to pure white.
  'on-surface': {axis: 'n', lightTone: 10, darkTone: 90, shiftMultiplier: 0},
  'on-surface-variant': {axis: 'nv', lightTone: 30, darkTone: 80, shiftMultiplier: 0},
  // Numbered 1..6 to match the surface-N utility classes directly (surface-N
  // backs onto surface-container-N) - MD3's own named scale (lowest/low/
  // [plain]/high/highest) stopped at 4 steps and had no name left to give
  // steps 5/6, so this repo dropped the names entirely rather than mix
  // named and numbered. No surface-container-0: MD3's "lowest" tone wasn't
  // used by anything (nothing nests below surface-1), so it's not generated.
  // Dark steps are 5 tones apart: smaller steps vanish on phone screens.
  'surface-container-1': {axis: 'n', lightTone: 96, darkTone: 11},
  'surface-container-2': {axis: 'n', lightTone: 94, darkTone: 16},
  'surface-container-3': {axis: 'n', lightTone: 92, darkTone: 21},
  'surface-container-4': {axis: 'n', lightTone: 90, darkTone: 26},
  'surface-container-5': {axis: 'n', lightTone: 88, darkTone: 31},
  'surface-container-6': {axis: 'n', lightTone: 86, darkTone: 36},
  'surface-dim': {axis: 'n', lightTone: 87, darkTone: 6},
  'surface-bright': {axis: 'n', lightTone: 98, darkTone: 24},
  'outline': {axis: 'nv', lightTone: 50, darkTone: 60},
  'outline-variant': {axis: 'nv', lightTone: 80, darkTone: 30},
  'inverse-surface': {axis: 'n', lightTone: 20, darkTone: 90},
  'inverse-on-surface': {axis: 'n', lightTone: 95, darkTone: 20},
  'inverse-primary': {axis: 'p', lightTone: 80, darkTone: 40},
};

export function buildScheme(
    core: CorePalette,
    seeds: Seeds,
    isDark: boolean,
): Roles {
  const primaryArgb = argbFromHex(seeds.primary);
  const errorPalette = harmonizedPalette(ERROR_SEED_HEX, primaryArgb);
  const successPalette = harmonizedPalette(SUCCESS_SEED_HEX, primaryArgb);
  const axisPalette: Record<Axis, TonalPalette> = {
    p: core.a1, s: core.a2, t: core.a3, n: core.n1, nv: core.n2,
    error: errorPalette, success: successPalette,
  };
  const shiftTone = (seeds.shift ?? 0) * MAX_SHIFT_TONE;
  const dimBaseline = seeds.dimBaseline ?? DIM_CHROMA_BASELINE;

  const roles: Roles = {};
  for (const [name, spec] of Object.entries(ROLE_SPECS)) {
    const base = axisPalette[spec.axis];
    const tone = isDark ? spec.darkTone : spec.lightTone;
    const multiplier = spec.naturalDirectionOnly
        ? naturalDirectionMultiplier(isDark, shiftTone)
        : (spec.shiftMultiplier ?? 1);
    const chromaFactor = spec.dimmable ? dimBaseline : 1;
    const palette = chromaFactor === 1 ? base : TonalPalette.fromHueAndChroma(base.hue, base.chroma * chromaFactor);
    roles[name] = hexFromArgb(palette.tone(clampTone(tone + shiftTone * multiplier)));
  }

  // Categorical colors are flat accents (chart series, tag swatches), but
  // still get an on-* pair for when text/an icon sits on top of one (a
  // filled tag chip, a legend swatch with a label inside it) - off the
  // same hue/chroma so it stays a matched pair rather than a generic
  // black/white. Each name gets 2 variants (see WHEEL_TONE above). Same
  // tones in both themes; same naturalDirectionOnly treatment as
  // primary/secondary/tertiary/error/success above.
  const wheelShiftTone = shiftTone * naturalDirectionMultiplier(isDark, shiftTone);
  // Scaled by dimBaseline, same as primary/secondary/tertiary/error/success
  // above - so a maxed-out dimBaseline reads as the same saturation as an
  // unshifted primary, rather than each seed's own (unrelated) chroma.
  // Chroma is borrowed from the primary axis palette (only hue comes from
  // the seed) for the same reason: each categorical seed hex has its own
  // arbitrary chroma, so scaling that by dimBaseline made the wheel drift
  // out of saturation-sync with primary/secondary/tertiary as dimBaseline
  // moved - tying it to primary's own chroma keeps them matched at every
  // dimBaseline value, not just the one they happened to be tuned at.
  const categoricalChromaFactor = dimBaseline * 1.5 * (isDark ? 1 : WHEEL_LIGHT_THEME_CHROMA);
  const primaryChroma = axisPalette.p.chroma;
  const wheelTone = isDark ? WHEEL_DARK_THEME_TONE : WHEEL_LIGHT_THEME_TONE;
  const wheelOnTone = isDark ? WHEEL_DARK_THEME_ON_TONE : WHEEL_LIGHT_THEME_ON_TONE;
  const wheelLTone = isDark ? WHEEL_DARK_THEME_L_TONE : WHEEL_LIGHT_THEME_L_TONE;
  const wheelLOnTone = isDark ? WHEEL_DARK_THEME_L_ON_TONE : WHEEL_LIGHT_THEME_L_ON_TONE;
  const wheelDTone = isDark ? WHEEL_DARK_THEME_D_TONE : WHEEL_LIGHT_THEME_D_TONE;
  const wheelDOnTone = isDark ? WHEEL_DARK_THEME_D_ON_TONE : WHEEL_LIGHT_THEME_D_ON_TONE;
  for (const [name, hex] of Object.entries(CATEGORICAL_SEEDS)) {
    const harmonized = Hct.fromInt(Blend.harmonize(argbFromHex(hex), primaryArgb));
    const palette = TonalPalette.fromHueAndChroma(harmonized.hue, primaryChroma * categoricalChromaFactor);
    roles[name] = hexFromArgb(palette.tone(clampTone(wheelTone + wheelShiftTone)));
    roles[`on-${name}`] = hexFromArgb(palette.tone(clampTone(wheelOnTone + wheelShiftTone)));

    // literally just randomly shifted this, seems good enough
    const paletteD = TonalPalette.fromHueAndChroma(((360+harmonized.hue-16)%360), primaryChroma * categoricalChromaFactor * WHEEL_D_CHROMA);
    roles[`d-${name}`] = hexFromArgb(paletteD.tone(clampTone(wheelDTone + wheelShiftTone)));
    roles[`on-d-${name}`] = hexFromArgb(paletteD.tone(clampTone(wheelDOnTone + wheelShiftTone)));

    const paletteL = TonalPalette.fromHueAndChroma(((360+harmonized.hue)%360), primaryChroma * categoricalChromaFactor * WHEEL_L_CHROMA);
    roles[`l-${name}`] = hexFromArgb(paletteL.tone(clampTone(wheelLTone + wheelShiftTone)));
    roles[`on-l-${name}`] = hexFromArgb(paletteL.tone(clampTone(wheelLOnTone + wheelShiftTone)));
  }

  // Precomputed hover/focus state-layer colors - see STATE_LAYER_FILL_PAIRS
  // above for why these are generated here instead of left as a
  // `color-mix()` in base.css.
  for (const [fillRole, onRole] of STATE_LAYER_FILL_PAIRS) {
    roles[`${fillRole}-hover`] = mixOklab(roles[onRole], STATE_LAYER_HOVER_PERCENT, roles[fillRole]);
    roles[`${fillRole}-focus`] = mixOklab(roles[onRole], STATE_LAYER_FOCUS_PERCENT, roles[fillRole]);
  }
  for (const role of STATE_LAYER_TINT_ROLES) {
    roles[`${role}-hover-tint`] = alphaTint(roles[role], STATE_LAYER_HOVER_PERCENT);
    roles[`${role}-focus-tint`] = alphaTint(roles[role], STATE_LAYER_FOCUS_PERCENT);
  }

  return roles;
}
