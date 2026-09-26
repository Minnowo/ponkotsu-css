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

export const CATEGORICAL_BASE_NAMES = ['pink', 'red', 'yellow', 'green', 'blue'];

// Each base name has a vivid/dark variant and a pale/light variant (see
// WHEEL_TONE in scheme.ts) - grouped dark-half/light-half here rather than
// interleaved, which read better than alternating dark/light/dark/light.
export const CATEGORICAL_NAMES = [
  ...CATEGORICAL_BASE_NAMES,
  ...CATEGORICAL_BASE_NAMES.map((name) => `l-${name}`),
];

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
