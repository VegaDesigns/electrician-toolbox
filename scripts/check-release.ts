import { readFileSync } from "node:fs";
import { getPublicReleaseBlockers, releaseConfiguration } from "../src/config/release";

const app = JSON.parse(readFileSync(new URL("../app.json", import.meta.url), "utf8")).expo;
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const blockers = getPublicReleaseBlockers();
if (app.version !== pkg.version) blockers.push("Keep app and package versions aligned.");
if (app.name !== releaseConfiguration.workingName) blockers.push("Keep the configured app name aligned with the approved release name.");
if (app.ios.bundleIdentifier !== "com.brokecoderlabs.electriciantoolbox") blockers.push("Review the changed iOS app identity before shipping.");

console.log(`Electrician Toolbox ${app.version} public release checklist`);
if (blockers.length) {
  console.log("Public release is blocked. Local previews and field-test preparation can continue.");
  blockers.forEach((blocker, i) => console.log(`${i + 1}. ${blocker}`));
  process.exitCode = 1;
} else {
  console.log("Configuration checks passed. Verify the documented sign-offs, exact candidate build, store metadata and owner approval before submitting.");
}
console.log("Payments are disabled. This check does not contact Apple, verify a website, certify electrical guidance, or publish anything.");
