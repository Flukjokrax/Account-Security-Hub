/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuditLog, ActiveSession, ZoneHold } from "../types";

export const initialSessions: ActiveSession[] = [
  {
    id: "sess-001",
    device: "Apple MacBook Pro 16",
    browser: "Chrome 124.0",
    ip: "104.16.24.5",
    location: "San Francisco, CA, USA",
    lastActive: "Active now",
    isCurrent: true,
  },
  {
    id: "sess-002",
    device: "iPhone 15 Pro",
    browser: "Safari Mobile 17.2",
    ip: "172.64.150.12",
    location: "New York, NY, USA",
    lastActive: "2 hours ago",
    isCurrent: false,
  },
  {
    id: "sess-003",
    device: "Windows Desktop PC",
    browser: "Firefox Dev Edition",
    ip: "8.25.191.134",
    location: "London, UK",
    lastActive: "5 hours ago",
    isCurrent: false,
  },
  {
    id: "sess-004",
    device: "Unknown Linux Terminal",
    browser: "Curl / Python-Requests (Automated)",
    ip: "193.56.28.31",
    location: "St. Petersburg, Russia",
    lastActive: "1 day ago",
    isCurrent: false, // This looks suspicious! Giving a perfect action vector for the user to secure.
  },
];

export const initialZoneHolds: ZoneHold[] = [
  {
    id: "zh-001",
    domain: "api.cloudflare-enterprise.com",
    status: "Locked",
    heldBy: "admin-sso@cloudflare-enterprise.com",
    holdType: "Permanent",
    lastUpdated: "2026-05-28T14:32:00Z",
  },
  {
    id: "zh-002",
    domain: "dns-routing.cloudflare-enterprise.com",
    status: "Unlocked",
    heldBy: "N/A",
    holdType: "Temporary",
    lastUpdated: "2026-05-30T09:12:00Z",
  },
  {
    id: "zh-003",
    domain: "security-gateway.net",
    status: "Unlocked",
    heldBy: "N/A",
    holdType: "Temporary",
    lastUpdated: "2026-05-31T01:45:00Z",
  },
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: "log-101",
    timestamp: "2026-05-31T19:42:15Z",
    action: "User Login Success",
    actor: {
      email: "jokraxfluk@gmail.com",
      ip: "104.16.24.5",
      location: "San Francisco, CA, USA",
    },
    resource: "Dashboard Control Panel",
    status: "Success",
    severity: "Info",
    details: "Interactive login completed from native browser session.",
  },
  {
    id: "log-102",
    timestamp: "2026-05-31T18:15:30Z",
    action: "SQL Injection Attempt Blocked",
    actor: {
      email: "anonymous-scanner@attack.net",
      ip: "193.56.28.31",
      location: "St. Petersburg, Russia",
    },
    resource: "/auth/login (API Gateway)",
    status: "Blocked",
    severity: "Critical",
    details: "OWASP SQLi payload parsed and stripped by Cloudflare WAF: `' OR '1'='1`.",
  },
  {
    id: "log-103",
    timestamp: "2026-05-31T15:22:11Z",
    action: "Zone Hold Enabled",
    actor: {
      email: "admin-sso@cloudflare-enterprise.com",
      ip: "104.16.24.5",
      location: "San Francisco, CA, USA",
    },
    resource: "api.cloudflare-enterprise.com",
    status: "Success",
    severity: "Warning",
    details: "Locked DNS records to prevent unwanted modifications.",
  },
  {
    id: "log-104",
    timestamp: "2026-05-31T11:05:41Z",
    action: "SSO Config Integration Failed",
    actor: {
      email: "jokraxfluk@gmail.com",
      ip: "172.64.150.12",
      location: "New York, NY, USA",
    },
    resource: "Single Sign-On Service",
    status: "Failure",
    severity: "Warning",
    details: "Invalid SAML certificate metadata uploaded.",
  },
  {
    id: "log-105",
    timestamp: "2026-05-31T08:30:19Z",
    action: "SSO SCIM Integration Setup",
    actor: {
      email: "jokraxfluk@gmail.com",
      ip: "104.16.24.5",
      location: "San Francisco, CA, USA",
    },
    resource: "SCIM Provisioner",
    status: "Success",
    severity: "Info",
    details: "SAML connection established and active directories linked.",
  },
];
