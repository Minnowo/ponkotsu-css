import type {JSX} from 'preact';
import {useMemo, useState} from 'preact/hooks';
import {buildScheme, corePaletteFromSeeds, successPalette} from '../../build/src/scheme.js';
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

function ThemePreview({title, roles}: {title: string; roles: Roles}) {
  const style = toCssVars(roles) as unknown as JSX.CSSProperties;
  return (
    <div style={style} class="surface-1 flex flex-col gap-4">
      <h2>{title}</h2>

      <section class="flex flex-col gap-2">
        <h3>Buttons</h3>
        <div class="flex flex-wrap gap-2">
          <button class="btn-primary">Primary</button>
          <button class="btn-secondary">Secondary</button>
          <button class="btn-tertiary">Tertiary</button>
          <button class="btn-error">Delete</button>
          <button class="btn-success">Save</button>
          <button class="btn-primary" disabled>
            Disabled
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
          <span class="rounded-sm px-2 py-1 bg-c-error-container text-c-on-error-container">Error container</span>
          <span class="rounded-sm px-2 py-1 bg-c-success-container text-c-on-success-container">
            Success container
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
  });

  const {light, dark} = useMemo(() => {
    const core = corePaletteFromSeeds(seeds);
    const success = successPalette();
    return {
      light: buildScheme(core, success, false),
      dark: buildScheme(core, success, true),
    };
  }, [seeds]);

  const [font, setFont] = useState<'M PLUS 1' | 'M PLUS 2'>('M PLUS 1');
  const [copied, setCopied] = useState(false);
  // Mirrors generate.ts's output - see the comment it emits for why this
  // import line ships commented out rather than active.
  const cssText =
      `/* Uncomment if this is going into an empty stylesheet; leave commented\n` +
      `   if you already have "@import 'tailwindcss';" above where you paste this. */\n` +
      `/* @import 'tailwindcss'; */\n\n` +
      `@theme {\n${toCssText(dark, '    ')}\n}\n\n[data-theme='light'] {\n${toCssText(light, '    ')}\n}\n\n${baseCss}`;

  const copyCss = async () => {
    await navigator.clipboard.writeText(cssText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // <body> lives outside this component tree, so set fontFamily here
  // directly rather than via a custom property, and let it inherit down.
  const pageStyle = {
    ...toCssVars(dark),
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
          <button
            class="btn-secondary"
            onClick={() => setFont(font === 'M PLUS 1' ? 'M PLUS 2' : 'M PLUS 1')}
          >
            Font: {font}
          </button>
          <button class="btn-primary ml-auto" onClick={copyCss}>
            {copied ? 'Copied!' : 'Copy CSS'}
          </button>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ThemePreview title="Light" roles={light} />
          <ThemePreview title="Dark" roles={dark} />
        </div>
      </div>
    </div>
  );
}
