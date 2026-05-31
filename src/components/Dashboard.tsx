/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Shield, AlertTriangle, CheckCircle, Smartphone, Key, Lock, Mail, Server } from "lucide-react";
import { motion } from "motion/react";
import { SecurityScoreMetrics } from "../types";

interface DashboardProps {
  metrics: SecurityScoreMetrics;
  onNavigate: (tabId: string) => void;
  suspiciousSessionsCount: number;
  unlockedZonesCount: number;
  onQuickFixAbuse: () => void;
  onQuickEnable2FA: () => void;
}

export default function Dashboard({
  metrics,
  onNavigate,
  suspiciousSessionsCount,
  unlockedZonesCount,
  onQuickFixAbuse,
  onQuickEnable2FA,
}: DashboardProps) {
  // Calculate security score
  let score = 0;
  if (metrics.codeSecured) score += 30;
  if (metrics.twoFactorEnabled) score += 15;
  if (metrics.ssoEnabled) score += 15;
  if (!metrics.zoneHoldsActive) {
    if (unlockedZonesCount === 0) score += 15; // all locked
    else score += Math.floor(15 * (1 - unlockedZonesCount / 3));
  } else {
    score += 15;
  }
  if (metrics.sessionsClean && suspiciousSessionsCount === 0) score += 15;
  if (metrics.abuseContactConfigured) score += 10;

  // Visual status
  const getScoreColor = (val: number) => {
    if (val < 50) return "text-red-500 stroke-red-500";
    if (val < 80) return "text-amber-500 stroke-amber-500";
    return "text-emerald-500 stroke-emerald-500";
  };

  return (
    <div id="security-dashboard-root" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Security Score Gauge Card */}
        <div id="score-card" className="lg:col-span-4 bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col items-center justify-between min-h-[340px]">
          <div className="text-center w-full">
            <h3 className="text-slate-500 font-sans font-medium text-xs tracking-wider uppercase">Account Security Score</h3>
            <p className="text-slate-600 text-xs mt-1">Real-time posture calculation</p>
          </div>

          <div className="relative w-40 h-40 mt-4 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-100 fill-none"
                strokeWidth="8"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                className={`fill-none ${getScoreColor(score)}`}
                strokeWidth="8"
                strokeDasharray={251.2}
                animate={{ strokeDashoffset: 251.2 - (251.2 * score) / 100 }}
                transition={{ duration: 1, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <motion.span 
                className="text-4xl font-sans font-bold text-slate-900 block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {score}%
              </motion.span>
              <span className={`text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full border ${score < 50 ? 'bg-red-50 border-red-200 text-red-600' : score < 80 ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                {score < 50 ? "Vulnerable" : score < 80 ? "Moderate" : "Hardened"}
              </span>
            </div>
          </div>

          <div className="w-full mt-4 text-center">
            <p className="text-xs text-slate-500 font-medium">
              {score === 100 
                ? "Excellent! All protection measures active." 
                : `${100 - score}% risk vector exposed. Address alerts below to harden.`}
            </p>
          </div>
        </div>

        {/* Action Center / Threat Board */}
        <div id="threat-card" className="lg:col-span-8 bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col justify-between min-h-[340px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-slate-900 font-sans font-semibold text-sm tracking-wide uppercase flex items-center gap-2">
                  <Shield id="threat-icon-shield" className="w-4 h-4 text-orange-500 animate-pulse shrink-0" />
                  Active Security Recommendations
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">Urgent hardening tasks required to protect databases and systems</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Vulnerability 1: SQLi in Code Review */}
              {!metrics.codeSecured && (
                <div id="alert-sqli" className="flex items-start gap-4 p-3.5 rounded-lg bg-red-50/70 border border-red-200">
                  <div className="p-1 rounded bg-red-100 text-red-600 mt-0.5 shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-xs font-sans font-semibold text-red-950">Critical SQL Injection Vulnerability in login code</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">OWASP A03:2021</span>
                    </div>
                    <p className="text-[11px] text-red-800/90 mt-1 leading-relaxed">
                      Static security review identified string concatenation in authentication query. Attackers can bypass access control via trivial inputs.
                    </p>
                    <button 
                      onClick={() => onNavigate("sqli")}
                      className="mt-2 text-[10px] font-mono text-orange-600 hover:text-orange-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      Open Live SQLi sandbox & fix &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Vulnerability 2: Active Suspicious Session */}
              {suspiciousSessionsCount > 0 && (
                <div id="alert-session" className="flex items-start gap-4 p-3.5 rounded-lg bg-amber-50/70 border border-amber-200">
                  <div className="p-1 rounded bg-amber-100 text-amber-600 mt-0.5 shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-xs font-sans font-semibold text-amber-950">Unrecognized terminal active session detected</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">Session Warning</span>
                    </div>
                    <p className="text-[11px] text-amber-800/95 mt-1 leading-relaxed">
                      A Linux python-requests connection from Saint Petersburg, Russia is actively registered on your account. Revoke session immediately.
                    </p>
                    <button 
                      onClick={() => onNavigate("sessions")}
                      className="mt-2 text-[10px] font-mono text-orange-600 hover:text-orange-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      Revoke suspicious connection &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Vulnerability 3: Zone Holds Unlocked */}
              {unlockedZonesCount > 0 && (
                <div id="alert-zone" className="flex items-start gap-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="p-1 rounded bg-slate-100 text-slate-600 mt-0.5 shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-xs font-sans font-semibold text-slate-900">Zone Holds inactive for critical domains</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">DNS Threat</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      {unlockedZonesCount} domain{unlockedZonesCount > 1 ? "s are" : " is"} vulnerable to unauthorized DNS routing modifications. Lock DNS records using Zone Holds.
                    </p>
                    <button 
                      onClick={() => onNavigate("sessions")}
                      className="mt-2 text-[10px] font-mono text-orange-600 hover:text-orange-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      Activate domain Zone Holds &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Vulnerability 4: Abuse Contact missing */}
              {!metrics.abuseContactConfigured && (
                <div id="alert-abuse" className="flex items-start gap-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="p-1 rounded bg-slate-100 text-slate-600 mt-0.5 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-xs font-sans font-semibold text-slate-900">No security abuse contact registered</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">Contact</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Network administrators and security abuse systems cannot direct threat notices or DMCA issues to your team.
                    </p>
                    <button 
                      onClick={onQuickFixAbuse}
                      className="mt-2 text-[10px] font-mono text-orange-600 hover:text-orange-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      Register abuse contact email &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* Vulnerability 5: 2FA missing */}
              {!metrics.twoFactorEnabled && (
                <div id="alert-2fa" className="flex items-start gap-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="p-1 rounded bg-slate-100 text-slate-600 mt-0.5 shrink-0">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="text-xs font-sans font-semibold text-slate-900">Set up Two-Factor Authentication (2FA)</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">Access Control</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Add a secondary authentication layer via TOTP authenticator keys or security keys to safeguard credentials.
                    </p>
                    <button 
                      onClick={onQuickEnable2FA}
                      className="mt-2 text-[10px] font-mono text-orange-600 hover:text-orange-700 font-semibold hover:underline flex items-center gap-1"
                    >
                      Simulate 2FA setup in SSO tab &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* All Clear message */}
              {metrics.codeSecured && suspiciousSessionsCount === 0 && unlockedZonesCount === 0 && metrics.abuseContactConfigured && metrics.twoFactorEnabled && (
                <div id="alert-all-hardened" className="flex items-center justify-center gap-3 p-5 rounded-lg border border-emerald-200 bg-emerald-50 text-center flex-col shadow-sm">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                  <div>
                    <h4 className="text-sm font-sans font-semibold text-emerald-950">System Hardened Successfully</h4>
                    <p className="text-xs text-emerald-800 mt-1 max-w-md">
                      Great job! Your database is safe from SQLi injections, critical zones are locked, credentials are safe under SSO/2FA, and sessions are authorized.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid Brief Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition duration-200 rounded-xl p-5 cursor-pointer" onClick={() => onNavigate("sessions")}>
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-lg bg-orange-50 text-orange-600 shrink-0">
              <Server className="w-5 h-5" />
            </span>
            <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Feature Status</span>
          </div>
          <h4 className="text-slate-900 font-sans text-xs font-semibold uppercase tracking-wider">Active Sessions & Zone Holds</h4>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Monitor real-time active login session tokens and enable cryptographic Zone Holds on high-risk domains to protect DNS registry state.
          </p>
        </div>

        <div className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition duration-200 rounded-xl p-5 cursor-pointer" onClick={() => onNavigate("sso")}>
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-lg bg-orange-50 text-orange-600 shrink-0">
              <Key className="w-5 h-5" />
            </span>
            <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Feature Status</span>
          </div>
          <h4 className="text-slate-900 font-sans text-xs font-semibold uppercase tracking-wider">Enterprise SSO & SCIM</h4>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Configure Single Sign-On and auto-provision user roles with SCIM connectors. Audit credentials against active breach lists.
          </p>
        </div>

        <div className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition duration-200 rounded-xl p-5 cursor-pointer" onClick={() => onNavigate("sqli")}>
          <div className="flex items-center justify-between mb-2">
            <span className="p-2 rounded-lg bg-orange-50 text-orange-600 shrink-0">
              <Shield className="w-5 h-5" />
            </span>
            <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Security Sandbox</span>
          </div>
          <h4 className="text-slate-900 font-sans text-xs font-semibold uppercase tracking-wider">Interactive SQL OWASP Lab</h4>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Harden backend authorization by visualising query structures. Compare direct parameters vs. raw vulnerable concatenations.
          </p>
        </div>
      </div>

      {/* Quick Security Reference Footer Guide */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
        <h4 className="text-sm font-sans font-semibold text-slate-950 mb-2">Cloudflare Account Security Core Architectural Highlights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          <div className="space-y-1 text-xs">
            <p className="text-slate-900 font-sans font-semibold">Audit Logs - Version 2</p>
            <p className="text-slate-500 leading-relaxed">
              Maintains full audit trails of modifications to access permissions, routing policies, and configuration payloads to ensure absolute posture transparency.
            </p>
          </div>
          <div className="space-y-1 text-xs">
            <p className="text-slate-900 font-sans font-semibold">Zone Holds Protection</p>
            <p className="text-slate-500 leading-relaxed">
              Enforces multi-factor offline authorization hooks on registry delegations, safeguarding your production DNS parameters from unauthorized overrides.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
