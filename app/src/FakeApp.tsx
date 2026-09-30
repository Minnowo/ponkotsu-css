import {useState} from 'preact/hooks';
import {CategoricalPieChart} from './controls';

const NAV_ITEMS = [
  {id: 'dashboard', label: 'Dashboard'},
  {id: 'workout', label: 'Workout'},
  {id: 'tags', label: 'Tags'},
  {id: 'settings', label: 'Settings'},
] as const;
type NavId = (typeof NAV_ITEMS)[number]['id'];

function NavLinks({active, onSelect, class: className}: {active: NavId; onSelect: (id: NavId) => void; class?: string}) {
  return (
    <nav class={`flex flex-wrap gap-1 ${className ?? ''}`}>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          class={active === item.id ? 'btn-primary' : 'btn-outlined'}
          onClick={() => onSelect(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

type Meal = {name: string; time: string; calories: number; tag: string; tagColor: string};
const TODAYS_MEALS: Meal[] = [
  {name: 'Oatmeal & berries', time: '7:30 AM', calories: 320, tag: 'Breakfast', tagColor: 'yellow'},
  {name: 'Grilled chicken salad', time: '12:15 PM', calories: 480, tag: 'Lunch', tagColor: 'green'},
  {name: 'Apple + almonds', time: '3:00 PM', calories: 210, tag: 'Snack', tagColor: 'pink'},
  {name: 'Salmon & rice', time: '6:45 PM', calories: 560, tag: 'Dinner', tagColor: 'blue'},
];

function TagPill({name, color}: {name: string; color: string}) {
  return (
    <span
      class="rounded-full px-2 py-0.5 text-xs font-medium"
      style={{background: `var(--color-c-${color})`, color: `var(--color-c-on-${color})`}}
    >
      {name}
    </span>
  );
}

const MACROS = [
  {label: 'Protein', color: 'blue', grams: 92},
  {label: 'Carbs', color: 'yellow', grams: 210},
  {label: 'Fat', color: 'pink', grams: 58},
];

const MEAL_TAG_COLORS: Record<string, string> = {
  Breakfast: 'yellow',
  Lunch: 'green',
  Snack: 'pink',
  Dinner: 'blue',
};

function AddMealDialog({onCancel, onSave}: {onCancel: () => void; onSave: (meal: Meal) => void}) {
  const [name, setName] = useState('');
  const [tag, setTag] = useState('Breakfast');
  const [calories, setCalories] = useState(300);

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="surface-1 flex w-full max-w-sm flex-col gap-2">
        <h3>Add meal</h3>
        <label class="flex flex-col gap-1">
          Name
          <input
            type="text"
            placeholder="e.g. Greek yogurt"
            value={name}
            onInput={(e) => setName((e.target as HTMLInputElement).value)}
          />
        </label>
        <label class="flex flex-col gap-1">
          Meal type
          <select value={tag} onChange={(e) => setTag((e.target as HTMLSelectElement).value)}>
            {Object.keys(MEAL_TAG_COLORS).map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label class="flex flex-col gap-1">
          Calories
          <input
            type="number"
            min={0}
            value={calories}
            onInput={(e) => setCalories(Number((e.target as HTMLInputElement).value))}
          />
        </label>
        <div class="flex justify-end gap-2 pt-2">
          <button onClick={onCancel}>Cancel</button>
          <button
            class="btn-primary"
            disabled={name.trim() === ''}
            onClick={() =>
              onSave({
                name,
                time: 'Just now',
                calories,
                tag,
                tagColor: MEAL_TAG_COLORS[tag],
              })
            }
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardView() {
  const [dismissedSuccess, setDismissedSuccess] = useState(false);
  const [meals, setMeals] = useState(TODAYS_MEALS);
  const [addingMeal, setAddingMeal] = useState(false);

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2>Good evening, Sam</h2>
          <small>Here's how today went.</small>
        </div>
        <button class="btn-primary" onClick={() => setAddingMeal(true)}>
          + Add meal
        </button>
      </div>

      {addingMeal && (
        <AddMealDialog
          onCancel={() => setAddingMeal(false)}
          onSave={(meal) => {
            setMeals((prev) => [...prev, meal]);
            setAddingMeal(false);
          }}
        />
      )}

      {!dismissedSuccess && (
        <div class="surface-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4>Meal saved successfully</h4>
            <small>Your weekly meal plan is ready.</small>
          </div>
          <div class="flex gap-2">
            <button onClick={() => setDismissedSuccess(true)}>Dismiss</button>
            <button class="btn-success">View meal plan</button>
          </div>
        </div>
      )}

      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div class="surface-1 flex flex-col gap-1">
          <small>Calories today</small>
          <p class="text-2xl">1,570 / 2,200</p>
          <div class="h-2 rounded-full bg-c-surface-container-3 overflow-hidden">
            <div class="h-full rounded-full bg-c-yellow" style={{width: '71%'}} />
          </div>
        </div>
        <div class="surface-1 flex flex-col gap-1">
          <small>Water intake</small>
          <p class="text-2xl">5 / 8 cups</p>
          <div class="h-2 rounded-full bg-c-surface-container-3 overflow-hidden">
            <div class="h-full rounded-full bg-c-blue" style={{width: '62%'}} />
          </div>
        </div>
        <div class="surface-1 flex flex-wrap items-center gap-3">
          <CategoricalPieChart names={MACROS.map((m) => m.color)} />
          <div class="flex flex-col gap-1 text-sm">
            {MACROS.map((m) => (
              <div key={m.label} class="flex items-center gap-2">
                <span
                  class="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{background: `var(--color-c-${m.color})`}}
                />
                <span>
                  {m.label} - {m.grams}g
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div class="rounded-md p-3 bg-c-primary-container text-c-on-primary-container">
        <strong>Tip:</strong> log a food once and reuse it from your recent items next time.
      </div>

      <div class="surface-1 flex flex-col gap-2">
        <h3>Today's meals</h3>
        <div class="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Meal</th>
                <th>Time</th>
                <th>Calories</th>
                <th>Tag</th>
              </tr>
            </thead>
            <tbody>
              {meals.map((meal) => (
                <tr key={meal.name}>
                  <td>{meal.name}</td>
                  <td>{meal.time}</td>
                  <td>{meal.calories}</td>
                  <td>
                    <TagPill name={meal.tag} color={meal.tagColor} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <small>
          Need help logging a meal? <a href="#">Read the guide</a>.
        </small>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div class="flex flex-col gap-4">
      <div>
        <h2>Settings</h2>
        <small>Manage your profile and preferences.</small>
      </div>

      <div class="surface-1 flex flex-col gap-4">
        <h3>Profile</h3>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label class="flex flex-col gap-1">
            Display name
            <input type="text" defaultValue="Sam" />
          </label>
          <label class="flex flex-col gap-1">
            Units
            <select>
              <option>Metric</option>
              <option>Imperial</option>
            </select>
          </label>
          <label class="flex flex-col gap-1">
            Daily calorie goal
            <input type="number" min={0} defaultValue={2200} />
          </label>
          <label class="flex flex-col gap-1">
            Linked device
            <input type="text" defaultValue="Not connected" disabled />
          </label>
        </div>

        <div class="surface-2 flex flex-col gap-2">
          <h4>Notifications</h4>
          <label class="flex flex-row items-center gap-2">
            <input type="checkbox" defaultChecked />
            Daily meal reminder
          </label>
          <div class="surface-3 flex items-center justify-between gap-4">
            <label for="reminder-time">
              ...at a custom time
            </label>
            <input id="reminder-time" type="time" defaultValue="09:00" />
          </div>
          <label class="flex flex-row items-center gap-2">
            <input type="checkbox" />
            Weekly summary email
          </label>
          <label class="flex flex-row items-center gap-2">
            <input type="checkbox" disabled />
            Sync to watch (unavailable)
          </label>
        </div>

        <div class="flex justify-end gap-2">
          <button>Cancel</button>
          <button class="btn-primary">Save changes</button>
        </div>
      </div>

      <div class="surface-border flex flex-col gap-2">
        <h4 class="text-c-error">Danger zone</h4>
        <p>Deleting your account removes all logged meals and goals permanently.</p>
        <button class="btn-outlined-error self-start">Delete account</button>
      </div>
    </div>
  );
}

type Step = {exercise: string; kind: string; target: number};
type WorkoutSet = {name: string; rounds: number; steps: Step[]};

const STEP_KINDS = ['Timed', 'Reps'];

function WorkoutView() {
  const [sets, setSets] = useState<WorkoutSet[]>([
    {
      name: 'Warm up',
      rounds: 1,
      steps: [
        {exercise: 'Jumping jacks', kind: 'Timed', target: 60},
        {exercise: 'Rest', kind: 'Timed', target: 15},
      ],
    },
    {
      name: 'Tabata',
      rounds: 8,
      steps: [
        {exercise: 'Burpees', kind: 'Timed', target: 20},
        {exercise: 'Rest', kind: 'Timed', target: 10},
      ],
    },
  ]);

  const removeStep = (setIdx: number, stepIdx: number) =>
    setSets((ss) => ss.map((s, i) => (i === setIdx ? {...s, steps: s.steps.filter((_, j) => j !== stepIdx)} : s)));

  return (
    <div class="flex flex-col gap-4">
      <div>
        <h2>New workout</h2>
        <small>A workout is a list of sets. Each set repeats its steps for its number of rounds.</small>
      </div>

      <div class="surface-1 flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="flex flex-col gap-1">
            Name
            <input type="text" placeholder="e.g. Leg day" />
          </label>
          <label class="flex flex-col gap-1">
            Note
            <textarea rows={2} placeholder="Optional" />
          </label>
          <div class="flex flex-col gap-1">
            <label>Sounds</label>
            <label class="flex flex-row items-center gap-2">
              <input type="checkbox" defaultChecked />
              Beeps
            </label>
            <label class="flex flex-row items-center gap-2">
              <input type="checkbox" />
              Say each exercise as it starts
            </label>
          </div>
        </div>

        {sets.map((set, setIdx) => (
          <div key={setIdx} class="surface-2 flex flex-col gap-4">
            <div class="flex flex-wrap items-end gap-2">
              <label class="flex flex-1 flex-col gap-1">
                Set name
                <input type="text" defaultValue={set.name} />
              </label>
              <label class="flex w-24 flex-col gap-1">
                Rounds
                <input type="number" min={1} defaultValue={set.rounds} />
              </label>
            </div>

            <div class="flex flex-col gap-2">
              {set.steps.map((step, stepIdx) => (
                <div key={stepIdx} class="flex flex-wrap items-center gap-2">
                  <span class="flex-1">{step.exercise}</span>
                  <select aria-label="Step kind" defaultValue={step.kind}>
                    {STEP_KINDS.map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                  <input class="w-20" type="number" aria-label="Seconds" defaultValue={step.target} />
                  <button class="btn-outlined-error" onClick={() => removeStep(setIdx, stepIdx)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <label class="flex flex-col gap-1">
              Add exercise
              <input type="text" placeholder="Search exercises" />
            </label>
            <div class="flex justify-end gap-2">
              <button>Duplicate set</button>
              <button class="btn-outlined-error" onClick={() => setSets((ss) => ss.filter((_, i) => i !== setIdx))}>
                Delete set
              </button>
            </div>
          </div>
        ))}

        <button class="self-start" onClick={() => setSets((ss) => [...ss, {name: '', rounds: 1, steps: []}])}>
          Add set
        </button>

        <div class="flex items-center justify-end gap-2">
          <small class="mr-auto">{sets.reduce((n, s) => n + s.rounds * s.steps.length, 0)} steps</small>
          <button>Cancel</button>
          <button class="btn-success">Save</button>
        </div>
      </div>
    </div>
  );
}

const COLOR_VARS = ['pink', 'red', 'yellow', 'green', 'blue'].flatMap((n) => [
  `--color-c-${n}`,
  `--color-c-l-${n}`,
  `--color-c-d-${n}`,
]);

const DEMO_TAGS = [
  'work:development',
  'work:meetings',
  'project:karopon',
  'project:ponkotsu',
  'issue:312',
  'cardio:jumping_jack',
  'cardio:running',
  'workout:leg_day',
];

const DEMO_TAG_COLORS: Record<string, string> = {
  work: '--color-c-blue',
  project: '--color-c-d-green',
  issue: '--color-c-red',
  cardio: '--color-c-l-yellow',
  workout: '--color-c-pink',
};

const reColorHex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const reColorCSSVar = /^--[a-zA-Z][a-zA-Z0-9-]*$/;
const isValidColor = (v: string) => v.length > 0 && (reColorHex.test(v) || reColorCSSVar.test(v));

const fmtTagColor = (v: string) => (v.startsWith('-') ? `var(${v})` : v);

// Mirrors karopon's TagChip: a theme color gets its on-* pair as text.
function TagChip({tag, color}: {tag: string; color?: string}) {
  const bg = color && isValidColor(color) ? fmtTagColor(color) : 'var(--color-c-pink)';
  const role = bg.match(/^var\(--color-c-([\w-]+)\)$/)?.[1];
  const text = role ? `var(--color-c-on-${role})` : undefined;
  return (
    <span class="flex items-center min-h-8 rounded w-fit px-3" style={{backgroundColor: bg, color: text}}>
      {tag}
    </span>
  );
}

function TagsView() {
  const [colors, setColors] = useState<Record<string, string>>(DEMO_TAG_COLORS);
  const [showColors, setShowColors] = useState(true);
  const [search, setSearch] = useState('');
  const namespaces = Object.keys(DEMO_TAG_COLORS);
  const shown = DEMO_TAGS.filter((t) => t.includes(search.trim()));

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap justify-evenly gap-2">
        <button>New Tag</button>
        <button disabled={showColors} onClick={() => setShowColors(true)}>
          Tag Colors
        </button>
      </div>

      {showColors && (
        <div class="surface-1 flex flex-col gap-2">
          <details class="w-full">
            <summary class="cursor-pointer">
              <h2 class="inline">Tag Colors</h2>
              <small> (click for help)</small>
            </summary>
            <div class="flex flex-col gap-2 pt-2">
              <p>
                Assign a color to each namespace. Accepts hex (<code>#rgb</code>, <code>#rrggbb</code>) or a CSS
                variable name (<code>--xyz</code>). Leave empty to remove a color.
              </p>
              <p>Below are the variable names available, the colors change with the color theme.</p>
              <ul class="flex flex-col gap-2">
                {COLOR_VARS.map((v) => (
                  <li key={v} class="flex items-center gap-2">
                    <span class="w-6 h-6 rounded" style={{background: `var(${v})`}} />
                    <code>{v}</code>
                  </li>
                ))}
              </ul>
            </div>
          </details>

          {namespaces.map((ns) => {
            const value = colors[ns] ?? '';
            const invalid = value.trim() !== '' && !isValidColor(value.trim());
            return (
              <div key={ns} class="flex flex-wrap justify-between items-center gap-2">
                <div class="flex items-center gap-2 min-w-0">
                  <span
                    class="w-6 h-6 rounded flex-shrink-0"
                    style={{backgroundColor: invalid ? 'transparent' : fmtTagColor(value.trim())}}
                  />
                  <code class="break-all">{ns}</code>
                </div>
                <div class="flex flex-col gap-1 min-w-40">
                  <input
                    type="text"
                    class="w-64 font-mono"
                    placeholder="#rrggbb or --name"
                    aria-label={`Color for ${ns}`}
                    value={value}
                    onInput={(e) => setColors((c) => ({...c, [ns]: (e.target as HTMLInputElement).value}))}
                  />
                  {invalid && <small class="text-c-error">Must be #rgb, #rrggbb, or --name</small>}
                </div>
              </div>
            );
          })}

          <div class="flex gap-2 justify-end">
            <button onClick={() => setShowColors(false)}>Cancel</button>
            <button class="btn-success" onClick={() => setShowColors(false)}>
              Save
            </button>
          </div>
        </div>
      )}

      <input
        type="text"
        placeholder="Search tags..."
        aria-label="Search tags"
        value={search}
        onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
      />

      <div class="flex flex-col gap-2">
        {shown.length === 0 ? (
          <p>No tags match your search.</p>
        ) : (
          shown.map((t) => (
            <div key={t} class="surface-1 flex items-center gap-2">
              <div class="flex-1">
                <TagChip tag={t} color={colors[t.split(':')[0]]?.trim()} />
              </div>
              <button>Edit</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function FakeApp() {
  const [nav, setNav] = useState<NavId>('dashboard');

  return (
    <div class="flex flex-col md:flex-row gap-4 max-w-5xl mx-auto">
      {/* Desktop: sidebar. Mobile: collapses into a horizontal tab bar. */}
      <aside class="surface-1 flex flex-row md:flex-col gap-2 md:w-48 md:flex-shrink-0">
        <h3 class="hidden md:block">Meal Planner</h3>
        <NavLinks active={nav} onSelect={setNav} class="flex-row md:flex-col" />
      </aside>

      <main class="flex-1 min-w-0">
        {nav === 'dashboard' && <DashboardView />}
        {nav === 'workout' && <WorkoutView />}
        {nav === 'tags' && <TagsView />}
        {nav === 'settings' && <SettingsView />}
      </main>
    </div>
  );
}
