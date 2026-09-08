import AsyncStorage from "@react-native-async-storage/async-storage";
import { decodeLists, type MaterialLists } from "../jobBoard/materialLists";

// Separate from the earlier board: never overwrite or migrate its saved work.
const KEY = "electrician-toolbox:material-lists:v1";
export async function loadMaterialLists(): Promise<MaterialLists> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw === null ? { lists: [] } : decodeLists(raw);
}
export async function saveMaterialLists(data: MaterialLists): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}
