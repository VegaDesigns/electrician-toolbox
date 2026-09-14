import type { ConduitType, ConduitSize, WireSize } from "../utils/conduitFill/conduitFill";
import type { BoxFamily, BoxWireRole, BoxWireSize } from "../utils/boxFill/boxFill";
import { createSessionStore } from "./sessionStore";

type ConduitDraft = {
  conduitType: ConduitType;
  conduitSize: ConduitSize;
  nextRowId: number;
  wires: { id: number; quantity: number; size: WireSize }[];
};
type BoxDraft = {
  boxFamily: BoxFamily;
  depth: string;
  markedVolume: string;
  addOn: "none" | "mud-ring" | "extension";
  addOnVolume: string;
  wires: { id: number; quantity: number; role: BoxWireRole; size: BoxWireSize }[];
  nextRowId: number;
  deviceCount: number;
  deviceWireSize: BoxWireSize;
  hasInternalClamp: boolean;
};
export const conduitDraft = createSessionStore<ConduitDraft>(() => ({
  conduitType: "emt", conduitSize: "3/4", nextRowId: 2,
  wires: [{ id: 1, quantity: 3, size: "12" }],
}));
export const boxDraft = createSessionStore<BoxDraft>(() => ({
  boxFamily: "four-square", depth: "2-1/8", markedVolume: "", addOn: "none", addOnVolume: "",
  wires: [{ id: 1, quantity: 3, role: "insulated", size: "12" }],
  nextRowId: 2, deviceCount: 0, deviceWireSize: "12", hasInternalClamp: false,
}));
