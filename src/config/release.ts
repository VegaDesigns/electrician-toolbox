/** Owner-approved public details go here. Null means no link, not a placeholder. */
export type ReleaseConfiguration = {
  workingName: string;
  publicNameApproved: boolean;
  publisherIdentityReviewed: boolean;
  supportEmail: string | null;
  supportUrl: string | null;
  privacyUrl: string | null;
  termsUrl: string | null;
  privacyDisclosuresReviewed: boolean;
  electricalReviewComplete: boolean;
  contentRightsReviewed: boolean;
  externalFieldTestComplete: boolean;
  nativeBackupAcceptanceComplete: boolean;
  paymentsEnabled: false;
};

export const releaseConfiguration: ReleaseConfiguration = {
  workingName: "Electrician Toolbox",
  publicNameApproved: false,
  publisherIdentityReviewed: false,
  supportEmail: null,
  supportUrl: null,
  privacyUrl: null,
  termsUrl: null,
  privacyDisclosuresReviewed: false,
  electricalReviewComplete: false,
  contentRightsReviewed: false,
  externalFieldTestComplete: false,
  nativeBackupAcceptanceComplete: false,
  paymentsEnabled: false,
};

export function isPublicHttpsUrl(value: string | null): value is string {
  if (!value || value !== value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      && url.hostname.includes(".") && !url.hostname.endsWith(".local")
      && !url.hostname.endsWith(".test") && !url.hostname.endsWith(".invalid")
      && !url.hostname.endsWith(".example") && url.hostname !== "example.com"
      && !url.hostname.endsWith(".example.com") && !/^\d+(\.\d+){3}$/.test(url.hostname);
  } catch { return false; }
}

export function isSupportEmail(value: string | null): value is string {
  return Boolean(value && /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(value)
    && !/@(?:.*\.)?(?:example\.com|example\.org|example\.net)$/i.test(value));
}

export function getReleaseLinks(config = releaseConfiguration) {
  return {
    supportEmail: isSupportEmail(config.supportEmail) ? config.supportEmail : null,
    supportUrl: isPublicHttpsUrl(config.supportUrl) ? config.supportUrl : null,
    privacyUrl: isPublicHttpsUrl(config.privacyUrl) ? config.privacyUrl : null,
    termsUrl: isPublicHttpsUrl(config.termsUrl) ? config.termsUrl : null,
  };
}

/** Planning gates, not legal certification or a substitute for App Store review. */
export function getPublicReleaseBlockers(config = releaseConfiguration): string[] {
  const links = getReleaseLinks(config);
  const blockers: string[] = [];
  if (!config.publicNameApproved || !config.workingName.trim()) blockers.push("Confirm the public app name.");
  if (!config.publisherIdentityReviewed) blockers.push("Review the Apple seller identity and intended publisher name.");
  if (!links.supportEmail && !links.supportUrl) blockers.push("Provide a working customer support contact.");
  if (!links.supportUrl) blockers.push("Publish and test the App Store support page.");
  if (!links.privacyUrl || !config.privacyDisclosuresReviewed) blockers.push("Publish an approved privacy policy and review App Store privacy disclosures.");
  if (!links.termsUrl) blockers.push("Choose and publish the terms of use or approved license information.");
  if (!config.electricalReviewComplete) blockers.push("Complete qualified electrical reference review.");
  if (!config.contentRightsReviewed) blockers.push("Complete content-rights review independently of electrical accuracy.");
  if (!config.externalFieldTestComplete) blockers.push("Complete the external field-test checklist on release builds.");
  if (!config.nativeBackupAcceptanceComplete) blockers.push("Verify backup export, restore and recovery on an installed iPhone build.");
  return blockers;
}
