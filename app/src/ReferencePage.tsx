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
      <div class="surface-border flex flex-wrap items-center gap-2">{children}</div>
      <pre class="text-xs">
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
    'rounded px-3 py-1 font-medium border-none bg-c-primary text-c-on-primary enabled:hover:bg-c-primary-hover enabled:active:bg-c-primary-focus',
  secondary:
    'rounded px-3 py-1 font-medium border-none bg-c-secondary text-c-on-secondary enabled:hover:bg-c-secondary-hover enabled:active:bg-c-secondary-focus',
  tertiary:
    'rounded px-3 py-1 font-medium border-none bg-c-tertiary text-c-on-tertiary enabled:hover:bg-c-tertiary-hover enabled:active:bg-c-tertiary-focus',
  error:
    'rounded px-3 py-1 font-medium border-none bg-c-error text-c-on-error enabled:hover:bg-c-error-hover enabled:active:bg-c-error-focus',
  success:
    'rounded px-3 py-1 font-medium border-none bg-c-success text-c-on-success enabled:hover:bg-c-success-hover enabled:active:bg-c-success-focus',
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
      <h2>Interaction / state colors</h2>
      <small>
        There are four state colors per role: <code>-hover</code>{' '}
        and <code>-focus</code> are opaque colors for replacing a component's
        background, while <code>-hover-tint</code> and <code>-focus-tint</code>{' '}
        are translucent overlays for components that keep their existing
        background. You will need this if you're making custom components.
      </small>
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
      <h2>Containers</h2>
      <small>
        The roles also have containers.
      </small>
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
        <small>
          There are 5 fixed hues that shift toward the primary color. Mainly for cases where you need a specific
          color by name. Each has a pale (default), a light (<code>l-</code>), and a dark/vivid (<code>d-</code>)
          variant.
        </small>
        <div class="flex flex-col gap-2">
          <small>Pale (default)</small>
          <div class="flex flex-wrap items-center gap-4">
            <CategoricalSwatches names={CATEGORICAL_BASE_NAMES} />
            <CategoricalPieChart names={CATEGORICAL_BASE_NAMES} />
          </div>
          <CategoricalLineChart names={CATEGORICAL_BASE_NAMES} />
        </div>
        <div class="flex flex-col gap-2">
          <small>Light (l-*)</small>
          <div class="flex flex-wrap items-center gap-4">
            <CategoricalSwatches names={CATEGORICAL_BASE_NAMES.map((n) => `l-${n}`)} />
            <CategoricalPieChart names={CATEGORICAL_BASE_NAMES.map((n) => `l-${n}`)} />
          </div>
          <CategoricalLineChart names={CATEGORICAL_BASE_NAMES.map((n) => `l-${n}`)} />
        </div>
        <div class="flex flex-col gap-2">
          <small>Dark/vivid (d-*)</small>
          <div class="flex flex-wrap items-center gap-4">
            <CategoricalSwatches names={CATEGORICAL_BASE_NAMES.map((n) => `d-${n}`)} />
            <CategoricalPieChart names={CATEGORICAL_BASE_NAMES.map((n) => `d-${n}`)} />
          </div>
          <CategoricalLineChart names={CATEGORICAL_BASE_NAMES.map((n) => `d-${n}`)} />
        </div>
        <div class="flex flex-col gap-2">
          <small>All variants together (stacked bar)</small>
          <CategoricalStackedBar names={ALL_CATEGORICAL_NAMES} />
        </div>
        <div class="flex flex-col gap-2">
          <small>All variants together (line chart)</small>
          <CategoricalLineChart names={ALL_CATEGORICAL_NAMES} />
        </div>
      </section>
    </div>
  );
}

