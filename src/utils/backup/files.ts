import { Platform } from "react-native";
import { File, Paths } from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { MAX_BACKUP_BYTES } from "./schema";
import { translate, type Language } from "../../i18n/core";

/** Web gets its own picker so cancel never leaves the app waiting on Expo's unresolved web promise. */
function pickWeb(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json,application/json"; input.style.display = "none";
    let settled = false;
    const finish = (value: string | null, error?: Error) => {
      if (settled) return; settled = true;
      window.removeEventListener("focus", onFocus); input.remove();
      if (error) reject(error); else resolve(value);
    };
    const onFocus = () => { setTimeout(() => { if (!input.files?.length) finish(null); }, 500); };
    input.addEventListener("cancel", () => finish(null));
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) { finish(null); return; }
      if (file.size > MAX_BACKUP_BYTES) { finish(null, new Error("Choose a backup smaller than 5 MB.")); return; }
      file.text().then(text => finish(text)).catch(() => finish(null, new Error("The selected backup could not be read.")));
    });
    window.addEventListener("focus", onFocus);
    document.body.appendChild(input); input.click();
  });
}
export async function chooseBackupText(): Promise<string | null> {
  if (Platform.OS === "web") return pickWeb();
  const result = await DocumentPicker.getDocumentAsync({ type: ["application/json", "text/plain"], multiple: false, copyToCacheDirectory: true });
  if (result.canceled) return null;
  const asset = result.assets[0];
  const file = new File(asset.uri);
  try {
    if ((asset.size ?? file.size) > MAX_BACKUP_BYTES) throw new Error("Choose a backup smaller than 5 MB.");
    return await file.text();
  } finally {
    // Only delete the temporary copy we explicitly asked the picker to create.
    if (file.uri.startsWith(Paths.cache.uri)) { try { file.delete(); } catch { /* OS may already have cleaned its cache. */ } }
  }
}
export async function saveBackupFile(text: string, filename: string, language: Language = "en"): Promise<"download" | "share"> {
  if (Platform.OS === "web") {
    const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = filename;
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    return "download";
  }
  if (!await Sharing.isAvailableAsync()) throw new Error("File sharing is unavailable on this device. Try again when sharing is available.");
  const file = new File(Paths.cache, filename);
  try {
    file.create({ overwrite: true }); file.write(text);
    await Sharing.shareAsync(file.uri, { mimeType: "application/json", UTI: "public.json", dialogTitle: translate("Save your Toolbox backup", {}, language) });
    return "share";
  } finally { if (file.exists) { try { file.delete(); } catch { /* Temporary copies are safe for the OS to reclaim. */ } } }
}
