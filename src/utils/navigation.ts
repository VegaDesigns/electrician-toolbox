import { router } from "expo-router";

/** Return to the existing home screen, or replace a directly opened tool. */
export function returnHome() {
  router.dismissTo("/");
}
