import type {JSX} from 'preact';
import type {Roles} from '../../build/src/scheme.js';

export function toCssVars(roles: Roles): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [role, hex] of Object.entries(roles)) {
    vars[`--color-c-${role}`] = hex;
  }
  return vars;
}

export function toCssText(roles: Roles, indent: string): string {
  return Object.entries(roles)
      .map(([role, hex]) => `${indent}--color-c-${role}: ${hex};`)
      .join('\n');
}

export function ColorField({label, value, onChange}: {label: string; value: string; onChange: (hex: string) => void}) {
  return (
    <label class="flex items-center gap-2 text-sm">
      <input
        type="color"
        value={value}
        onInput={(e) => onChange((e.target as HTMLInputElement).value)}
        class="h-8 w-12 cursor-pointer rounded-sm border border-c-outline bg-transparent"
      />
      <span>{label}</span>
      <span class="text-c-on-surface-variant">{value}</span>
    </label>
  );
}

export function RangeField({
  label,
  value,
  onChange,
  min = -1,
  max = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <label class="flex items-center gap-2 text-sm">
      <input
        type="range"
        min={min}
        max={max}
        step={0.01}
        value={value}
        onInput={(e) => onChange(Number((e.target as HTMLInputElement).value))}
        class="w-32 cursor-pointer"
      />
      <span>{label}</span>
      <span class="text-c-on-surface-variant">{value.toFixed(2)}</span>
    </label>
  );
}

// Each base name has a pale/light variant (the default, plain name) and a
// vivid/dark variant (d-<name>) (see WHEEL_TONE in scheme.ts). Ordered by
// harmonized hue (not insertion order) so neighbors on the wheel/swatch
// list sit next to each other - makes it easy to spot two hues that read
// as too close together.
export const CATEGORICAL_BASE_NAMES = ['red', 'yellow', 'green', 'blue', 'pink'];

// Quick visual gut-check for how a set of categorical colors read together
// (e.g. as pie chart slices) rather than as isolated swatches.
export function CategoricalPieChart({names}: {names: string[]}) {
  const slice = 100 / names.length;
  const stops = names.map(
      (name, i) => `var(--color-c-${name}) ${i * slice}% ${(i + 1) * slice}%`,
  ).join(', ');
  return (
    <div
      class="h-32 w-32 rounded-full flex-shrink-0"
      style={{background: `conic-gradient(${stops})`} as JSX.CSSProperties}
    />
  );
}

export function CategoricalSwatches({names}: {names: string[]}) {
  return (
    <div class="flex flex-wrap gap-2">
      {names.map((name) => (
        <div key={name} class="flex flex-col items-center gap-1">
          <div
            class="h-8 w-14 rounded-sm flex items-center justify-center text-xs font-medium"
            style={
              {
                background: `var(--color-c-${name})`,
                color: `var(--color-c-on-${name})`,
              } as JSX.CSSProperties
            }
          >
            Aa
          </div>
          <span class="text-c-on-surface-variant text-xs">{name}</span>
        </div>
      ))}
    </div>
  );
}

// Equal-width segments - there's no real "value" per series here, this is
// just a gut-check for how a whole categorical set reads stacked together
// (e.g. a 100%-stacked bar chart) rather than as isolated swatches.
export function CategoricalStackedBar({names}: {names: string[]}) {
  return (
    <div class="flex h-10 w-full max-w-2xl overflow-hidden rounded-sm border border-c-outline-variant">
      {names.map((name) => (
        <div key={name} class="h-full flex-1" style={{background: `var(--color-c-${name})`} as JSX.CSSProperties} />
      ))}
    </div>
  );
}

const LINE_CHART_POINTS = 8;

// Deterministic pseudo-random in [0, 1) from a name+index seed - just needs
// to look varied point-to-point (no real data backs this, it's only here to
// show how the categorical set reads as chart lines rather than isolated
// swatches). A plain string hash of `${seed}-${i}` doesn't work for this:
// since only the trailing digit changes between points, the hash - and so
// the output - increases almost linearly with i, drawing a straight
// diagonal instead of noise. Feeding the hash through sin() decorrelates
// consecutive i's the way classic GLSL-style pseudo-noise does.
function pseudoRandom(seed: string, i: number): number {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const x = Math.sin(hash + i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function CategoricalLineChart({names}: {names: string[]}) {
  const width = 320;
  const height = 140;
  const padding = 8;
  const stepX = (width - padding * 2) / (LINE_CHART_POINTS - 1);
  return (
    <svg width={width} height={height} class="flex-shrink-0">
      {names.map((name) => {
        const points = Array.from({length: LINE_CHART_POINTS}, (_, i) => {
          const x = padding + i * stepX;
          const y = padding + pseudoRandom(name, i) * (height - padding * 2);
          return `${x},${y}`;
        }).join(' ');
        return <polyline key={name} points={points} fill="none" stroke={`var(--color-c-${name})`} stroke-width="2" />;
      })}
    </svg>
  );
}
