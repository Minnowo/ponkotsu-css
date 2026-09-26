import {useState} from 'preact/hooks';
import {CategoricalPieChart} from './controls';

const NAV_ITEMS = [
  {id: 'dashboard', label: 'Dashboard'},
  {id: 'settings', label: 'Settings'},
] as const;
type NavId = (typeof NAV_ITEMS)[number]['id'];

function NavLinks({active, onSelect, class: className}: {active: NavId; onSelect: (id: NavId) => void; class?: string}) {
  return (
    <nav class={`flex gap-1 ${className ?? ''}`}>
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
      <div class="surface-1 flex w-full max-w-sm flex-col gap-3">
        <h3 class="mb-0">Add meal</h3>
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
        <div class="flex justify-end gap-2 mt-2">
          <button class="btn-outlined" onClick={onCancel}>
            Cancel
          </button>
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
          <p class="text-c-on-surface-variant mb-0">Here's how today went.</p>
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
            <h4 class="mb-0">Meal saved successfully</h4>
            <p class="text-sm mb-0 text-c-on-surface-variant">Your weekly meal plan is ready.</p>
          </div>
          <div class="flex gap-2">
            <button class="btn-outlined" onClick={() => setDismissedSuccess(true)}>
              Dismiss
            </button>
            <button class="btn-success">View meal plan</button>
          </div>
        </div>
      )}

      <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div class="surface-1">
          <span class="text-c-on-surface-variant text-xs">Calories today</span>
          <p class="text-2xl font-semibold mb-1">1,570 / 2,200</p>
          <div class="h-2 rounded-full bg-c-surface-container-3 overflow-hidden">
            <div class="h-full rounded-full bg-c-primary" style={{width: '71%'}} />
          </div>
        </div>
        <div class="surface-1">
          <span class="text-c-on-surface-variant text-xs">Water intake</span>
          <p class="text-2xl font-semibold mb-1">5 / 8 cups</p>
          <div class="h-2 rounded-full bg-c-surface-container-3 overflow-hidden">
            <div class="h-full rounded-full bg-c-secondary" style={{width: '62%'}} />
          </div>
        </div>
        <div class="surface-1 flex items-center gap-3">
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

      <div class="surface-1">
        <h3>Today's meals</h3>
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
        <p class="text-sm text-c-on-surface-variant mb-0">
          Need help logging a meal? <a href="#">Read the guide</a>.
        </p>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div class="flex flex-col gap-4">
      <div>
        <h2>Settings</h2>
        <p class="text-c-on-surface-variant mb-0">Manage your profile and preferences.</p>
      </div>

      <div class="surface-1 flex flex-col gap-3">
        <h3>Profile</h3>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          <h4 class="mb-0">Notifications</h4>
          <label class="flex flex-row items-center gap-2 text-sm font-normal">
            <input type="checkbox" defaultChecked />
            Daily meal reminder
          </label>
          <div class="surface-3 flex items-center justify-between gap-4">
            <label class="text-sm font-normal" for="reminder-time">
              ...at a custom time
            </label>
            <input id="reminder-time" type="time" defaultValue="09:00" />
          </div>
          <label class="flex flex-row items-center gap-2 text-sm font-normal">
            <input type="checkbox" />
            Weekly summary email
          </label>
          <label class="flex flex-row items-center gap-2 text-sm font-normal">
            <input type="checkbox" disabled />
            Sync to watch (unavailable)
          </label>
        </div>

        <div class="flex justify-end gap-2">
          <button class="btn-outlined">Cancel</button>
          <button class="btn-primary">Save changes</button>
        </div>
      </div>

      <div class="surface-outlined flex flex-col gap-2">
        <span class="font-medium text-c-error">Danger zone</span>
        <p class="text-sm mb-0">Deleting your account removes all logged meals and goals permanently.</p>
        <button class="btn-outlined-error self-start">Delete account</button>
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

      <main class="flex-1 min-w-0">{nav === 'dashboard' ? <DashboardView /> : <SettingsView />}</main>
    </div>
  );
}
