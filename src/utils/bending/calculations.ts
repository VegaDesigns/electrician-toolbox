export const BEND_ANGLES = [10, 15, 22.5, 30, 45, 60] as const;

export type BendAngle = (typeof BEND_ANGLES)[number];

const OFFSET_TABLE: Record<BendAngle, { multiplier: number; shrinkPerInch: number }> = {
  10: { multiplier: 6, shrinkPerInch: 1 / 16 },
  15: { multiplier: 3.86, shrinkPerInch: 1 / 8 },
  22.5: { multiplier: 2.6, shrinkPerInch: 3 / 16 },
  30: { multiplier: 2, shrinkPerInch: 1 / 4 },
  45: { multiplier: 1.4, shrinkPerInch: 3 / 8 },
  60: { multiplier: 1.2, shrinkPerInch: 1 / 2 },
};

export type OffsetResult = {
  multiplier: number;
  shrink: number;
  spacing: number;
};

export type RollingOffsetResult = OffsetResult & {
  trueOffset: number;
};

export type TowardObstructionMarks = {
  firstMark: number;
  secondMark: number;
};

export type StubResult = {
  mark: number;
};

export type ThreePointSaddleResult = {
  centerMark: number;
  firstMark: number;
  thirdMark: number;
  outsideSpacing: number;
  shrink: number;
};

export type FourPointSaddleResult = {
  firstToSecond: number;
  secondToThird: number;
  thirdToFourth: number;
  totalLayout: number;
  totalShrink: number;
};

export function calculateOffset(
  height: number,
  angle: BendAngle,
): OffsetResult {
  const { multiplier, shrinkPerInch } = OFFSET_TABLE[angle];

  return {
    multiplier,
    spacing: height * multiplier,
    shrink: height * shrinkPerInch,
  };
}

export function calculateRollingOffset(
  rise: number,
  roll: number,
  angle: BendAngle,
): RollingOffsetResult {
  const trueOffset = Math.hypot(rise, roll);
  const offset = calculateOffset(trueOffset, angle);

  return { trueOffset, ...offset };
}

export function calculateTowardObstructionMarks(
  targetDistance: number,
  offset: OffsetResult,
): TowardObstructionMarks | null {
  const secondMark = targetDistance + offset.shrink;
  const firstMark = secondMark - offset.spacing;

  if (firstMark <= 0) return null;
  return { firstMark, secondMark };
}

export function calculateStub(stubHeight: number, deduct: number): StubResult {
  return { mark: stubHeight - deduct };
}

/**
 * Standard hand-bending layout for a 45-degree center bend with two
 * 22.5-degree outside bends. The 2.5 multiplier and 3/16-in-per-inch
 * shrink allowance are the familiar field layout values.
 */
export function calculateThreePointSaddle(
  height: number,
  centerDistance: number,
): ThreePointSaddleResult {
  const outsideSpacing = height * 2.5;
  const shrink = height * (3 / 16);
  const centerMark = centerDistance + shrink;

  return {
    centerMark,
    firstMark: centerMark - outsideSpacing,
    thirdMark: centerMark + outsideSpacing,
    outsideSpacing,
    shrink,
  };
}

export function calculateFourPointSaddle(
  height: number,
  obstacleWidth: number,
  angle: BendAngle,
): FourPointSaddleResult {
  const offset = calculateOffset(height, angle);

  return {
    firstToSecond: offset.spacing,
    secondToThird: obstacleWidth,
    thirdToFourth: offset.spacing,
    totalLayout: offset.spacing * 2 + obstacleWidth,
    totalShrink: offset.shrink * 2,
  };
}

export function isPositiveMeasurement(value: number | null): value is number {
  return value !== null && Number.isFinite(value) && value > 0;
}
