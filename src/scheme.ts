/**
 * Pure role-mapping logic: turns 3 seed colors into the app's ~30
 * `c-*` roles for light and dark. No Node built-ins here so this can be
 * imported from both the CLI (generate.ts) and the browser preview
 * (app/src/App.tsx).
 */
import {CorePalette} from '../vendor/palettes/core_palette.js';
import {TonalPalette} from '../vendor/palettes/tonal_palette.js';

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

// Fixed, not seed-derived, same as MD3's own error role. Covers save/ok
// affordances, which MD3 has no role for.
const SUCCESS_HUE = 145;
const SUCCESS_CHROMA = 48;

export type Roles = Record<string, string>;

export function corePaletteFromSeeds(seeds: Seeds): CorePalette {
  return CorePalette.contentFromColors({
    primary: argbFromHex(seeds.primary),
    secondary: argbFromHex(seeds.secondary),
    tertiary: argbFromHex(seeds.tertiary),
  });
}

export function successPalette(): TonalPalette {
  return TonalPalette.fromHueAndChroma(SUCCESS_HUE, SUCCESS_CHROMA);
}

export function buildScheme(core: CorePalette, success: TonalPalette, isDark: boolean): Roles {
  const p = (tone: number) => hexFromArgb(core.a1.tone(tone));
  const s = (tone: number) => hexFromArgb(core.a2.tone(tone));
  const t = (tone: number) => hexFromArgb(core.a3.tone(tone));
  const e = (tone: number) => hexFromArgb(core.error.tone(tone));
  const su = (tone: number) => hexFromArgb(success.tone(tone));
  const n = (tone: number) => hexFromArgb(core.n1.tone(tone));
  const nv = (tone: number) => hexFromArgb(core.n2.tone(tone));

  if (!isDark) {
    return {
      'primary': p(40), 'on-primary': p(100), 'primary-container': p(90), 'on-primary-container': p(10),
      'secondary': s(40), 'on-secondary': s(100), 'secondary-container': s(90), 'on-secondary-container': s(10),
      'tertiary': t(40), 'on-tertiary': t(100), 'tertiary-container': t(90), 'on-tertiary-container': t(10),
      'error': e(40), 'on-error': e(100), 'error-container': e(90), 'on-error-container': e(10),
      'success': su(40), 'on-success': su(100), 'success-container': su(90), 'on-success-container': su(10),
      'surface': n(98), 'on-surface': n(10), 'on-surface-variant': nv(30),
      'surface-container-lowest': n(100), 'surface-container-low': n(96), 'surface-container': n(94),
      'surface-container-high': n(92), 'surface-container-highest': n(90),
      'surface-dim': n(87), 'surface-bright': n(98),
      'outline': nv(50), 'outline-variant': nv(80),
      'inverse-surface': n(20), 'inverse-on-surface': n(95), 'inverse-primary': p(80),
    };
  }
  return {
    'primary': p(80), 'on-primary': p(20), 'primary-container': p(30), 'on-primary-container': p(90),
    'secondary': s(80), 'on-secondary': s(20), 'secondary-container': s(30), 'on-secondary-container': s(90),
    'tertiary': t(80), 'on-tertiary': t(20), 'tertiary-container': t(30), 'on-tertiary-container': t(90),
    'error': e(80), 'on-error': e(20), 'error-container': e(30), 'on-error-container': e(90),
    'success': su(80), 'on-success': su(20), 'success-container': su(30), 'on-success-container': su(90),
    'surface': n(6), 'on-surface': n(90), 'on-surface-variant': nv(80),
    'surface-container-lowest': n(4), 'surface-container-low': n(10), 'surface-container': n(12),
    'surface-container-high': n(17), 'surface-container-highest': n(22),
    'surface-dim': n(6), 'surface-bright': n(24),
    'outline': nv(60), 'outline-variant': nv(30),
    'inverse-surface': n(90), 'inverse-on-surface': n(20), 'inverse-primary': p(40),
  };
}
