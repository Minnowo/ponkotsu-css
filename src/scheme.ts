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
}

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

export function buildScheme(
    core: CorePalette,
    seeds: Seeds,
    isDark: boolean,
): Roles {
  const p = (tone: number) => hexFromArgb(core.a1.tone(tone));
  const s = (tone: number) => hexFromArgb(core.a2.tone(tone));
  const t = (tone: number) => hexFromArgb(core.a3.tone(tone));
  const n = (tone: number) => hexFromArgb(core.n1.tone(tone));
  const nv = (tone: number) => hexFromArgb(core.n2.tone(tone));

  // HCT's max achievable chroma varies a lot by tone - it's naturally low
  // near the white/black edges (tone 90+/10-), which is why light's
  // *-container (tone 90) and dark's on-*-container (tone 90) already read
  // as muted without any help. But tone 40 (light's primary/secondary/
  // tertiary) and tone 30 (dark's *-container) sit in a high-chroma part
  // of the ramp, so a vivid seed color comes through there at close to
  // full intensity - "neon". Only those two spots get a separate, chroma-
  // reduced palette; tone 80 (dark's primary/secondary/tertiary) is left
  // alone since it already reads fine at full chroma.
  const MUTED_BUTTON_CHROMA_FACTOR = 0.6;
  const pMuted = (tone: number) =>
      hexFromArgb(TonalPalette.fromHueAndChroma(core.a1.hue, core.a1.chroma * MUTED_BUTTON_CHROMA_FACTOR).tone(tone));
  const sMuted = (tone: number) =>
      hexFromArgb(TonalPalette.fromHueAndChroma(core.a2.hue, core.a2.chroma * MUTED_BUTTON_CHROMA_FACTOR).tone(tone));
  const tMuted = (tone: number) =>
      hexFromArgb(TonalPalette.fromHueAndChroma(core.a3.hue, core.a3.chroma * MUTED_BUTTON_CHROMA_FACTOR).tone(tone));

  // error/success: built the same way as primary/secondary/tertiary above
  // (muted tone 40 for light, full-chroma tone 80 for dark) - see the file
  // header comment for why they're not just seeds like the other three.
  const primaryArgb = argbFromHex(seeds.primary);
  const errorPalette = harmonizedPalette(ERROR_SEED_HEX, primaryArgb);
  const successPalette = harmonizedPalette(SUCCESS_SEED_HEX, primaryArgb);
  const eMuted = (tone: number) =>
      hexFromArgb(TonalPalette.fromHueAndChroma(errorPalette.hue, errorPalette.chroma * MUTED_BUTTON_CHROMA_FACTOR)
          .tone(tone));
  const suMuted = (tone: number) =>
      hexFromArgb(
          TonalPalette.fromHueAndChroma(successPalette.hue, successPalette.chroma * MUTED_BUTTON_CHROMA_FACTOR)
              .tone(tone));

  // Categorical colors are flat accents (chart series, tag swatches), but
  // still get an on-* pair for when text/an icon sits on top of one (a
  // filled tag chip, a legend swatch with a label inside it) - off the
  // same hue/chroma so it stays a matched pair rather than a generic
  // black/white. Each name gets 2 variants (see WHEEL_TONE above).
  const categoricalRoles: Roles = {};
  for (const [name, hex] of Object.entries(CATEGORICAL_SEEDS)) {
    const harmonized = Hct.fromInt(Blend.harmonize(argbFromHex(hex), primaryArgb));
    const palette = TonalPalette.fromHueAndChroma(harmonized.hue, harmonized.chroma * MUTED_CHROMA_FACTOR);
    categoricalRoles[name] = hexFromArgb(palette.tone(WHEEL_TONE));
    categoricalRoles[`on-${name}`] = hexFromArgb(palette.tone(WHEEL_ON_TONE));
    categoricalRoles[`${name}-pale`] = hexFromArgb(palette.tone(WHEEL_PALE_TONE));
    categoricalRoles[`on-${name}-pale`] = hexFromArgb(palette.tone(WHEEL_PALE_ON_TONE));
  }

  if (!isDark) {
    return {
      'primary': pMuted(40), 'on-primary': p(96), 'primary-container': p(90), 'on-primary-container': p(10),
      'secondary': sMuted(40), 'on-secondary': s(96), 'secondary-container': s(90), 'on-secondary-container': s(10),
      'tertiary': tMuted(40), 'on-tertiary': t(96), 'tertiary-container': t(90), 'on-tertiary-container': t(10),
      'error': eMuted(40), 'on-error': hexFromArgb(errorPalette.tone(96)),
      'success': suMuted(40), 'on-success': hexFromArgb(successPalette.tone(96)),
      'surface': n(98), 'on-surface': n(10), 'on-surface-variant': nv(30),
      'surface-container-lowest': n(100), 'surface-container-low': n(96), 'surface-container': n(94),
      'surface-container-high': n(92), 'surface-container-highest': n(90),
      'surface-dim': n(87), 'surface-bright': n(98),
      'outline': nv(50), 'outline-variant': nv(80),
      'inverse-surface': n(20), 'inverse-on-surface': n(95), 'inverse-primary': p(80),
      ...categoricalRoles,
    };
  }
  return {
    'primary': p(80), 'on-primary': p(20), 'primary-container': pMuted(30), 'on-primary-container': p(90),
    'secondary': s(80), 'on-secondary': s(20), 'secondary-container': sMuted(30), 'on-secondary-container': s(90),
    'tertiary': t(80), 'on-tertiary': t(20), 'tertiary-container': tMuted(30), 'on-tertiary-container': t(90),
    'error': hexFromArgb(errorPalette.tone(80)), 'on-error': hexFromArgb(errorPalette.tone(20)),
    'success': hexFromArgb(successPalette.tone(80)), 'on-success': hexFromArgb(successPalette.tone(20)),
    'surface': n(6), 'on-surface': n(90), 'on-surface-variant': nv(80),
    'surface-container-lowest': n(4), 'surface-container-low': n(10), 'surface-container': n(12),
    'surface-container-high': n(17), 'surface-container-highest': n(22),
    'surface-dim': n(6), 'surface-bright': n(24),
    'outline': nv(60), 'outline-variant': nv(30),
    'inverse-surface': n(90), 'inverse-on-surface': n(20), 'inverse-primary': p(40),
    ...categoricalRoles,
  };
}
