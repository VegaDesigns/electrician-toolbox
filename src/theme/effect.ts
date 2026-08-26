import type { ViewStyle } from "react-native";

type EffectName =
  | "surfaceRaised"
  | "controlRaised"
  | "primaryRaised"
  | "recessed"
  | "pressed";

export const Effects: Record<EffectName, ViewStyle> = {
  surfaceRaised: {
    borderTopColor: "rgba(255, 255, 255, 0.09)",
    borderBottomColor: "rgba(0, 0, 0, 0.70)",
    boxShadow:
      "inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 5px 12px rgba(0, 0, 0, 0.30)",
  },
  controlRaised: {
    borderTopColor: "rgba(255, 255, 255, 0.12)",
    borderBottomColor: "rgba(0, 0, 0, 0.72)",
    boxShadow:
      "inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 3px 7px rgba(0, 0, 0, 0.32)",
  },
  primaryRaised: {
    borderTopColor: "rgba(255, 255, 255, 0.24)",
    borderBottomColor: "rgba(72, 49, 4, 0.90)",
    boxShadow:
      "inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 4px 9px rgba(0, 0, 0, 0.38)",
  },
  recessed: {
    borderTopColor: "rgba(0, 0, 0, 0.65)",
    borderBottomColor: "rgba(255, 255, 255, 0.07)",
    boxShadow:
      "inset 0 2px 5px rgba(0, 0, 0, 0.34), inset 0 -1px 0 rgba(255, 255, 255, 0.035)",
  },
  pressed: {
    boxShadow: "inset 0 3px 7px rgba(0, 0, 0, 0.42)",
  },
};
