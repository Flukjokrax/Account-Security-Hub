/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: {
    email: string;
    ip: string;
    location: string;
  };
  resource: string;
  status: "Success" | "Failure" | "Blocked";
  severity: "Info" | "Warning" | "Critical";
  details: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface ZoneHold {
  id: string;
  domain: string;
  status: "Locked" | "Unlocked";
  heldBy: string;
  holdType: "Permanent" | "Temporary";
  lastUpdated: string;
}

export interface SecurityScoreMetrics {
  twoFactorEnabled: boolean;
  ssoEnabled: boolean;
  zoneHoldsActive: boolean;
  sessionsClean: boolean;
  codeSecured: boolean;
  abuseContactConfigured: boolean;
}
