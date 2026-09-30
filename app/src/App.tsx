import type {JSX} from 'preact';
import {useEffect, useMemo, useState} from 'preact/hooks';
import {buildScheme, corePaletteFromSeeds} from '../../build/src/scheme.js';
import type {Seeds, ThemeSeeds} from '../../build/src/scheme.js';
import baseCss from './base.css?raw';
import {toCssText, toCssVars} from './controls';
import {ControlPanel} from './ControlPanel';
import {FakeApp} from './FakeApp';
import {ReferencePage} from './ReferencePage';

type Page = 'app' | 'reference';

function pageFromHash(hash: string): Page {
  switch (hash) {
    case '#reference':
      return 'reference';
    case '#app':
    default:
      return 'app';
  }
}

export function App() {
  const [themeSeeds, setThemeSeeds] = useState<ThemeSeeds>({
    dark: {primary: '#D2AE61', secondary: '#5AA9E6', tertiary: '#C77DFF', shift: 1, dimBaseline: 0.6},
    light: {primary: '#D2AE61', secondary: '#5AA9E6', tertiary: '#C77DFF', shift: 1, dimBaseline: 0.6},
  });
  const [isDark, setIsDark] = useState(true);

  // The controls edit the seeds of whichever theme is being viewed.
  const seeds = isDark ? themeSeeds.dark : themeSeeds.light;
  const setSeeds = (next: Seeds) => setThemeSeeds((s) => (isDark ? {...s, dark: next} : {...s, light: next}));
  const [font, setFont] = useState<'M PLUS 1' | 'M PLUS 2'>('M PLUS 1');
  const [copied, setCopied] = useState(false);
  const [page, setPageState] = useState<Page>(() => pageFromHash(window.location.hash));

  const setPage = (next: Page) => {
    setPageState(next);
    window.location.hash = next;
  };

  useEffect(() => {
    const onHashChange = () => setPageState(pageFromHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const {roles, light, dark} = useMemo(() => {
    const light = buildScheme(corePaletteFromSeeds(themeSeeds.light), themeSeeds.light, false);
    const dark = buildScheme(corePaletteFromSeeds(themeSeeds.dark), themeSeeds.dark, true);
    return {roles: isDark ? dark : light, light, dark};
  }, [themeSeeds, isDark]);

  // Mirrors generate.ts's output - always both themes, regardless of which
  // one is currently being viewed.
  const cssText =
      `@import 'tailwindcss';\n\n` +
      `@theme static {\n    --color-*: initial;\n${toCssText(dark, '    ')}\n}\n\n` +
      `[data-theme='light'] {\n${toCssText(light, '    ')}\n}\n\n${baseCss}`;

  const copyCss = async () => {
    await navigator.clipboard.writeText(cssText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // <body> lives outside this component tree, so set fontFamily here
  // directly rather than via a custom property, and let it inherit down.
  const pageStyle = {
    ...toCssVars(roles),
    fontFamily: `'${font}', system-ui, sans-serif`,
  } as unknown as JSX.CSSProperties;

  return (
    <div style={pageStyle} class="min-h-screen bg-c-surface text-c-on-surface">
      <div class="flex justify-center gap-1 p-3 border-b border-c-outline-variant">
        <button class={page === 'app' ? 'btn-primary' : 'btn-outlined'} onClick={() => setPage('app')}>
          Theme Preview
        </button>
        <button class={page === 'reference' ? 'btn-primary' : 'btn-outlined'} onClick={() => setPage('reference')}>
          Reference
        </button>
      </div>

      <div class="p-4 sm:p-6">{page === 'app' ? <FakeApp /> : <ReferencePage />}</div>

      <ControlPanel
        seeds={seeds}
        onSeedsChange={setSeeds}
        isDark={isDark}
        onDarkChange={setIsDark}
        font={font}
        onFontChange={setFont}
        onCopyCss={copyCss}
        copied={copied}
      />
    </div>
  );
}
