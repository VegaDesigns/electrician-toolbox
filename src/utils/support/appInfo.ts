import Constants from "expo-constants";
import { Platform } from "react-native";
import { releaseConfiguration } from "../../config/release";
import type { AppReportInfo } from "./report";

export function getAppReportInfo(): AppReportInfo {
  const isExpoGo = Boolean(Constants.expoVersion);
  const nativeBuild = Platform.OS === "ios" ? Constants.platform?.ios?.buildNumber
    : Platform.OS === "android" ? Constants.platform?.android?.versionCode : null;
  return {
    appName: releaseConfiguration.workingName,
    version: Constants.expoConfig?.version ?? "Unavailable",
    build: !isExpoGo && nativeBuild != null ? String(nativeBuild) : null,
    platform: Platform.OS,
    osVersion: Platform.OS === "web" ? "" : String(Platform.Version),
    environment: Platform.OS === "web" ? "Browser preview" : isExpoGo ? "Expo Go preview" : "Installed app",
  };
}
