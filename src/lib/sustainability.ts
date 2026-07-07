export interface ImpactMetric {
  value: string;
  label: string;
}

// Placeholder figures — replace with verified sustainability metrics before launch.
export const IMPACT_METRICS: ImpactMetric[] = [
  { value: '48,000+', label: 'Devices given a second life' },
  { value: '620,000 lbs', label: 'E-waste kept out of landfills' },
  { value: '3.2M lbs', label: 'CO2 avoided vs. new manufacturing' },
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
