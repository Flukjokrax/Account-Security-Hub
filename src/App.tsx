/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Shield, Key, Users, Terminal, ClipboardList, Laptop, Bell, AlertTriangle, Cloud, Lock, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { AuditLog, ActiveSession, ZoneHold, SecurityScoreMetrics } from "./types";
import { initialSessions, initialZoneHolds, initialAuditLogs } from "./utils/mockData";

import Dashboard from "./components/Dashboard";
import SessionManager from "./components/SessionManager";
import AuditExplorer from "./components/AuditExplorer";
import SsoConfigurator from "./components/SsoConfigurator";
import SqliPlayground from "./components/SqliPlayground";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // State definitions driven dynamically
  const [sessions, setSessions] = useState<ActiveSession[]>(initialSessions);
  const [zoneHolds, setZoneHolds] = useState<ZoneHold[]>(initialZoneHolds);
  const [logs, setLogs] = useState<AuditLog[]>(initialAuditLogs);

  const [metrics, setMetrics] = useState<SecurityScoreMetrics>({
    twoFactorEnabled: false,
    ssoEnabled: false,
    zoneHoldsActive: false, // will represent if all holds are active, or if we have at least one active
    sessionsClean: false,    // set to true when suspicious Russian session is revoked
    codeSecured: false,     // set to true when user completes SQLi Sandbox
    abuseContactConfigured: false,
  });

  // Action status toasts
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "warning" | "info" }[]>([]);

  const addToast = (message: string, type: "success" | "warning" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Log builder helper
  const addAuditLog = (
    action: string,
    details: string,
    severity: "Info" | "Warning" | "Critical" = "Info",
    status: "Success" | "Failure" | "Blocked" = "Success"
  ) => {
    const newLog: AuditLog = {
      id: `log-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      action,
      actor: {
        email: "jokraxfluk@gmail.com",
        ip: "104.16.24.5",
        location: "San Francisco, CA, USA",
      },
      resource: "/admin/security-settings",
      status,
      severity,
      details,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Metrics update
  const updateMetrics = (newMetrics: Partial<SecurityScoreMetrics>) => {
    setMetrics((prev) => {
      const merged = { ...prev, ...newMetrics };
      return merged;
    });
  };

  // Revoke session handler
  const handleRevokeSession = (sessId: string) => {
    const sessToRevoke = sessions.find((s) => s.id === sessId);
    if (!sessToRevoke) return;

    setSessions((prev) => prev.filter((s) => s.id !== sessId));
    
    const isSuspicious = sessToRevoke.ip === "193.56.28.31";
    
    if (isSuspicious) {
      updateMetrics({ sessionsClean: true });
      addToast("Suspicious unauthorized session revoked! Security posture improved.", "success");
      addAuditLog(
        "Suspicious Session Terminated",
        `Administrative credentials revoked access token from ${sessToRevoke.ip} running Linux Curl in ${sessToRevoke.location}. Token invalidated globally.`,
        "Critical",
        "Success"
      );
    } else {
      addToast(`Session on ${sessToRevoke.device} terminated.`, "info");
      addAuditLog(
        "Active Session Revoked",
        `Standard session closed manually on device template ${sessToRevoke.device} (${sessToRevoke.ip})`,
        "Warning",
        "Success"
      );
    }
  };

  // Toggle zone lock
  const handleToggleZoneHold = (zoneId: string) => {
    setZoneHolds((prev) =>
      prev.map((zone) => {
        if (zone.id === zoneId) {
          const nextStatus = zone.status === "Locked" ? "Unlocked" : "Locked";
          const holdType = zone.holdType;
          
          if (nextStatus === "Locked") {
            addToast(`Zone Hold Enabled: ${zone.domain} is now sealed.`, "success");
            addAuditLog(
              "Zone Hold Enabled",
              `DNS Registry modifications and edge templates successfully sealed for domain ${zone.domain}. Authorized by SEC-OPS.`,
              "Warning",
              "Success"
            );
          } else {
            addToast(`Zone Hold Removed: ${zone.domain} parameters are editable.`, "warning");
            addAuditLog(
              "Zone Hold Released",
              `DNS override restrictions deactivated for ${zone.domain}. Subdomain delegations exposed.`,
              "Critical",
              "Success"
            );
          }
          return {
            ...zone,
            status: nextStatus,
            lastUpdated: new Date().toISOString(),
            heldBy: nextStatus === "Locked" ? "jokraxfluk@gmail.com" : "N/A",
          };
        }
        return zone;
      })
    );
  };

  // Creator for new domain holds
  const handleAddZoneHold = (domain: string) => {
    const newHold: ZoneHold = {
      id: `zh-${Math.floor(100 + Math.random() * 900)}`,
      domain,
      status: "Locked",
      holdType: "Temporary",
      heldBy: "jokraxfluk@gmail.com",
      lastUpdated: new Date().toISOString(),
    };
    setZoneHolds((prev) => [newHold, ...prev]);
    addToast(`New Zone Hold created: Custom safety lock active on ${domain}`, "success");
    addAuditLog(
      "Created Custom Zone Hold",
      `New holding payload established on user request for ${domain}`,
      "Info",
      "Success"
    );
  };

  // Counter helper counts
  const suspiciousSessionsLeft = sessions.filter((s) => s.ip === "193.56.28.31").length;
  const unlockedZonesLeft = zoneHolds.filter((z) => z.status === "Unlocked").length;

  return (
    <div id="cloudflare-app-container" className="min-h-screen bg-slate-50 font-sans text-slate-950 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Top Header Bar with Cloudflare branding */}
      <header className="h-12 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center font-bold text-white shadow-sm">
            <Cloud className="w-4 h-4 text-white" />
          </div>
          <nav className="hidden md:flex items-center space-x-2 text-xs font-medium text-slate-500">
            <span>Directory</span>
            <span className="text-slate-300">/</span>
            <span>Fundamentals</span>
            <span className="text-slate-300">/</span>
            <span>Accounts</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold">Account security</span>
          </nav>
        </div>

        {/* User Session Detail & Active Indicators */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex flex-col items-end text-right">
            <span className="text-xs font-sans font-semibold text-slate-700">jokraxfluk@gmail.com</span>
            <span className="text-[10px] font-mono text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Systems Operational
            </span>
          </div>
          <div className="p-1 px-2.5 rounded bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium relative flex items-center gap-1.5 cursor-pointer hover:bg-slate-200/60 transition" title="Active warnings context">
            <Bell className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">Alert Centre</span>
            {(suspiciousSessionsLeft > 0 || !metrics.codeSecured) && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 animate-bounce" />
            )}
          </div>
        </div>
      </header>

      {/* Workspace Wrapper */}
      <main className="flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 max-h-[calc(100vh-3rem)] overflow-y-auto lg:overflow-y-hidden">
        
        {/* Navigation Sidebar (Vertical left alignment) */}
        <aside className="w-full lg:w-60 shrink-0 border border-slate-200 lg:border-r lg:border-l-0 lg:border-y-0 bg-white rounded-xl lg:rounded-none lg:bg-transparent p-4 flex flex-col">
          <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4 hidden lg:block">Navigation Suite</h2>
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-sans transition flex items-center gap-2.5 whitespace-nowrap ${
                activeTab === "dashboard"
                  ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-500 rounded-l-none"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
              }`}
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>HQ Command Center</span>
            </button>

            <button
              onClick={() => setActiveTab("sessions")}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-sans transition flex items-center justify-between gap-2.5 whitespace-nowrap relative ${
                activeTab === "sessions"
                  ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-500 rounded-l-none"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Laptop className="w-4 h-4 shrink-0" />
                <span>Sessions & Zone Holds</span>
              </span>
              {suspiciousSessionsLeft > 0 && (
                <span className="bg-red-100 text-red-700 text-[9px] font-mono px-1.5 py-0.2 rounded border border-red-200 font-bold shrink-0">
                  1 Threat
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("sso")}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-sans transition flex items-center gap-2.5 whitespace-nowrap ${
                activeTab === "sso"
                  ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-500 rounded-l-none"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
              }`}
            >
              <Key className="w-4 h-4 shrink-0" />
              <span>SSO & Credentials</span>
            </button>

            <button
              onClick={() => setActiveTab("sqli")}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-sans transition flex items-center justify-between gap-2.5 whitespace-nowrap relative ${
                activeTab === "sqli"
                  ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-500 rounded-l-none"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                <Terminal className="w-4 h-4 shrink-0" />
                <span>SQLi Sandbox OWASP</span>
              </span>
              {!metrics.codeSecured && (
                <span className="bg-orange-100 text-orange-700 text-[9px] font-mono px-1.5 py-0.2 rounded border border-orange-200 font-bold shrink-0">
                  A03 Error
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`w-full text-left px-3 py-2 rounded-md text-xs font-sans transition flex items-center gap-2.5 whitespace-nowrap ${
                activeTab === "audit"
                  ? "bg-orange-50 text-orange-700 font-semibold border-l-2 border-orange-500 rounded-l-none"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
              }`}
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span>Audit Trails v2</span>
            </button>
          </nav>
        </aside>

        {/* Tab content area */}
        <section className="flex-1 min-w-0 lg:overflow-y-auto lg:max-h-[calc(100vh-6.5rem)] pr-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "dashboard" && (
                <Dashboard
                  metrics={metrics}
                  onNavigate={setActiveTab}
                  suspiciousSessionsCount={suspiciousSessionsLeft}
                  unlockedZonesCount={unlockedZonesLeft}
                  onQuickFixAbuse={() => setActiveTab("sso")}
                  onQuickEnable2FA={() => {
                    setActiveTab("sso");
                    addToast("Complete form steps to enable 2FA on access gates.", "info");
                  }}
                />
              )}

              {activeTab === "sessions" && (
                <SessionManager
                  sessions={sessions}
                  onRevokeSession={handleRevokeSession}
                  zoneHolds={zoneHolds}
                  onToggleZoneHold={handleToggleZoneHold}
                  onAddZoneHold={handleAddZoneHold}
                />
              )}

              {activeTab === "sso" && (
                <SsoConfigurator
                  metrics={metrics}
                  onUpdateMetrics={updateMetrics}
                  onAddAuditLog={addAuditLog}
                />
              )}

              {activeTab === "sqli" && (
                <SqliPlayground
                  metrics={metrics}
                  onUpdateMetrics={updateMetrics}
                  onAddAuditLog={addAuditLog}
                />
              )}

              {activeTab === "audit" && (
                <AuditExplorer
                  logs={logs}
                  onClearLogs={() => {
                    setLogs([]);
                    addToast("Audit monitor trails cleared on local machine.", "info");
                  }}
                  onRefreshLogs={() => {
                    setLogs(initialAuditLogs);
                    addToast("Audit explorer database queried. Reload accomplished.", "success");
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {/* Shared Footer Area */}
      <footer className="h-8 bg-slate-900 flex items-center px-6 justify-between shrink-0 text-[9px] font-mono text-slate-400 uppercase tracking-widest mt-auto">
        <div className="flex items-center space-x-4">
          <span>Account: CF-3829-PRO</span>
          <div className="h-3 w-px bg-slate-700"></div>
          <span>Plan: Enterprise Tier-1</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-slate-550 text-slate-500 text-[9px] font-mono uppercase">Last sync: 2026-05-31 20:41:47 UTC</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
      </footer>

      {/* Floating Action Event Toast Notification Center */}
      <div id="toast-wrapper" className="fixed bottom-12 right-6 z-50 flex flex-col gap-2 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className={`p-3.5 rounded-lg shadow-xl border text-xs flex items-center justify-between gap-3 ${
                t.type === "success"
                  ? "bg-white border-emerald-200 text-slate-800 shadow-emerald-100/50"
                  : t.type === "warning"
                  ? "bg-white border-red-200 text-slate-800 shadow-red-100/50"
                  : "bg-white border-sky-200 text-slate-800 shadow-sky-100/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`p-1 rounded ${
                  t.type === "success" ? "bg-emerald-50 text-emerald-600" : t.type === "warning" ? "bg-red-50 text-red-600" : "bg-sky-550 bg-sky-50 text-sky-600"
                }`}>
                  <Shield className="w-3.5 h-3.5" />
                </span>
                <p className="font-sans font-semibold text-slate-850 text-slate-800">{t.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
