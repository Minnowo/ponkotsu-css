import {useState} from 'preact/hooks';
import {
  CATEGORICAL_BASE_NAMES,
  CategoricalLineChart,
  CategoricalPieChart,
  CategoricalStackedBar,
  CategoricalSwatches,
} from './controls';

// A live demo above the code that produces it - the standard "component
// then its source" docs layout, so the reference page can be scanned
// without reverse-engineering a class name from a swatch alone.
function Example({code, children}: {code: string; children: preact.ComponentChildren}) {
  return (
    <div class="flex flex-col gap-2">
      <div class="surface-outlined flex flex-wrap items-center gap-3">{children}</div>
      <pre class="mb-0 text-xs">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const INTERACTION_ROLES = ['primary', 'secondary', 'tertiary', 'error', 'success'] as const;
type InteractionRole = (typeof INTERACTION_ROLES)[number];

// Full classes spelled out per role (rather than built with a template
// string) so Tailwind's static scanner can see and generate each one -
// a dynamically interpolated class name would never get generated.
const CUSTOM_BUTTON_CLASSES: Record<InteractionRole, string> = {
  primary:
    'rounded px-3 py-1 font-medium bg-c-primary text-c-on-primary enabled:hover:bg-c-primary-hover enabled:active:bg-c-primary-focus',
  secondary:
    'rounded px-3 py-1 font-medium bg-c-secondary text-c-on-secondary enabled:hover:bg-c-secondary-hover enabled:active:bg-c-secondary-focus',
  tertiary:
    'rounded px-3 py-1 font-medium bg-c-tertiary text-c-on-tertiary enabled:hover:bg-c-tertiary-hover enabled:active:bg-c-tertiary-focus',
  error:
    'rounded px-3 py-1 font-medium bg-c-error text-c-on-error enabled:hover:bg-c-error-hover enabled:active:bg-c-error-focus',
  success:
    'rounded px-3 py-1 font-medium bg-c-success text-c-on-success enabled:hover:bg-c-success-hover enabled:active:bg-c-success-focus',
};

// Tint variants are translucent, meant for hovering over an existing
// background (e.g. an outlined button's transparent fill) rather than
// replacing it outright the way the opaque -hover/-focus colors do.
const CUSTOM_OUTLINED_CLASSES: Record<InteractionRole, string> = {
  primary:
    'rounded px-3 py-1 font-medium bg-transparent border border-c-primary text-c-primary enabled:hover:bg-c-primary-hover-tint enabled:active:bg-c-primary-focus-tint',
  secondary:
    'rounded px-3 py-1 font-medium bg-transparent border border-c-secondary text-c-secondary enabled:hover:bg-c-secondary-hover-tint enabled:active:bg-c-secondary-focus-tint',
  tertiary:
    'rounded px-3 py-1 font-medium bg-transparent border border-c-tertiary text-c-tertiary enabled:hover:bg-c-tertiary-hover-tint enabled:active:bg-c-tertiary-focus-tint',
  error:
    'rounded px-3 py-1 font-medium bg-transparent border border-c-error text-c-error enabled:hover:bg-c-error-hover-tint enabled:active:bg-c-error-focus-tint',
  success:
    'rounded px-3 py-1 font-medium bg-transparent border border-c-success text-c-success enabled:hover:bg-c-success-hover-tint enabled:active:bg-c-success-focus-tint',
};

type ButtonState = 'idle' | 'hover' | 'focus' | 'active';

// Tracks which single state currently applies, in the same priority order
// the generated CSS itself resolves them in when several are true at once
// (e.g. hovering a focused button): active wins, then hover, then focus -
// so the label next to the button always names the class actually painting
// its background right now.
function useInteractionState() {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [active, setActive] = useState(false);
  const state: ButtonState = active ? 'active' : hover ? 'hover' : focus ? 'focus' : 'idle';
  return {
    state,
    handlers: {
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => {
        setHover(false);
        setActive(false);
      },
      // A mouse click also fires a focus event, but only keyboard-driven
      // focus actually matches `:focus-visible` in the real CSS - check it
      // directly rather than treating every focus event the same.
      onFocus: (e: FocusEvent) => {
        if ((e.currentTarget as HTMLElement).matches(':focus-visible')) setFocus(true);
      },
      onBlur: () => setFocus(false),
      onMouseDown: () => setActive(true),
      onMouseUp: () => setActive(false),
    },
  };
}

function LiveButton({
  cls,
  label,
  children,
}: {
  cls: string;
  label: Record<ButtonState, string>;
  children: preact.ComponentChildren;
}) {
  const {state, handlers} = useInteractionState();
  return (
    <div class="flex flex-wrap items-center gap-3">
      <button class={cls} {...handlers}>
        {children}
      </button>
      <code class="text-xs">{label[state]}</code>
    </div>
  );
}

function InteractionColorsSection() {
  const [role, setRole] = useState<InteractionRole>('primary');

  return (
    <section class="flex flex-col gap-2">
      <h3>Interaction / state colors</h3>
      <p class="text-c-on-surface-variant text-xs mb-0">
        There are four state colors per role: <code>-hover</code>{' '}
        and <code>-focus</code> are opaque colors for replacing a component's
        background, while <code>-hover-tint</code> and <code>-focus-tint</code>{' '}
        are translucent overlays for components that keep their existing
        background.
        <br/>
        <br/>
        You will need this if you're making custom components.
      </p>
      <label class="flex w-40 flex-col gap-1">
        Role
        <select value={role} onChange={(e) => setRole((e.target as HTMLSelectElement).value as InteractionRole)}>
          {INTERACTION_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <Example
        code={`<button class="bg-c-${role} text-c-on-${role}
  enabled:hover:bg-c-${role}-hover
  enabled:active:bg-c-${role}-focus">
  Custom button
</button>`}
      >
        <LiveButton
          cls={CUSTOM_BUTTON_CLASSES[role]}
          label={{
            idle: `bg-c-${role}`,
            hover: `enabled:hover:bg-c-${role}-hover`,
            focus: `bg-c-${role}`,
            active: `enabled:active:bg-c-${role}-focus`,
          }}
        >
          Custom button
        </LiveButton>
      </Example>
      <Example
        code={`<button class="border border-c-${role} text-c-${role}
  enabled:hover:bg-c-${role}-hover-tint
  enabled:active:bg-c-${role}-focus-tint">
  Custom outlined button
</button>`}
      >
        <LiveButton
          cls={CUSTOM_OUTLINED_CLASSES[role]}
          label={{
            idle: 'bg-transparent',
            hover: `enabled:hover:bg-c-${role}-hover-tint`,
            focus: 'bg-transparent',
            active: `enabled:active:bg-c-${role}-focus-tint`,
          }}
        >
          Custom outlined button
        </LiveButton>
      </Example>
    </section>
  );
}

const CONTAINER_HINT_CLASSES: Record<InteractionRole, string> = {
  primary: 'rounded-md p-3 bg-c-primary-container text-c-on-primary-container',
  secondary: 'rounded-md p-3 bg-c-secondary-container text-c-on-secondary-container',
  tertiary: 'rounded-md p-3 bg-c-tertiary-container text-c-on-tertiary-container',
  error: 'rounded-md p-3 bg-c-error-container text-c-on-error-container',
  success: 'rounded-md p-3 bg-c-success-container text-c-on-success-container',
};

const CONTAINER_HINT_TEXT: Record<InteractionRole, string> = {
  primary: 'Tip: drinking water is good for you.',
  secondary: 'Note: switching units converts your existing goals automatically.',
  tertiary: 'Heads up: this feature is still in beta.',
  error: "Network error while saving.",
  success: 'Meal saved successfully.',
};

function ContainerColorsSection() {
  const [role, setRole] = useState<InteractionRole>('primary');

  return (
    <section class="flex flex-col gap-2">
      <h3>Containers</h3>
      <p class="text-c-on-surface-variant text-xs mb-0">
        The roles also have containers.
      </p>
      <label class="flex w-40 flex-col gap-1">
        Role
        <select value={role} onChange={(e) => setRole((e.target as HTMLSelectElement).value as InteractionRole)}>
          {INTERACTION_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <Example
        code={`<div class="bg-c-${role}-container text-c-on-${role}-container">\n  ${CONTAINER_HINT_TEXT[role]}\n</div>`}
      >
        <div class={CONTAINER_HINT_CLASSES[role]}>{CONTAINER_HINT_TEXT[role]}</div>
      </Example>
    </section>
  );
}

// [foreground, background, description] - foreground/background are '-'
// when there's no guaranteed-readable counterpart (e.g. `outline`, which is
// a border color, not a fill anything sits on top of).
const REMAINING_COLOR_ROWS: Array<[string, string, string]> = [
  ['on-surface', 'surface', 'Page background and primary content'],
  ['on-surface-variant', 'surface', 'Lower-emphasis text on the page background (e.g. a caption or hint)'],
  ['on-surface', 'surface-container-1', 'Backs surface-1'],
  ['on-surface', 'surface-container-2', 'Backs surface-2'],
  ['on-surface', 'surface-container-3', 'Backs surface-3'],
  ['on-surface', 'surface-container-4', 'Backs surface-4'],
  ['on-surface', 'surface-container-5', 'Backs surface-5'],
  ['on-surface', 'surface-container-6', 'Backs surface-6'],
  ['on-surface', 'surface-dim', 'Dimmed surface'],
  ['on-surface', 'surface-bright', 'Bright surface'],
  ['-', 'outline', 'Borders and dividers needing real contrast'],
  ['-', 'outline-variant', 'Subtle, low-emphasis borders and dividers'],
  ['inverse-on-surface', 'inverse-surface', 'Inverted surface for things like toasts and tooltips'],
  ['inverse-primary', 'inverse-surface', 'Accent for a link/action on top of inverse-surface'],
];

// fg='-' has no guaranteed-readable counterpart (e.g. outline, a border
// color rather than a fill anything sits on top of) - shown as a blank
// filled swatch instead of text.
function ColorSwatch({fg, bg}: {fg: string; bg: string}) {
  return (
    <div
      class="flex h-8 w-16 items-center justify-center rounded-sm border border-c-outline-variant text-xs font-medium"
      style={{background: `var(--color-c-${bg})`, color: fg === '-' ? undefined : `var(--color-c-${fg})`}}
    >
      {fg !== '-' && 'Aa'}
    </div>
  );
}

// Grouped d-/normal/l- per hue (not all-normals-then-all-lights-then-
// all-darks) so the 3 variants of the same hue sit next to each other -
// makes it easy to compare how distinct light/dark actually are from normal.
const ALL_CATEGORICAL_NAMES = CATEGORICAL_BASE_NAMES.flatMap((n) => [`d-${n}`, n, `l-${n}`]);

function ColorsSection() {
  return (
    <div class="flex flex-col gap-4">
    <div class="overflow-x-scroll">
      <table>
        <thead>
          <tr>
            <th>Preview</th>
            <th>Foreground</th>
            <th>Background</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {REMAINING_COLOR_ROWS.map(([fg, bg, description]) => (
            <tr key={`${fg}-${bg}`}>
              <td>
                <ColorSwatch fg={fg} bg={bg} />
              </td>
              <td>{fg === '-' ? '-' : <code>{fg}</code>}</td>
              <td>{bg === '-' ? '-' : <code>{bg}</code>}</td>
              <td>{description}</td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>
      <section class="flex flex-col gap-3 surface-1">
        <h3>Categorical</h3>
        <p class="text-c-on-surface-variant text-xs mb-0">
          There are 5 fixed hues that shift toward the primary color. Mainly for cases where you need a specific
          color by name. Each has a pale (default), a light (<code>l-</code>), and a dark/vivid (<code>d-</code>)
          variant.
        </p>
        <div class="flex flex-col gap-2">
          <span class="text-c-on-surface-variant text-xs">Pale (default)</span>
          <div class="flex flex-wrap items-center gap-4">
            <CategoricalSwatches names={CATEGORICAL_BASE_NAMES} />
            <CategoricalPieChart names={CATEGORICAL_BASE_NAMES} />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-c-on-surface-variant text-xs">Light (l-*)</span>
          <div class="flex flex-wrap items-center gap-4">
            <CategoricalSwatches names={CATEGORICAL_BASE_NAMES.map((n) => `l-${n}`)} />
            <CategoricalPieChart names={CATEGORICAL_BASE_NAMES.map((n) => `l-${n}`)} />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-c-on-surface-variant text-xs">Dark/vivid (d-*)</span>
          <div class="flex flex-wrap items-center gap-4">
            <CategoricalSwatches names={CATEGORICAL_BASE_NAMES.map((n) => `d-${n}`)} />
            <CategoricalPieChart names={CATEGORICAL_BASE_NAMES.map((n) => `d-${n}`)} />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-c-on-surface-variant text-xs">All variants together (stacked bar)</span>
          <CategoricalStackedBar names={ALL_CATEGORICAL_NAMES} />
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-c-on-surface-variant text-xs">All variants together (line chart)</span>
          <CategoricalLineChart names={ALL_CATEGORICAL_NAMES} />
        </div>
      </section>
    </div>
  );
}

function SurfacesSection() {
  return (
    <section class="flex flex-col gap-2">
      <h3>Surfaces</h3>
      <p class="text-c-on-surface-variant text-xs mb-0">
        Body is always set as <code>surface</code>, use <code>surface-n</code> for containers meant for nesting.
        (the max value for n is 6)
      </p>
      <Example
        code={`<div class="surface-1">
  <div class="surface-2">
    <div class="surface-3">
      <div class="surface-4">
        <div class="surface-5">
          <div class="surface-6">surface-6</div>
        </div>
      </div>
    </div>
  </div>
</div>`}
      >
        <div class="surface-1">
          <span class="text-xs font-mono">surface-1</span>
          <div class="surface-2 mt-2">
            <span class="text-xs font-mono">surface-2</span>
            <div class="surface-3 mt-2">
              <span class="text-xs font-mono">surface-3</span>
              <div class="surface-4 mt-2">
                <span class="text-xs font-mono">surface-4</span>
                <div class="surface-5 mt-2">
                  <span class="text-xs font-mono">surface-5</span>
                  <div class="surface-6 mt-2">
                    <span class="text-xs font-mono">surface-6</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Example>
      <p class="text-c-on-surface-variant text-xs mb-0">
        <code>surface-outlined</code> has a transparent background - used to have a border on the same surface
        without nesting.
      </p>
      <Example code={'<div class="surface-outlined">...</div>'}>
        <div class="surface-outlined w-40">
          <span class="text-xs font-mono">surface-outlined</span>
        </div>
      </Example>
    </section>
  );
}

// Filled/outlined class pair per role - written out literally (rather than
// derived with e.g. `` `btn-${role}` ``) so Tailwind's static scanner can
// see every class name and generate it; a computed string wouldn't appear
// in the source for it to find.
const ROLE_BUTTON_CLASSES: Record<InteractionRole, {filled: string; outlined: string}> = {
  primary: {filled: 'btn-primary', outlined: 'btn-outlined-primary'},
  secondary: {filled: 'btn-secondary', outlined: 'btn-outlined-secondary'},
  tertiary: {filled: 'btn-tertiary', outlined: 'btn-outlined-tertiary'},
  error: {filled: 'btn-error', outlined: 'btn-outlined-error'},
  success: {filled: 'btn-success', outlined: 'btn-outlined-success'},
};

function ButtonsSection() {
  const [role, setRole] = useState<InteractionRole>('primary');
  const {filled, outlined} = ROLE_BUTTON_CLASSES[role];

  return (
    <section class="flex flex-col gap-3">
      <h3>Buttons</h3>
      <p class="text-c-on-surface-variant text-xs mb-0">
        Buttons follow roles, and there are emphasis levels.
      </p>
      <label class="flex w-40 flex-col gap-1">
        Role
        <select value={role} onChange={(e) => setRole((e.target as HTMLSelectElement).value as InteractionRole)}>
          {INTERACTION_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <Example code={`<button class="btn-${role}">Button</button>\n<button class="btn-${role}" disabled>Button</button>`}>
        <button class={filled}>Button</button>
        <button class={filled} disabled>
          Button
        </button>
      </Example>
      <Example
        code={`<button class="btn-outlined-${role}">Button</button>\n<button class="btn-outlined-${role}" disabled>Button</button>`}
      >
        <button class={outlined}>Button</button>
        <button class={outlined} disabled>
          Button
        </button>
      </Example>
    </section>
  );
}

function BaseElementsSection() {
  return (
    <section class="flex flex-col gap-3 surface-1">
      <h3>Base HTML elements</h3>
      <p class="text-c-on-surface-variant text-xs mb-0">
        This is what plain markup without any classes looks like.
      </p>

      <div class="flex flex-col gap-1">
        <h1>h1 heading</h1>
        <h2>h2 heading</h2>
        <h3>h3 heading</h3>
        <h4>h4 heading</h4>
        <h5>h5 heading</h5>
        <h6>h6 heading</h6>
      </div>

      <p>
        A paragraph with a <a href="#">link</a>, and <small>small print</small>. Inline code: <code>c-primary</code>.
      </p>

      <pre>{'pre-formatted\n  block of text'}</pre>

      <table>
        <thead>
          <tr>
            <th>Column A</th>
            <th>Column B</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Row 1</td>
            <td>Value</td>
          </tr>
          <tr>
            <td>Row 2</td>
            <td>Value</td>
          </tr>
        </tbody>
      </table>

      <fieldset class="flex flex-col gap-2 surface-2">
        <legend>Fieldset legend</legend>
        <label class="flex flex-col gap-1">
          Text input
          <input type="text" placeholder="Placeholder" />
        </label>
        <label class="flex flex-col gap-1">
          Select
          <select>
            <option>Option A</option>
            <option>Option B</option>
          </select>
        </label>
        <label class="flex flex-col gap-1">
          Textarea
          <textarea rows={2} placeholder="Placeholder" />
        </label>
        <button class="self-start">Button</button>
        <label class="flex flex-row items-center gap-2">
          <input type="checkbox" defaultChecked />
          Checkbox
        </label>
        <label class="flex flex-row items-center gap-2">
          <input type="radio" name="ref-radio" defaultChecked />
          Radio A
        </label>
        <label class="flex flex-row items-center gap-2">
          <input type="radio" name="ref-radio" />
          Radio B
        </label>
        <label class="flex flex-col gap-1">
          Range
          <input type="range" min={0} max={100} defaultValue={50} />
        </label>
        <label class="flex flex-col gap-1">
          Disabled input
          <input type="text" defaultValue="Can't touch this" disabled />
        </label>
      </fieldset>
    </section>
  );
}

export function ReferencePage() {
  return (
    <div class="flex flex-col gap-6 max-w-5xl mx-auto">
      <div>
        <h2>Reference</h2>
        <p class="text-c-on-surface-variant mb-0">ponkotsu-css reference.</p>
      </div>
      <ButtonsSection />
      <InteractionColorsSection />
      <ContainerColorsSection />
      <SurfacesSection />
      <ColorsSection />
      <BaseElementsSection />
    </div>
  );
}
