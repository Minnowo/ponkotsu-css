import type {JSX} from 'preact';
import {useEffect, useRef, useState} from 'preact/hooks';
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

// Fake x-axis time labels for the 5 sample points - matches the shape of
// Karopon's own multi-line graph output, just with made-up data instead of
// a real query result. Point x positions are computed from the container's
// actual measured width (see useResizeWidth below) rather than a fixed
// viewBox stretched with preserveAspectRatio - stretching a non-uniform
// scale warps circles into ellipses and distorts text, so the geometry is
// recomputed for the real pixel width instead.
const LINE_CHART_TIME_LABELS = ['14:17', '15:41', '17:04', '19:49', '11:53'];
const LINE_CHART_PADDING_LEFT = 40;
// Wider than the left padding - the last point's value label sits to the
// right of it (text-anchor="start"), so it needs room to not run off the
// edge, unlike every other point which only has a small circle there.
const LINE_CHART_PADDING_RIGHT = 90;
const LINE_CHART_TOP_MARGIN = 40;
// Room below the lanes for the x-axis time labels.
const LINE_CHART_BOTTOM_MARGIN = 50;
// Keeps a 5-or-fewer-series chart the same height as before; a chart with
// more series grows taller instead (see lanesHeight below) rather than
// squeezing each lane down to fit a fixed height.
const LINE_CHART_DEFAULT_LANES_HEIGHT = 220;
// Floor on how short a lane is allowed to get - below this a circle and its
// value label start crowding the lane above/below it.
const LINE_CHART_MIN_LANE_HEIGHT = 44;

// Tracks an element's rendered content width via ResizeObserver, so an SVG
// chart can recompute its point positions in real pixels on resize instead
// of relying on viewBox scaling (which distorts circles/text non-uniformly).
function useResizeWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return {ref, width};
}

// Deterministic (not random, not per-name) up/down wobble in [0, 1) for a
// given lane/point pair - a lookup table cycled per lane repeats visibly
// after only a couple of lanes (every 2-4 lines looking the same shape).
// Multiplying the lane index by an irrational-ish constant (the golden
// angle, commonly used for exactly this "don't let a short cycle emerge"
// property - e.g. phyllotaxis) before feeding it through sin() means the
// pattern never lines back up on itself, no matter how many lanes there are.
function laneShape(laneIndex: number, pointIndex: number): number {
  const phase = laneIndex * 2.399963 + pointIndex * 1.618034;
  return (Math.sin(phase) + 1) / 2;
}

export function CategoricalLineChart({names}: {names: string[]}) {
  const {ref, width} = useResizeWidth<HTMLDivElement>(800);
  const pointCount = LINE_CHART_TIME_LABELS.length;
  const pointXs = Array.from(
      {length: pointCount},
      (_, i) => LINE_CHART_PADDING_LEFT +
          (i * (width - LINE_CHART_PADDING_LEFT - LINE_CHART_PADDING_RIGHT)) / (pointCount - 1),
  );

  // Each series gets its own horizontal band ("lane") to plot its shape
  // within, rather than sharing the full height - keeps lines from
  // crossing each other much, since they never leave their own lane. Points
  // are inset within the lane (not edge-to-edge) so adjacent lanes always
  // keep a real gap between them instead of their points ever touching.
  // The chart grows taller (rather than the lanes getting thinner) once
  // there are more series than fit comfortably at the default height.
  const lanesHeight = Math.max(LINE_CHART_DEFAULT_LANES_HEIGHT, names.length * LINE_CHART_MIN_LANE_HEIGHT);
  const chartHeight = LINE_CHART_TOP_MARGIN + lanesHeight + LINE_CHART_BOTTOM_MARGIN;
  const laneHeight = lanesHeight / names.length;
  const laneInset = laneHeight * 0.25;
  const laneUsableHeight = laneHeight - laneInset * 2;
  return (
    <div ref={ref} class="w-full">
      <svg width={width} height={chartHeight} class="surface-2 p-0 text-c-on-surface-variant">
        {names.map((name, laneIndex) => {
          const laneTop = LINE_CHART_TOP_MARGIN + laneIndex * laneHeight + laneInset;
          const points = pointXs.map((x, i) => {
            const shape = laneShape(laneIndex, i);
            return {
              x,
              y: laneTop + shape * laneUsableHeight,
              value: 1 + (names.length - laneIndex) * 10 + shape * 20,
            };
          });
          return (
            <g key={name}>
              <polyline
                fill="none"
                stroke={`var(--color-c-${name})`}
                stroke-width="2"
                points={points.map((p) => `${p.x},${p.y}`).join(' ')}
              />
              {points.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="5" fill={`var(--color-c-${name})`} />
                  <text x={p.x + 5} y={p.y - 5} fill={`var(--color-c-${name})`} class="text-chart-sm" text-anchor="start">
                    {p.value.toFixed(1)}
                  </text>
                </g>
              ))}
            </g>
          );
        })}
        {pointXs.map((x, i) => (
          <text key={i} fill="currentColor" class="text-chart" text-anchor="start" x={x - 5} y={chartHeight - 5}>
            {LINE_CHART_TIME_LABELS[i]}
          </text>
        ))}
      </svg>
    </div>
  );
}
