/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Key, Users, Mail, ShieldAlert, Sparkles, AlertTriangle, ShieldCheck, Check } from "lucide-react";
import { motion } from "motion/react";
import { SecurityScoreMetrics } from "../types";

interface SsoConfiguratorProps {
  metrics: SecurityScoreMetrics;
  onUpdateMetrics: (newMetrics: Partial<SecurityScoreMetrics>) => void;
  onAddAuditLog: (action: string, details: string, severity: "Info" | "Warning" | "Critical", status: "Success" | "Failure" | "Blocked") => void;
}

export default function SsoConfigurator({
  metrics,
  onUpdateMetrics,
  onAddAuditLog,
}: SsoConfiguratorProps) {
  // SSO State
  const [provider, setProvider] = useState("okta");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [metadataUrl, setMetadataUrl] = useState("");
  const [ssoConnecting, setSsoConnecting] = useState(false);
  const [ssoMessage, setSsoMessage] = useState("");

  // Abuse Contact State
  const [abuseEmail, setAbuseEmail] = useState("");
  const [abusePhone, setAbusePhone] = useState("");
  const [abuseSaved, setAbuseSaved] = useState(false);

  // Leaked Password Scanner State
  const [testPassword, setTestPassword] = useState("");
  const [scanResult, setScanResult] = useState<{ status: "idle" | "safe" | "breached"; message: string }>({ status: "idle", message: "" });
  const [isScanning, setIsScanning] = useState(false);

  // SSO Wizard Submit
  const handleSsoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !clientSecret) {
      setSsoMessage("Please fill in Client ID and Client Secret details.");
      return;
    }

    setSsoConnecting(true);
    setSsoMessage("");

    setTimeout(() => {
      setSsoConnecting(false);
      onUpdateMetrics({ ssoEnabled: true });
      const currentProviderName = provider === "okta" ? "Okta SAML 2.0" : provider === "azure" ? "Azure AD OIDC" : "Google Workspace Auth";
      onAddAuditLog(
        `SSO Provider Integrated: ${currentProviderName}`,
        `Connected organization single sign-on provider with Client ID: ${clientId.substring(0, 8)}...`,
        "Info",
        "Success"
      );
      setSsoMessage("SSO Provider connected and verified successfully!");
    }, 1500);
  };

  // 2FA Setup Simulation
  const handleEnable2FA = () => {
    onUpdateMetrics({ twoFactorEnabled: true });
    onAddAuditLog(
      "Two-Factor Auth Enforced",
      "Cryptographic TOTP 2FA restrictions enabled on root administration panels.",
      "Warning",
      "Success"
    );
  };

  // Abuse Contact verification
  const handleAbuseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!abuseEmail) return;

    onUpdateMetrics({ abuseContactConfigured: true });
    setAbuseSaved(true);
    onAddAuditLog(
      "Abuse Contact Saved",
      `Registered root security abuse contact email to ${abuseEmail}`,
      "Info",
      "Success"
    );

    setTimeout(() => {
      setAbuseSaved(false);
    }, 3000);
  };

  // Leaked password scan
  const handlePasswordScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPassword) return;

    setIsScanning(true);
    setScanResult({ status: "idle", message: "" });

    setTimeout(() => {
      setIsScanning(false);
      const weakPasswords = ["password", "password123", "123456", "admin", "admin123", "cloudflare", "pass123"];
      const isWeak = weakPasswords.some(p => testPassword.toLowerCase().includes(p)) || testPassword.length < 8;

      if (isWeak) {
        setScanResult({
          status: "breached",
          message: "BREACHED CRYPTO CHECK: This password is found in public dark-web leak archives! Cloudflare WAF will automatically flag and prompt MFA checks on authentications using this pattern."
        });
        onAddAuditLog(
          "Weak Password Scan Triggered",
          `Checked credentials hash against leaks database: Breach detected.`,
          "Warning",
          "Success"
        );
      } else {
        setScanResult({
          status: "safe",
          message: "Secure credentials. This password hash does not appear in current active threat intelligence logs. Great password design!"
        });
        onAddAuditLog(
          "Secure Password Scan Triggered",
          `Checked credentials hash against leaks database: Clear certificate match.`,
          "Info",
          "Success"
        );
      }
    }, 1000);
  };

  return (
    <div id="sso-configurator-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* SSO, SCIM & 2FA Configuration (Col 8) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* SSO Panel Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <span className="p-1.5 rounded bg-orange-50 text-orange-600">
              <Key className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-slate-900 font-sans font-semibold text-xs tracking-wider uppercase">Enterprise SSO Integration</h3>
              <p className="text-slate-500 text-xs mt-0.5">Link corporate authenticators to govern administrative credentials</p>
            </div>
          </div>

          {!metrics.ssoEnabled ? (
            <form onSubmit={handleSsoSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">SSO IDP Provider</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded text-xs px-3 py-2 focus:outline-none focus:border-orange-500 focus:bg-white font-sans"
                  >
                    <option value="okta">Okta Enterprise (SAML 2.0)</option>
                    <option value="azure">Azure Active Directory (OIDC)</option>
                    <option value="google">Google Workspace Enterprise</option>
                    <option value="ping">Ping Identity</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">Metadata Exchange XML URL</label>
                  <input
                    type="url"
                    value={metadataUrl}
                    onChange={(e) => setMetadataUrl(e.target.value)}
                    placeholder="https://idp.okta.com/app/exk..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-orange-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">Auth Client ID</label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="okta_oauth_cli_f821f..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-orange-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">OIDC Private Secret</label>
                  <input
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="••••••••••••••••••••••••"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-orange-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={ssoConnecting}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-sans text-xs px-4 py-2 rounded font-semibold transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {ssoConnecting ? "Exchanging Metadata payload..." : "Link SSO Hub"}
                </button>
                {ssoMessage && (
                  <span className="text-xs font-mono text-slate-500 font-semibold">{ssoMessage}</span>
                )}
              </div>
            </form>
          ) : (
            <div className="mt-6 flex items-center gap-4 bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
              <span className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                <Check className="w-5 h-5 animate-bounce" />
              </span>
              <div>
                <h4 className="text-sm font-semibold text-emerald-950">SAML SSO Provisioning Active</h4>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed font-medium">
                  Organisational single sign-on is configured. Native account registrations are locked.
                </p>
                <button 
                  onClick={() => onUpdateMetrics({ ssoEnabled: false })}
                  className="mt-2 text-[10px] font-mono text-slate-500 hover:text-slate-800 underline hover:no-underline font-semibold cursor-pointer"
                >
                  Disconnect SSO Server (Demote access)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2FA & Multi Factor Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded bg-orange-50 text-orange-600">
                <Users className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-slate-900 font-sans font-semibold text-xs tracking-wider uppercase">Multi-Factor Authentication (2FA)</h3>
                <p className="text-slate-500 text-xs mt-0.5">Enforce hardware token authorization policies</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600 max-w-md font-sans">
              Secure against stolen credentials. Enforces TOTP validators or FIDO2 key checks during administrative action pipelines.
            </p>
            {!metrics.twoFactorEnabled ? (
              <button
                onClick={handleEnable2FA}
                className="bg-orange-500 hover:bg-orange-600 text-white font-sans text-xs px-4 py-2 rounded font-semibold transition active:scale-95 whitespace-nowrap cursor-pointer"
              >
                Simulate 2FA Config
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold font-mono">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                Active
              </div>
            )}
          </div>
        </div>

        {/* SCIM Overview Doc */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 text-slate-600 text-xs space-y-3 leading-relaxed">
          <h4 className="text-slate-900 font-sans font-semibold">SCIM (System for Cross-domain Identity Management) Overview</h4>
          <p className="font-sans font-medium">
            SCIM provides standardized APIs to facilitate automated synchronization of user records across directory stores. Cloudflare automatically ingests SCIM payloads from OIDC nodes, facilitating identity creation, modification, and revocation logs seamlessly.
          </p>
        </div>
      </div>

      {/* Abuse Contact & Leaked Password Check (Col 4) */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Abuse Contacts Form Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="p-1 rounded bg-orange-50 text-orange-600">
              <Mail className="w-4 h-4" />
            </span>
            <h3 className="text-slate-900 font-sans font-semibold text-xs tracking-wider uppercase">Abuse Contact Details</h3>
          </div>

          <form onSubmit={handleAbuseSubmit} className="mt-4 space-y-4">
            <div>
              <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">Abuse Reports Email</label>
              <input
                type="email"
                required
                value={abuseEmail}
                onChange={(e) => setAbuseEmail(e.target.value)}
                placeholder="abuse@yourfirm.com"
                className="w-full bg-slate-50 border border-slate-200 text-slate-850 text-xs rounded px-3 py-2 focus:outline-none focus:border-orange-500 focus:bg-white font-sans"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">Emergents Callback Telephone</label>
              <input
                type="tel"
                value={abusePhone}
                onChange={(e) => setAbusePhone(e.target.value)}
                placeholder="+1 (555) 391-1249"
                className="w-full bg-slate-50 border border-slate-200 text-slate-850 text-xs rounded px-3 py-2 focus:outline-none focus:border-orange-500 focus:bg-white font-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans text-xs py-2 rounded font-semibold transition active:scale-95 border border-slate-200 cursor-pointer"
            >
              {abuseSaved ? "Saved Contact Info" : "Register Abuse Contact"}
            </button>
          </form>
        </div>

        {/* Leaked Password Scanner Card */}
        <div id="leaked-scanners-card" className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="p-1 rounded bg-orange-50 text-orange-600">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h3 className="text-slate-900 font-sans font-semibold text-xs tracking-wider uppercase">Leaked Password Scanner</h3>
          </div>

          <p className="text-[11px] text-slate-500 mt-3 leading-relaxed font-sans font-medium">
            Verify credentials safety. Run a test against mock global compromised datasets to see if WAF blocks are active.
          </p>

          <form onSubmit={handlePasswordScan} className="mt-4 space-y-3">
            <div>
              <input
                type="password"
                required
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                placeholder="Test a dummy password..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-orange-500 focus:bg-white font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isScanning}
              className="w-full bg-orange-50 hover:bg-orange-105 hover:bg-orange-100 border border-orange-200 text-orange-700 font-mono text-[10px] uppercase py-2 rounded font-bold tracking-wider transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isScanning ? "Hashing & scanning hashes..." : "Query exposed lists"}
            </button>
          </form>

          {scanResult.status !== "idle" && (
            <div className={`mt-4 p-3 rounded-lg border text-xs leading-relaxed ${
              scanResult.status === "breached" 
                ? "bg-red-55 bg-red-50 border-red-200 text-red-950" 
                : "bg-emerald-50 border-emerald-200 text-emerald-950"
            }`}>
              <div className="flex items-center gap-1.5 font-bold mb-1">
                {scanResult.status === "breached" ? <ShieldAlert className="w-4 h-4 text-red-650 shrink-0" /> : <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
                {scanResult.status === "breached" ? "SECURITY WARNING" : "CLEAR CERTIFICATION"}
              </div>
              <p className="text-[11px] font-sans font-medium">{scanResult.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
