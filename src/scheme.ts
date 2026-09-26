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

// Each categorical color gets 2 tones instead of 1 flat one - a vivid/dark
// variant (<name>) and a pale/light variant (<name>-pale) - since a single
// shared tone wasn't enough to keep every color visually distinct even
// after widening hue gaps (see CATEGORICAL_SEEDS above). Same tones for
// both themes, like the single-tone version before it: a light, muted
// chip with dark text (or vice versa) reads fine on both a near-black page
// and a near-white one, so there's no need to re-tune per theme.
// Both variants sit on the lighter half of the tone scale (62/80, not
// actually "dark") - both get dark on-text (20), not light, since a light
// on-tone against either background reads as washed-out/low-contrast
// (this is what made btn-error/btn-success look off in dark mode - their
// bg/text were built from this pair, and on-tone 95 on a tone-65 bg was
// under 3:1 contrast).
const WHEEL_TONE = 62;
const WHEEL_ON_TONE = 20;
const WHEEL_PALE_TONE = 80;
const WHEEL_PALE_ON_TONE = 20;

export function corePaletteFromSeeds(seeds: Seeds): CorePalette {
  return CorePalette.contentFromColors({
    primary: argbFromHex(seeds.primary),
    secondary: argbFromHex(seeds.secondary),
    tertiary: argbFromHex(seeds.tertiary),
  });
}

// HCT's max achievable chroma varies a lot by tone - it's naturally low
// near the white/black edges (tone 90+/10-), which is why light's
// *-container (tone 90) and dark's on-*-container (tone 90) already read
// as muted without any help. But tone 40 (light's primary/secondary/
// tertiary) and tone 30 (dark's *-container) sit in a high-chroma part of
// the ramp, so a vivid seed color comes through there at close to full
// intensity - "neon". Only those two spots get a separate, chroma-reduced
// palette; tone 80 (dark's primary/secondary/tertiary) is left alone since
// it already reads fine at full chroma.
const MUTED_BUTTON_CHROMA_FACTOR = 0.6;

type Axis = 'p' | 's' | 't' | 'n' | 'nv' | 'error' | 'success';

interface RoleSpec {
  axis: Axis;
  lightTone: number;
  darkTone: number;
  // Chroma-mute factor at each end (see MUTED_BUTTON_CHROMA_FACTOR above) -
  // 1 (full chroma, the default) unless a role is specifically the "neon"
  // spot for its axis.
  lightChroma?: number;
  darkChroma?: number;
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
}

