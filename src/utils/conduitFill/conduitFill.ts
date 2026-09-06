export type ConduitType = "emt" | "pvc40" | "rmc" | "imc" | "pvc80";

export type ConduitSize =
  | "1/2"
  | "3/4"
  | "1"
  | "1-1/4"
  | "1-1/2"
  | "2"
  | "2-1/2"
  | "3"
  | "3-1/2"
  | "4";

export type WireSize =
  | "14"
  | "12"
  | "10"
  | "8"
  | "6"
  | "4"
  | "3"
  | "2"
  | "1"
  | "1/0"
  | "2/0"
  | "3/0"
  | "4/0"
  | "250"
  | "300"
  | "350"
  | "400"
  | "500";

export type WireEntry = {
  quantity: number;
  size: WireSize;
};

export const CONDUIT_LABELS: Record<ConduitType, string> = {
  emt: "EMT",
  pvc40: "PVC Sch. 40",
  rmc: "RMC",
  imc: "IMC",
  pvc80: "PVC Sch. 80",
};

export const CONDUIT_SIZES: ConduitSize[] = [
  "1/2",
  "3/4",
  "1",
  "1-1/4",
  "1-1/2",
  "2",
  "2-1/2",
  "3",
  "3-1/2",
  "4",
];

export const WIRE_SIZES: WireSize[] = [
  "14",
  "12",
  "10",
  "8",
  "6",
  "4",
  "3",
  "2",
  "1",
  "1/0",
  "2/0",
  "3/0",
  "4/0",
  "250",
  "300",
  "350",
  "400",
  "500",
];

// NEC Chapter 9, Table 4 total internal areas in square inches.
const CONDUIT_AREAS: Record<ConduitType, Record<ConduitSize, number>> = {
  emt: {
    "1/2": 0.304,
    "3/4": 0.533,
    "1": 0.864,
    "1-1/4": 1.496,
    "1-1/2": 2.036,
    "2": 3.356,
    "2-1/2": 5.858,
    "3": 8.846,
    "3-1/2": 11.545,
    "4": 14.753,
  },
  pvc40: {
    "1/2": 0.285,
    "3/4": 0.508,
    "1": 0.832,
    "1-1/4": 1.453,
    "1-1/2": 1.986,
    "2": 3.291,
    "2-1/2": 4.695,
    "3": 7.268,
    "3-1/2": 9.737,
    "4": 12.554,
  },
  rmc: {
    "1/2": 0.314,
    "3/4": 0.549,
    "1": 0.887,
    "1-1/4": 1.526,
    "1-1/2": 2.071,
    "2": 3.408,
    "2-1/2": 4.866,
    "3": 7.499,
    "3-1/2": 10.01,
    "4": 12.882,
  },
  imc: {
    "1/2": 0.342,
    "3/4": 0.586,
    "1": 0.959,
    "1-1/4": 1.647,
    "1-1/2": 2.225,
    "2": 3.63,
    "2-1/2": 5.135,
    "3": 7.922,
    "3-1/2": 10.584,
    "4": 13.631,
  },
  pvc80: {
    "1/2": 0.217,
    "3/4": 0.409,
    "1": 0.688,
    "1-1/4": 1.237,
    "1-1/2": 1.711,
    "2": 2.874,
    "2-1/2": 4.119,
    "3": 6.442,
    "3-1/2": 8.688,
    "4": 11.258,
  },
};

// NEC Chapter 9, Table 5 areas for field-common THHN/THWN-2 conductors.
// Values include the insulation and nylon jacket.
const THHN_AREAS: Record<WireSize, number> = {
  "14": 0.0097,
  "12": 0.0133,
  "10": 0.0211,
  "8": 0.0366,
  "6": 0.0507,
  "4": 0.0824,
  "3": 0.0973,
  "2": 0.1158,
  "1": 0.1562,
  "1/0": 0.1855,
  "2/0": 0.2223,
  "3/0": 0.2679,
  "4/0": 0.3237,
  "250": 0.397,
  "300": 0.4608,
  "350": 0.5242,
  "400": 0.5863,
  "500": 0.7073,
};

export type ConduitFillResult = {
  allowableArea: number;
  conductorCount: number;
  conduitArea: number;
  fillLimitPercent: number;
  fillPercent: number;
  fits: boolean;
  remainingArea: number;
  usedArea: number;
};

export function getFillLimitPercent(conductorCount: number) {
  if (conductorCount <= 0) return 0;
  if (conductorCount === 1) return 53;
  if (conductorCount === 2) return 31;
  return 40;
}

export function calculateConduitFill(
  conduitType: ConduitType,
  conduitSize: ConduitSize,
  wires: WireEntry[],
): ConduitFillResult {
  const normalizedWires = wires.filter(({ quantity }) => quantity > 0);
  const conductorCount = normalizedWires.reduce(
    (sum, { quantity }) => sum + Math.floor(quantity),
    0,
  );
  const usedArea = normalizedWires.reduce(
    (sum, { quantity, size }) => sum + Math.floor(quantity) * THHN_AREAS[size],
    0,
  );
  const conduitArea = CONDUIT_AREAS[conduitType][conduitSize];
  const fillLimitPercent = getFillLimitPercent(conductorCount);
  // Table 4 publishes its square-inch limits to three decimal places.
  const allowableArea = Math.round(
    conduitArea * (fillLimitPercent / 100) * 1000,
  ) / 1000;
  const remainingArea = Math.max(0, allowableArea - usedArea);

  return {
    allowableArea,
    conductorCount,
    conduitArea,
    fillLimitPercent,
    fillPercent: conduitArea ? (usedArea / conduitArea) * 100 : 0,
    fits: conductorCount > 0 && usedArea <= allowableArea,
    remainingArea,
    usedArea,
  };
}

export function findMinimumConduitSize(
  conduitType: ConduitType,
  wires: WireEntry[],
) {
  return CONDUIT_SIZES.find(
    (size) => calculateConduitFill(conduitType, size, wires).fits,
  ) ?? null;
}

export function getMaxAdditionalConductors(
  conduitType: ConduitType,
  conduitSize: ConduitSize,
  wires: WireEntry[],
  additionalSize: WireSize,
) {
  let additional = 0;

  while (additional < 1000) {
    const candidate = [
      ...wires,
      { quantity: additional + 1, size: additionalSize },
    ];
    if (!calculateConduitFill(conduitType, conduitSize, candidate).fits) break;
    additional += 1;
  }

  return additional;
}
