import type {JSX} from 'preact';
import {useMemo, useState} from 'preact/hooks';
import {buildScheme, corePaletteFromSeeds} from '../../build/src/scheme.js';
import type {Roles, Seeds} from '../../build/src/scheme.js';
import baseCss from './base.css?raw';

function toCssVars(roles: Roles): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [role, hex] of Object.entries(roles)) {
    vars[`--color-c-${role}`] = hex;
  }
  return vars;
}

function toCssText(roles: Roles, indent: string): string {
  return Object.entries(roles)
      .map(([role, hex]) => `${indent}--color-c-${role}: ${hex};`)
      .join('\n');
}

function ColorField({label, value, onChange}: {label: string; value: string; onChange: (hex: string) => void}) {
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

// Not a color - a uniform tone shift applied within whichever theme (light
// or dark) is being previewed (see Seeds.shift in scheme.ts). -1 = as dark
// as that theme goes, +1 = as light as that theme goes, 0 = unshifted.
// Affects both the Light and Dark panels below, each shifted from its own
// baseline.
function RangeField({label, value, onChange}: {label: string; value: number; onChange: (value: number) => void}) {
  return (
    <label class="flex items-center gap-2 text-sm">
      <input
        type="range"
        min={-1}
        max={1}
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

const CATEGORICAL_BASE_NAMES = [
  'pink', 'red', 'yellow', 'green', 'blue',
];

// Each base name has a vivid/dark variant and a pale/light variant (see
// WHEEL_TONE in scheme.ts) - grouped dark-half/light-half here rather than
// interleaved, which read better than alternating dark/pale/dark/pale.
const CATEGORICAL_NAMES = [
  ...CATEGORICAL_BASE_NAMES,
  ...CATEGORICAL_BASE_NAMES.map((name) => `${name}-pale`),
];

// Quick visual gut-check for how a set of categorical colors read together
// (e.g. as pie chart slices) rather than as isolated swatches.
function CategoricalPieChart({names}: {names: string[]}) {
  const slice = 100 / names.length;
  const stops = names.map(
      (name, i) => `var(--color-c-${name}) ${i * slice}% ${(i + 1) * slice}%`,
  ).join(', ');
  return (
    <div
      class="h-40 w-40 rounded-full"
      style={{background: `conic-gradient(${stops})`} as JSX.CSSProperties}
    />
  );
}

function CategoricalSwatches({names}: {names: string[]}) {
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

function ThemePreview({title, roles, showWheel}: {title: string; roles: Roles; showWheel: boolean}) {
  const style = toCssVars(roles) as unknown as JSX.CSSProperties;
  return (
    <div style={style} class="surface-1 flex flex-col gap-4">
      <h2>{title}</h2>

      {showWheel && (
        <section class="flex flex-col gap-2">
          <h3>Categorical (charts / tags)</h3>
          <p class="text-c-on-surface-variant text-xs mb-0">
            Fixed hues, harmonized toward primary - distinct from each other, related to the theme. Each color has
            a vivid/dark and a pale/light variant (dark half of the wheel, then the light half). error/success
            alias red/green from this set (see below).
          </p>
          <CategoricalSwatches names={CATEGORICAL_NAMES} />
          <CategoricalPieChart names={CATEGORICAL_NAMES} />
        </section>
      )}

      <section class="flex flex-col gap-2">
        <h3>Buttons</h3>
        <div class="flex flex-wrap gap-2">
          <button>Regular</button>
          <button class="btn-primary">Primary</button>
          <button class="btn-secondary">Secondary</button>
          <button class="btn-tertiary">Tertiary</button>
          <button class="btn-error">Error</button>
          <button class="btn-success">Success</button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button disabled>Regular</button>
          <button class="btn-primary" disabled>
            Primary
          </button>
          <button class="btn-secondary" disabled>
            Secondary
          </button>
          <button class="btn-tertiary" disabled>
            Tertiary
          </button>
          <button class="btn-error" disabled>
            Error
          </button>
          <button class="btn-success" disabled>
            Success
          </button>
        </div>
      </section>

      <section class="flex flex-col gap-2">
        <h3>Outlined buttons</h3>
        <div class="flex flex-wrap gap-2">
          <button class="btn-outlined">Neutral</button>
          <button class="btn-outlined-primary">Primary</button>
          <button class="btn-outlined-secondary">Secondary</button>
          <button class="btn-outlined-tertiary">Tertiary</button>
          <button class="btn-outlined-error">Error</button>
          <button class="btn-outlined-success">Success</button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button class="btn-outlined" disabled>
            Neutral
          </button>
          <button class="btn-outlined-primary" disabled>
            Primary
          </button>
          <button class="btn-outlined-secondary" disabled>
            Secondary
          </button>
          <button class="btn-outlined-tertiary" disabled>
            Tertiary
          </button>
          <button class="btn-outlined-error" disabled>
            Error
          </button>
          <button class="btn-outlined-success" disabled>
            Success
          </button>
        </div>
      </section>

      <section class="flex flex-col gap-2">
        <h3>Containers</h3>
        <div class="flex flex-wrap gap-2">
          <span class="rounded-sm px-2 py-1 bg-c-primary-container text-c-on-primary-container">
            Primary container
          </span>
          <span class="rounded-sm px-2 py-1 bg-c-secondary-container text-c-on-secondary-container">
            Secondary container
          </span>
          <span class="rounded-sm px-2 py-1 bg-c-tertiary-container text-c-on-tertiary-container">
            Tertiary container
          </span>
        </div>

        {/* Nesting ladder: each level up steps the surface-container tone,
            so 3 boxes deep still reads as 3 distinct layers. */}
        <div class="surface-2">
          <p>surface-2, nested inside this panel's surface-1</p>
          <div class="surface-3">
            <p class="mb-0">surface-3, nested inside the surface-2 above</p>
          </div>
        </div>
      </section>

      <section class="flex flex-col gap-3">
        <h3>Form controls</h3>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label class="flex flex-col gap-1">
            Name
            <input type="text" placeholder="Jane Doe" />
          </label>

          <label class="flex flex-col gap-1">
            Quantity
            <input type="number" min={0} max={99} defaultValue={3} />
          </label>

          <label class="flex flex-col gap-1">
            Meal type
            <select>
              <option>Breakfast</option>
              <option>Lunch</option>
              <option>Dinner</option>
              <option>Snack</option>
            </select>
          </label>

          <label class="flex flex-col gap-1">
            Portion size
            <input type="range" min={0} max={100} defaultValue={40} />
          </label>

          <label class="flex flex-col gap-1">
            Notes
            <textarea rows={2} placeholder="Optional notes" />
          </label>

          <label class="flex flex-col gap-1">
            Disabled field
            <input type="text" defaultValue="Can't touch this" disabled />
          </label>
        </div>

        <fieldset class="flex flex-col gap-2">
          <legend>Preferences</legend>

          <label class="flex flex-row items-center gap-2 text-sm font-normal">
            <input type="checkbox" defaultChecked />
            Track calories
          </label>
          <label class="flex flex-row items-center gap-2 text-sm font-normal">
            <input type="checkbox" />
            Track macros
          </label>
          <label class="flex flex-row items-center gap-2 text-sm font-normal">
            <input type="checkbox" disabled />
            Sync to watch (unavailable)
          </label>

          <div role="radiogroup" aria-label="Units" class="flex flex-col gap-1 mt-2">
            <label class="flex flex-row items-center gap-2 text-sm font-normal">
              <input type="radio" name={`units-${title}`} defaultChecked />
              Metric
            </label>
            <label class="flex flex-row items-center gap-2 text-sm font-normal">
              <input type="radio" name={`units-${title}`} />
              Imperial
            </label>
          </div>
        </fieldset>
      </section>

      <section class="flex flex-col gap-2">
        <h3>Table</h3>
        <table>
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Calories</th></tr>
          </thead>
          <tbody>
            <tr><td>Apples</td><td>3</td><td>260</td></tr>
            <tr><td>Bread</td><td>1</td><td>120</td></tr>
            <tr><td>Chicken breast</td><td>2</td><td>330</td></tr>
          </tbody>
        </table>
      </section>

      <section class="flex flex-col gap-2">
        <h3>Text</h3>
        <p>
          Body text sits on <code>on-surface</code>. A <a href="#">link uses primary</a>, and{' '}
          <small>small print uses on-surface-variant</small>.
        </p>
        <p class="text-c-on-surface-variant text-xs mb-0">outline / outline-variant swatches:</p>
        <div class="flex gap-2">
          <div class="h-6 w-16 rounded-sm border-2 border-c-outline" />
          <div class="h-6 w-16 rounded-sm border-2 border-c-outline-variant" />
        </div>
      </section>
    </div>
  );
}

export function App() {
  const [seeds, setSeeds] = useState<Seeds>({
    primary: '#D7BA7D',
    secondary: '#5AA9E6',
    tertiary: '#C77DFF',
    shift: 0,
  });

  const {light, dark} = useMemo(() => {
    const core = corePaletteFromSeeds(seeds);
    return {
      light: buildScheme(core, seeds, false),
      dark: buildScheme(core, seeds, true),
    };
  }, [seeds]);

  const [font, setFont] = useState<'M PLUS 1' | 'M PLUS 2'>('M PLUS 1');
  const [copied, setCopied] = useState(false);
  // 'split' compares both side by side; 'light'/'dark' show just one full
  // width, with the page itself (not just the panel) switching to that
  // theme - a light panel sitting on an always-dark page makes its colors
  // hard to judge in isolation.
  const [view, setView] = useState<'split' | 'light' | 'dark'>('split');
  const [showWheel, setShowWheel] = useState(true);
  // Mirrors generate.ts's output.
  const cssText =
      `@import 'tailwindcss';\n\n` +
      `@theme {\n    --color-*: initial;\n${toCssText(dark, '    ')}\n}\n\n` +
      `[data-theme='light'] {\n${toCssText(light, '    ')}\n}\n\n${baseCss}`;

  const copyCss = async () => {
    await navigator.clipboard.writeText(cssText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // <body> lives outside this component tree, so set fontFamily here
  // directly rather than via a custom property, and let it inherit down.
  const pageStyle = {
    ...toCssVars(view === 'light' ? light : dark),
    fontFamily: `'${font}', system-ui, sans-serif`,
  } as unknown as JSX.CSSProperties;

  return (
    <div style={pageStyle} class="min-h-screen bg-c-surface p-6">
      <div class="mx-auto flex max-w-5xl flex-col gap-4">
        <h1>ponkotsu preview</h1>

        <div class="surface-1 flex flex-wrap items-center gap-4">
          <ColorField label="Primary" value={seeds.primary} onChange={(hex) => setSeeds({...seeds, primary: hex})} />
          <ColorField
            label="Secondary"
            value={seeds.secondary}
            onChange={(hex) => setSeeds({...seeds, secondary: hex})}
          />
          <ColorField
            label="Tertiary"
            value={seeds.tertiary}
            onChange={(hex) => setSeeds({...seeds, tertiary: hex})}
          />
          <RangeField
            label="Shift"
            value={seeds.shift ?? 0}
            onChange={(value) => setSeeds({...seeds, shift: value})}
          />
          <button
            class="btn-secondary"
            onClick={() => setFont(font === 'M PLUS 1' ? 'M PLUS 2' : 'M PLUS 1')}
          >
            Font: {font}
          </button>
          <div class="flex gap-1">
            <button
              class={view === 'split' ? 'btn-primary' : 'btn-outlined'}
              onClick={() => setView('split')}
            >
              Split
            </button>
            <button
              class={view === 'light' ? 'btn-primary' : 'btn-outlined'}
              onClick={() => setView('light')}
            >
              Light only
            </button>
            <button
              class={view === 'dark' ? 'btn-primary' : 'btn-outlined'}
              onClick={() => setView('dark')}
            >
              Dark only
            </button>
          </div>
          <button
            class={showWheel ? 'btn-primary' : 'btn-outlined'}
            onClick={() => setShowWheel(!showWheel)}
          >
            Wheel: {showWheel ? 'on' : 'off'}
          </button>
          <button class="btn-primary ml-auto" onClick={copyCss}>
            {copied ? 'Copied!' : 'Copy CSS'}
          </button>
        </div>

        {view === 'split' && (
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ThemePreview
              title={`Light (shift ${(seeds.shift ?? 0).toFixed(2)})`}
              roles={light}
              showWheel={showWheel}
            />
            <ThemePreview
              title={`Dark (shift ${(seeds.shift ?? 0).toFixed(2)})`}
              roles={dark}
              showWheel={showWheel}
            />
          </div>
        )}
        {view === 'light' && (
          <ThemePreview title={`Light (shift ${(seeds.shift ?? 0).toFixed(2)})`} roles={light} showWheel={showWheel} />
        )}
        {view === 'dark' && (
          <ThemePreview title={`Dark (shift ${(seeds.shift ?? 0).toFixed(2)})`} roles={dark} showWheel={showWheel} />
        )}
      </div>
    </div>
  );
}
