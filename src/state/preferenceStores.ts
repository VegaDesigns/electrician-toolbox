import { loadMaterialLists, saveMaterialLists } from "../utils/storage/materialListsStorage";
import { createPersistentStore } from "../utils/storage/persistentStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decodeBenderSetup, defaultBenderSetup } from "../utils/bending/setup";
import { DEFAULT_WORKPAD_PREFERENCES, loadWorkpadPreferences, saveWorkpadPreferences } from "../utils/storage/preferences";
import { DEFAULT_WIRE_GUIDE_PREFERENCES, loadWireGuidePreferences, saveWireGuidePreferences } from "../utils/storage/wireGuidePreferences";
import { DEFAULT_TRADE_TALK_PREFERENCES, loadTradeTalkPreferences, saveTradeTalkPreferences } from "../utils/storage/tradeTalkPreferences";

export const workpadPreferences = createPersistentStore(loadWorkpadPreferences, saveWorkpadPreferences, DEFAULT_WORKPAD_PREFERENCES);
export const wireGuidePreferences = createPersistentStore(loadWireGuidePreferences, saveWireGuidePreferences, DEFAULT_WIRE_GUIDE_PREFERENCES);
export const tradeTalkPreferences = createPersistentStore(loadTradeTalkPreferences, saveTradeTalkPreferences, DEFAULT_TRADE_TALK_PREFERENCES);
export const benderPreferences = createPersistentStore(async () => {
  const raw = await AsyncStorage.getItem("bending-suite-v1");
  return raw === null ? defaultBenderSetup() : decodeBenderSetup(raw);
}, async value => { await AsyncStorage.setItem("bending-suite-v1", JSON.stringify(value)); }, defaultBenderSetup());

export const materialListsStore = createPersistentStore(loadMaterialLists, saveMaterialLists, { lists: [] });