function SurfacesSection() {
  return (
    <section class="flex flex-col gap-2">
      <h2>Surfaces</h2>
      <small>
        Body is always set as <code>surface</code>, use <code>surface-n</code> for containers meant for nesting.
        (the max value for n is 6)
      </small>
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
        <div class="surface-1 flex flex-col gap-2">
          <code>surface-1</code>
          <div class="surface-2 flex flex-col gap-2">
            <code>surface-2</code>
            <div class="surface-3 flex flex-col gap-2">
              <code>surface-3</code>
              <div class="surface-4 flex flex-col gap-2">
                <code>surface-4</code>
                <div class="surface-5 flex flex-col gap-2">
                  <code>surface-5</code>
                  <div class="surface-6">
                    <code>surface-6</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Example>
      <small>
        Surfaces have no border. Add <code>surface-border</code> when a box needs a drawn edge: on its own for a box
        flush with the page, or next to a <code>surface-N</code>.
      </small>
      <Example code={'<div class="surface-border">...</div>\n<div class="surface-2 surface-border">...</div>'}>
        <div class="surface-border w-40">
          <code>surface-border</code>
        </div>
        <div class="surface-2 surface-border w-56">
          <code>surface-2 surface-border</code>
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
    <section class="flex flex-col gap-2">
      <h2>Buttons</h2>
      <small>
        Emphasis goes filled, then outlined, then plain. Use one filled button per group, for the main action.
        Use outlined for a colored secondary action such as an inline delete. Everything else, including Cancel,
        is a plain <code>&lt;button&gt;</code>.
      </small>
      <Example
        code={`<button class="btn-success">Save</button>
<button class="btn-outlined-error">Delete</button>
<button>Cancel</button>`}
      >
        <button class="btn-success">Save</button>
        <button class="btn-outlined-error">Delete</button>
        <button>Cancel</button>
      </Example>
      <small>Filled and outlined buttons come in every role.</small>
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
      <h2>Base HTML elements</h2>
      <small>
        This is what plain markup without any classes looks like.
      </small>

      <div class="flex flex-col gap-2">
        <h1>h1 heading</h1>
        <h2>h2 heading</h2>
        <h3>h3 heading</h3>
        <h4>h4 heading</h4>
        <h5>h5 heading</h5>
        <h6>h6 heading</h6>
      </div>

      <p>
        A paragraph with a <a href="#">link</a>, <strong>strong text</strong>, and <small>small print</small>.
        Inline code: <code>c-primary</code>.
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
        <hr />
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

const TYPE_ROWS: Array<[preact.ComponentChildren, string, string]> = [
  [<h1>Page title</h1>, '<h1>', 'One per page. 28px, weight 425.'],
  [<h2>Section or panel</h2>, '<h2>', 'A panel or section title. 22px, weight 425.'],
  [<h3>Group in a panel</h3>, '<h3>', 'A group inside a panel. 18px, weight 500.'],
  [<h4>Small heading</h4>, '<h4>', 'A card or row title. 16px, weight 500.'],
  [<p>Body text</p>, '<p>', 'Everything else. 16px, weight 400.'],
  [<label>Field caption</label>, '<label>', 'The caption above a field. 14px, muted.'],
  [<small>Hint text</small>, '<small>', 'Subtitles, hints, metadata. 14px, muted.'],
  [
    <span>
      Some <strong>emphasis</strong>
    </span>,
    '<strong>',
    'Inline emphasis. Weight 500.',
  ],
];

function TypeSection() {
  return (
    <section class="flex flex-col gap-2">
      <h2>Type</h2>
      <small>
        Plain elements are already styled. Pick the element by meaning; don't add font-weight, text-size or text-color
        utilities to restyle it.
      </small>
      <div class="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Looks like</th>
              <th>Element</th>
              <th>Use</th>
            </tr>
          </thead>
          <tbody>
            {TYPE_ROWS.map(([demo, el, use]) => (
              <tr key={el}>
                <td>{demo}</td>
                <td>
                  <code>{el}</code>
                </td>
                <td>{use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const SPACING_ROWS: Array<[string, string, string]> = [
  ['gap-1', '4px', 'Inside one control: a caption and its input, an icon and its text.'],
  ['gap-2', '8px', 'Between related fields, rows or buttons.'],
  ['gap-4', '16px', 'Between sections or panels.'],
  ['p-3', '12px', 'Container padding (built into surface-N).'],
  ['px-4', '16px', 'Page margin.'],
];

function SpacingSection() {
  return (
    <section class="flex flex-col gap-2">
      <h2>Spacing</h2>
      <small>
        Spacing comes from <code>gap</code> on the parent (<code>flex flex-col gap-2</code>), not margins on the
        children. Headings, paragraphs and <code>hr</code> have no margin.
      </small>
      <div class="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Class</th>
              <th>Size</th>
              <th>Use</th>
            </tr>
          </thead>
          <tbody>
            {SPACING_ROWS.map(([cls, size, use]) => (
              <tr key={cls}>
                <td>
                  <code>{cls}</code>
                </td>
                <td>{size}</td>
                <td>{use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FormsSection() {
  return (
    <section class="flex flex-col gap-2">
      <h2>Forms</h2>
      <small>
        A field is a <code>&lt;label&gt;</code> wrapping its caption and input. A checkbox or radio label reads as body
        text.
      </small>
      <Example
        code={`<div class="surface-1 flex flex-col gap-2">
  <label class="flex flex-col gap-1">
    Note
    <textarea rows={2} placeholder="Optional" />
  </label>
  <label class="flex items-center gap-2">
    <input type="checkbox" /> Beeps
  </label>
</div>`}
      >
        <div class="surface-1 flex w-full max-w-md flex-col gap-2">
          <label class="flex flex-col gap-1">
            Note
            <textarea rows={2} placeholder="Optional" />
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" /> Beeps
          </label>
        </div>
      </Example>
    </section>
  );
}

export function ReferencePage() {
  return (
    <div class="flex flex-col gap-4 max-w-5xl mx-auto">
      <div>
        <h1>Reference</h1>
        <small>ponkotsu-css reference.</small>
      </div>
      <TypeSection />
      <SpacingSection />
      <FormsSection />
      <ButtonsSection />
      <InteractionColorsSection />
      <ContainerColorsSection />
      <SurfacesSection />
      <ColorsSection />
      <BaseElementsSection />
    </div>
  );
}
