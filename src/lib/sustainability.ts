/**
 * A serializable format key, not a function — this data crosses the
 * Server->Client boundary (consumed from Server Components), and RSC can't
 * serialize function props. src/components/animations/ImpactCounter.tsx
 * (a Client Component) maps this key to an actual formatter internally.
 */
export type ImpactMetricFormat = 'count-plus' | 'pounds' | 'millions-pounds';

export interface ImpactMetric {
  /** Real number, not a display string — lets Counter.tsx animate it. */
  value: number;
  label: string;
  format: ImpactMetricFormat;
}

// Placeholder figures — replace with verified sustainability metrics before launch.
// (Display format preserved exactly from the previous string values — this is a
// data-shape change to enable Counter's count-up animation, not a value change.)
export const IMPACT_METRICS: ImpactMetric[] = [
  { value: 48000, label: 'Devices given a second life', format: 'count-plus' },
  { value: 620000, label: 'E-waste kept out of landfills', format: 'pounds' },
  { value: 3200000, label: 'CO2 avoided vs. new manufacturing', format: 'millions-pounds' },
];

export interface RefurbishmentStep {
  title: string;
  description: string;
}

export const REFURBISHMENT_STEPS: RefurbishmentStep[] = [
  {
    title: 'Responsible Sourcing',
    description:
      'Devices are sourced through trusted channels — trade-ins, corporate refresh programs, and certified suppliers — rather than discarded as e-waste.',
  },
  {
    title: 'Multi-Point Inspection',
    description:
      'Every device is tested against a full checklist covering battery health, screen condition, ports, keyboard, and overall functionality.',
  },
  {
    title: 'Honest Grading & Repair',
    description:
      'Devices are repaired where needed and assigned a transparent condition grade (A–D) based on the inspection results — no surprises at checkout.',
  },
  {
    title: 'Quality Certification',
    description:
      'Before shipping, every device is re-verified against its listed grade and backed by a minimum 30-day warranty.',
  },
];