// isDark + shiftTone < 0 = dark going darker; !isDark + shiftTone > 0 =
// light going lighter. Either of those is "this theme's own direction" -
// full multiplier. The opposite direction (pulling toward the other
// theme) - 0, same as shiftMultiplier 0 would give.
function naturalDirectionMultiplier(isDark: boolean, shiftTone: number): number {
  return (isDark ? shiftTone < 0 : shiftTone > 0) ? 1 : 0;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Dark-mode-only: primary/secondary/tertiary/error/success stay full
// chroma in dark mode normally (see MUTED_BUTTON_CHROMA_FACTOR above -
// dark's tone 80 already reads fine at full chroma against a dark
// surface). But as dark mode dims further (shift going negative - see
// naturalDirectionOnly), the surface gets darker while these roles'
// chroma doesn't, so they start reading as neon against the now much
// darker page. Light mode doesn't have this problem - its equivalent
// roles are already muted (lightChroma) regardless of shift - so this
// only kicks in for isDark.
const DARK_DIM_MIN_CHROMA_FACTOR = MUTED_BUTTON_CHROMA_FACTOR;

// One row per role that varies between light and dark - buildScheme picks
// lightTone/lightChroma or darkTone/darkChroma depending on isDark, then
// applies the uniform `shift` (see Seeds.shift above) on top. Categorical
// colors aren't here - they don't vary between themes at all (see
// WHEEL_TONE above), though they do still get shifted.
const ROLE_SPECS: Record<string, RoleSpec> = {
  'primary': {axis: 'p', lightTone: 40, darkTone: 80, lightChroma: MUTED_BUTTON_CHROMA_FACTOR, naturalDirectionOnly: true},
  'on-primary': {axis: 'p', lightTone: 96, darkTone: 20, naturalDirectionOnly: true},
  'primary-container': {axis: 'p', lightTone: 90, darkTone: 30, darkChroma: MUTED_BUTTON_CHROMA_FACTOR},
  'on-primary-container': {axis: 'p', lightTone: 10, darkTone: 90},
  'secondary': {axis: 's', lightTone: 40, darkTone: 80, lightChroma: MUTED_BUTTON_CHROMA_FACTOR, naturalDirectionOnly: true},
  'on-secondary': {axis: 's', lightTone: 96, darkTone: 20, naturalDirectionOnly: true},
  'secondary-container': {axis: 's', lightTone: 90, darkTone: 30, darkChroma: MUTED_BUTTON_CHROMA_FACTOR},
  'on-secondary-container': {axis: 's', lightTone: 10, darkTone: 90},
  'tertiary': {axis: 't', lightTone: 40, darkTone: 80, lightChroma: MUTED_BUTTON_CHROMA_FACTOR, naturalDirectionOnly: true},
  'on-tertiary': {axis: 't', lightTone: 96, darkTone: 20, naturalDirectionOnly: true},
  'tertiary-container': {axis: 't', lightTone: 90, darkTone: 30, darkChroma: MUTED_BUTTON_CHROMA_FACTOR},
  'on-tertiary-container': {axis: 't', lightTone: 10, darkTone: 90},
  // error/success: same shape as primary/secondary/tertiary above - see
  // the file header comment for why they're not just seeds like those 3.
  // Same naturalDirectionOnly treatment too - they're buttons, not derived
  // roles, so they shouldn't move except per naturalDirectionMultiplier.
  'error': {axis: 'error', lightTone: 40, darkTone: 80, lightChroma: MUTED_BUTTON_CHROMA_FACTOR, naturalDirectionOnly: true},
  'on-error': {axis: 'error', lightTone: 96, darkTone: 20, naturalDirectionOnly: true},
  'success':
      {axis: 'success', lightTone: 40, darkTone: 80, lightChroma: MUTED_BUTTON_CHROMA_FACTOR, naturalDirectionOnly: true},
  'on-success': {axis: 'success', lightTone: 96, darkTone: 20, naturalDirectionOnly: true},
  'surface': {axis: 'n', lightTone: 98, darkTone: 6},
  'on-surface': {axis: 'n', lightTone: 10, darkTone: 90},
  'on-surface-variant': {axis: 'nv', lightTone: 30, darkTone: 80},
  'surface-container-lowest': {axis: 'n', lightTone: 100, darkTone: 4},
  'surface-container-low': {axis: 'n', lightTone: 96, darkTone: 10},
  'surface-container': {axis: 'n', lightTone: 94, darkTone: 12},
  'surface-container-high': {axis: 'n', lightTone: 92, darkTone: 17},
  'surface-container-highest': {axis: 'n', lightTone: 90, darkTone: 22},
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

  const roles: Roles = {};
  for (const [name, spec] of Object.entries(ROLE_SPECS)) {
    const base = axisPalette[spec.axis];
    const tone = isDark ? spec.darkTone : spec.lightTone;
    const multiplier = spec.naturalDirectionOnly
        ? naturalDirectionMultiplier(isDark, shiftTone)
        : (spec.shiftMultiplier ?? 1);
    let chromaFactor = (isDark ? spec.darkChroma : spec.lightChroma) ?? 1;
    if (spec.naturalDirectionOnly && isDark) {
      chromaFactor *= lerp(1, DARK_DIM_MIN_CHROMA_FACTOR, multiplier * Math.abs(seeds.shift ?? 0));
    }
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
  for (const [name, hex] of Object.entries(CATEGORICAL_SEEDS)) {
    const harmonized = Hct.fromInt(Blend.harmonize(argbFromHex(hex), primaryArgb));
    const palette = TonalPalette.fromHueAndChroma(harmonized.hue, harmonized.chroma * MUTED_CHROMA_FACTOR);
    roles[name] = hexFromArgb(palette.tone(clampTone(WHEEL_TONE + wheelShiftTone)));
    roles[`on-${name}`] = hexFromArgb(palette.tone(clampTone(WHEEL_ON_TONE + wheelShiftTone)));
    roles[`${name}-pale`] = hexFromArgb(palette.tone(clampTone(WHEEL_PALE_TONE + wheelShiftTone)));
    roles[`on-${name}-pale`] = hexFromArgb(palette.tone(clampTone(WHEEL_PALE_ON_TONE + wheelShiftTone)));
  }

  return roles;
}
