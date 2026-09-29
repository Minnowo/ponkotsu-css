import {useState} from 'preact/hooks';
import type {Seeds} from '../../build/src/scheme.js';
import {ColorField, RangeField} from './controls';

type ControlPanelProps = {
  seeds: Seeds;
  onSeedsChange: (seeds: Seeds) => void;
  isDark: boolean;
  onDarkChange: (isDark: boolean) => void;
  font: 'M PLUS 1' | 'M PLUS 2';
  onFontChange: (font: 'M PLUS 1' | 'M PLUS 2') => void;
  onCopyCss: () => void;
  copied: boolean;
};

// A floating settings button so theme controls stay reachable no matter
// which page/scroll position the user is on, rather than a fixed panel
// pinned to the top that eats vertical space everywhere.
export function ControlPanel({
  seeds,
  onSeedsChange,
  isDark,
  onDarkChange,
  font,
  onFontChange,
  onCopyCss,
  copied,
}: ControlPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div class="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div class="surface-1 flex flex-col gap-3 w-full max-w-72 max-h-[70vh] overflow-y-auto">
          <div class="flex items-center justify-between">
            <h4>Theme controls</h4>
            <button class="btn-outlined" onClick={() => onDarkChange(!isDark)}>
              {isDark ? 'Dark' : 'Light'}
            </button>
          </div>

          <ColorField label="Primary" value={seeds.primary} onChange={(hex) => onSeedsChange({...seeds, primary: hex})} />
          <ColorField
            label="Secondary"
            value={seeds.secondary}
            onChange={(hex) => onSeedsChange({...seeds, secondary: hex})}
          />
          <ColorField
            label="Tertiary"
            value={seeds.tertiary}
            onChange={(hex) => onSeedsChange({...seeds, tertiary: hex})}
          />
          <RangeField
            label="Shift"
            value={seeds.shift ?? 0}
            onChange={(value) => onSeedsChange({...seeds, shift: value})}
          />
          <RangeField
            label="Dim baseline"
            min={0}
            max={1}
            value={seeds.dimBaseline ?? 0.4}
            onChange={(value) => onSeedsChange({...seeds, dimBaseline: value})}
          />

          <div class="flex items-center justify-between gap-2">
            <button class="btn-outlined" onClick={() => onFontChange(font === 'M PLUS 1' ? 'M PLUS 2' : 'M PLUS 1')}>
              Font: {font}
            </button>
            <button class="btn-primary" onClick={onCopyCss}>
              {copied ? 'Copied!' : 'Copy CSS'}
            </button>
          </div>
        </div>
      )}

      <button class="btn-primary rounded-full h-12 w-12 flex items-center justify-center text-xl" onClick={() => setOpen(!open)}>
        {open ? '✕' : '⚙'}
      </button>
    </div>
  );
}
