import assert from "node:assert/strict";
import test from "node:test";
import { getPublicReleaseBlockers, getReleaseLinks, releaseConfiguration } from "./release";
import { createProblemReport } from "../utils/support/report";

test("unapproved launch details stay hidden and payment access stays disabled", () => {
  assert.deepEqual(getReleaseLinks(), { supportEmail: null, supportUrl: null, privacyUrl: null, termsUrl: null });
  assert.equal(releaseConfiguration.paymentsEnabled, false);
  assert.equal(getPublicReleaseBlockers().length, 10);
});

test("unsafe and placeholder contacts do not create active customer links", () => {
  for (const url of ["http://company.com", "javascript:alert(1)", "https://user:pass@company.com", "https://localhost", "https://127.0.0.1", "https://example.com/privacy", "https://company.test/privacy"]) {
    assert.equal(getReleaseLinks({ ...releaseConfiguration, privacyUrl: url }).privacyUrl, null);
  }
  for (const email of ["hello", "test@example.com", "person@company.com?subject=Other", "person@company.com\n"]) {
    assert.equal(getReleaseLinks({ ...releaseConfiguration, supportEmail: email }).supportEmail, null);
  }
});

test("approved public configuration clears planning gates without enabling payments", () => {
  const approved = { ...releaseConfiguration, publicNameApproved: true, publisherIdentityReviewed: true,
    supportEmail: "support@publisher.org", supportUrl: "https://publisher.org/help",
    privacyUrl: "https://publisher.org/privacy", termsUrl: "https://publisher.org/terms",
    privacyDisclosuresReviewed: true, electricalReviewComplete: true, contentRightsReviewed: true,
    externalFieldTestComplete: true, nativeBackupAcceptanceComplete: true };
  assert.deepEqual(getPublicReleaseBlockers(approved), []);
  assert.equal(approved.paymentsEnabled, false);
});

test("electrical accuracy, content rights and installed-device backup acceptance are independent", () => {
  const blockers = getPublicReleaseBlockers({ ...releaseConfiguration, electricalReviewComplete: true });
  assert.ok(!blockers.some(item => item.includes("electrical reference review")));
  assert.ok(blockers.some(item => item.includes("content-rights")));
  assert.ok(blockers.some(item => item.includes("installed iPhone")));
});

test("feedback includes only user-entered fields and the visible non-identifying app details", () => {
  const draft = { tool: " Workpad ", details: "Long equation clips", expected: "Read every digit", privateJob: "Hospital access code" };
  const info = { appName: "Electrician Toolbox", version: "0.9.2", build: "8", platform: "ios", osVersion: "18", environment: "Installed app", deviceId: "private-identifier" };
  const report = createProblemReport(draft, info);
  assert.match(report, /Tool: Workpad/);
  assert.match(report, /Version: 0.9.2 \(build 8\)/);
  assert.doesNotMatch(report, /Hospital|private-identifier|privateJob|deviceId/);
  assert.doesNotMatch(createProblemReport({ tool: "", details: "Something happened", expected: "" }, { ...info, build: null }), /build null/);
});
