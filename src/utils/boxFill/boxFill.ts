export type BoxFamily = "four-square" | "four-eleven" | "marked";

export type BoxWireSize = "18" | "16" | "14" | "12" | "10" | "8" | "6";

export type BoxWireRole = "insulated" | "ground";

export type BoxWireEntry = {
  quantity: number;
  role: BoxWireRole;
  size: BoxWireSize;
};

export type StandardBoxOption = {
  depth: string;
  family: Exclude<BoxFamily, "marked">;
  volume: number;
};

export const BOX_WIRE_SIZES: BoxWireSize[] = ["18", "16", "14", "12", "10", "8", "6"];

export const BOX_WIRE_ALLOWANCES: Record<BoxWireSize, number> = {
  "18": 1.5,
  "16": 1.75,
  "14": 2,
  "12": 2.25,
  "10": 2.5,
  "8": 3,
  "6": 5,
};

export const STANDARD_BOXES: Record<Exclude<BoxFamily, "marked">, StandardBoxOption[]> = {
  "four-square": [
    { depth: "1-1/4", family: "four-square", volume: 18 },
    { depth: "1-1/2", family: "four-square", volume: 21 },
    { depth: "2-1/8", family: "four-square", volume: 30.3 },
  ],
  "four-eleven": [
    { depth: "1-1/4", family: "four-eleven", volume: 25.5 },
    { depth: "1-1/2", family: "four-eleven", volume: 29.5 },
    { depth: "2-1/8", family: "four-eleven", volume: 42 },
  ],
};

export type BoxFillBreakdown = {
  clamps: number;
  devices: number;
  grounds: number;
  insulated: number;
};

export type BoxFillResult = {
  availableVolume: number;
  breakdown: BoxFillBreakdown;
  fits: boolean;
  remainingVolume: number;
  requiredVolume: number;
};

function getLargestAllowance(wires: BoxWireEntry[]) {
  return wires.reduce(
    (largest, wire) => Math.max(largest, BOX_WIRE_ALLOWANCES[wire.size]),
    0,
  );
}

export function calculateBoxFill({
  availableVolume,
  deviceCount,
  deviceWireSize,
  hasInternalClamp,
  wires,
}: {
  availableVolume: number;
  deviceCount: number;
  deviceWireSize: BoxWireSize;
  hasInternalClamp: boolean;
  wires: BoxWireEntry[];
}): BoxFillResult {
  const normalizedWires = wires.filter(({ quantity }) => quantity > 0);
  const insulated = normalizedWires
    .filter(({ role }) => role === "insulated")
    .reduce(
      (total, wire) => total + Math.floor(wire.quantity) * BOX_WIRE_ALLOWANCES[wire.size],
      0,
    );
  const groundWires = normalizedWires.filter(({ role }) => role === "ground");
  const groundCount = groundWires.reduce(
    (total, wire) => total + Math.floor(wire.quantity),
    0,
  );
  const groundAllowanceCount = groundCount === 0
    ? 0
    : 1 + Math.max(0, groundCount - 4) * 0.25;
  const grounds = groundAllowanceCount * getLargestAllowance(groundWires);
  const devices = Math.max(0, Math.floor(deviceCount))
    * 2
    * BOX_WIRE_ALLOWANCES[deviceWireSize];
  const clamps = hasInternalClamp ? getLargestAllowance(normalizedWires) : 0;
  const requiredVolume = insulated + grounds + devices + clamps;
  const safeAvailableVolume = Math.max(0, availableVolume || 0);

  return {
    availableVolume: safeAvailableVolume,
    breakdown: { clamps, devices, grounds, insulated },
    fits: safeAvailableVolume > 0 && requiredVolume <= safeAvailableVolume,
    remainingVolume: Math.max(0, safeAvailableVolume - requiredVolume),
    requiredVolume,
  };
}

export function getNextStandardBox(
  requiredVolume: number,
  preferredFamily?: Exclude<BoxFamily, "marked">,
) {
  const options = preferredFamily
    ? STANDARD_BOXES[preferredFamily]
    : Object.values(STANDARD_BOXES).flat();

  return [...options]
    .sort((a, b) => a.volume - b.volume)
    .find(({ volume }) => volume >= requiredVolume) ?? null;
}
