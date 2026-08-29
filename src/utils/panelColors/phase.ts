export type Phase = "A" | "B" | "C" | "L1" | "L2";

export type ConductorColor = {
  hex: string;
  name: string;
  textHex: string;
};

export type PanelColorScheme = {
  colors: Partial<Record<Phase, ConductorColor>> & {
    ground: ConductorColor;
    neutral: ConductorColor;
  };
  configurationLabel: string;
  id: string;
  isBuiltIn: boolean;
  isQuickChoice: boolean;
  name: string;
  phaseOrder: Phase[];
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
    isQuickChoice: true,
    name: "Black • Red • Blue",
    voltageSystem: "208Y/120V",
    configurationLabel: "3Ø wye • Standard branch panel",
    phaseOrder: ["A", "B", "C"],
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
    isQuickChoice: true,
    name: "Brown • Orange • Yellow",
    voltageSystem: "480Y/277V",
    configurationLabel: "3Ø wye • Standard branch panel",
    phaseOrder: ["A", "B", "C"],
    colors: {
      A: makeConductorColor("Brown"),
      B: makeConductorColor("Orange"),
      C: makeConductorColor("Yellow"),
      neutral: makeConductorColor("Gray"),
      ground: makeConductorColor("Green / Bare"),
    },
  },
  {
    id: "standard-120-240",
    isBuiltIn: true,
    isQuickChoice: true,
    name: "Black • Red",
    voltageSystem: "120/240V",
    configurationLabel: "1Ø split-phase • Standard branch panel",
    phaseOrder: ["L1", "L2"],
    colors: {
      L1: makeConductorColor("Black"),
      L2: makeConductorColor("Red"),
      neutral: makeConductorColor("White"),
      ground: makeConductorColor("Green / Bare"),
    },
  },
];

/**
 * Common branch panels number odd circuits down the left and even circuits
 * down the right. Both positions in a row land on the same bus, then rows
 * advance through A-B-C (three phase) or L1-L2 (split phase).
 */
export function getPhaseForCircuit(
  circuit: number,
  scheme: PanelColorScheme = BUILT_IN_PANEL_SCHEMES[0],
): Phase {
  if (!Number.isInteger(circuit) || circuit < 1) {
    throw new RangeError("Circuit must be a positive whole number.");
  }
  if (scheme.phaseOrder.length < 1) {
    throw new RangeError("Panel scheme must contain at least one phase or leg.");
  }

  const rowIndex = Math.floor((circuit - 1) / 2);
  return scheme.phaseOrder[rowIndex % scheme.phaseOrder.length];
}

export function getColorForPhase(
  scheme: PanelColorScheme,
  phase: Phase,
): ConductorColor {
  const color = scheme.colors[phase];
  if (!color) {
    throw new RangeError(`No conductor color is configured for ${phase}.`);
  }
  return color;
}

export function getPhaseDisplayName(phase: Phase): string {
  return phase === "L1" || phase === "L2" ? `Leg ${phase}` : `Phase ${phase}`;
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
    const phase = getPhaseForCircuit(current, scheme);
    nearby.push({
      circuit: current,
      phase,
      color: getColorForPhase(scheme, phase),
    });
  }

  return nearby;
}
