export type Phase = "A" | "B" | "C";

export type ConductorColor = {
  hex: string;
  name: string;
  textHex: string;
};

export type PanelColorScheme = {
  colors: Record<Phase | "ground" | "neutral", ConductorColor>;
  id: string;
  isBuiltIn: boolean;
  name: string;
  voltageSystem: string;
};

export const COLOR_HEX_BY_NAME: Record<string, string> = {
  bare: "#B88A5A",
  black: "#14171A",
  blue: "#3277D5",
  brown: "#7A4A2A",
  gray: "#8D969F",
  green: "#29945B",
  orange: "#E06D1B",
  purple: "#8B5BD6",
  red: "#D94A43",
  white: "#F0F1F2",
  yellow: "#E2B728",
};

const LIGHT_COLOR_NAMES = new Set(["white", "yellow"]);

export function makeConductorColor(name: string): ConductorColor {
  const cleanName = name.trim() || "Unspecified";
  const lookupName = cleanName.toLowerCase().split(/[\/\s-]/)[0];

  return {
    hex: COLOR_HEX_BY_NAME[lookupName] ?? "#4D6A86",
    name: cleanName,
    textHex: LIGHT_COLOR_NAMES.has(lookupName) ? "#12161B" : "#F5F7F8",
  };
}

export const BUILT_IN_PANEL_SCHEMES: PanelColorScheme[] = [
  {
    id: "standard-120-208",
    isBuiltIn: true,
    name: "Standard",
    voltageSystem: "120/208V",
    colors: {
      A: makeConductorColor("Black"),
      B: makeConductorColor("Red"),
      C: makeConductorColor("Blue"),
      neutral: makeConductorColor("White"),
      ground: makeConductorColor("Green / Bare"),
    },
  },
  {
    id: "standard-277-480",
    isBuiltIn: true,
    name: "Standard",
    voltageSystem: "277/480V",
    colors: {
      A: makeConductorColor("Brown"),
      B: makeConductorColor("Orange"),
      C: makeConductorColor("Yellow"),
      neutral: makeConductorColor("Gray"),
      ground: makeConductorColor("Green / Bare"),
    },
  },
];

const PHASES: Phase[] = ["A", "B", "C"];

/**
 * This adjacent-pair layout intentionally matches the field example supplied
 * for the feature: 78/79 = A, 80/81 = B, and 82/83 = C. Keeping this in one
 * function lets us add selectable panel layouts without changing the screen.
 */
export function getPhaseForCircuit(circuit: number): Phase {
  if (!Number.isInteger(circuit) || circuit < 1) {
    throw new RangeError("Circuit must be a positive whole number.");
  }

  return PHASES[Math.floor(circuit / 2) % PHASES.length];
}

export type NearbyCircuit = {
  circuit: number;
  color: ConductorColor;
  phase: Phase;
};

export function getNearbyCircuits(
  circuit: number,
  scheme: PanelColorScheme,
  radius = 2,
): NearbyCircuit[] {
  const start = Math.max(1, circuit - radius);
  const end = start + radius * 2;
  const nearby: NearbyCircuit[] = [];

  for (let current = start; current <= end; current += 1) {
    const phase = getPhaseForCircuit(current);
    nearby.push({ circuit: current, phase, color: scheme.colors[phase] });
  }

  return nearby;
}
