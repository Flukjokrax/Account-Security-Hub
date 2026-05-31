/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Laptop, Smartphone, AlertTriangle, ShieldCheck, Lock, Unlock, Plus, Trash2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ActiveSession, ZoneHold } from "../types";

interface SessionManagerProps {
  sessions: ActiveSession[];
  onRevokeSession: (sessId: string) => void;
  zoneHolds: ZoneHold[];
  onToggleZoneHold: (zoneId: string) => void;
  onAddZoneHold: (domain: string) => void;
}

export default function SessionManager({
  sessions,
  onRevokeSession,
  zoneHolds,
  onToggleZoneHold,
  onAddZoneHold,
}: SessionManagerProps) {
  const [newDomain, setNewDomain] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreateHold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;
    
    // Check basic domain validity
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(newDomain)) {
      setErrorMessage("Enter a valid format (e.g., app.securesite.org)");
      return;
    }
    
    onAddZoneHold(newDomain);
    setNewDomain("");
    setErrorMessage("");
  };

  return (
    <div id="session-manager-root" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Active Session Management Panel (Left / Col-8) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Session card wrapper */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-slate-900 font-sans font-semibold text-xs tracking-wider uppercase">Active Security Sessions</h3>
              <p className="text-slate-500 text-xs mt-1">
                Revoke stale or unauthorized authorization tokens instantly
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
              {sessions.length} Registered Devices
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <AnimatePresence initial={false}>
              {sessions.map((sess) => {
                const isSuspicious = sess.ip === "193.56.28.31"; // Russian IP
                return (
                  <motion.div
                    key={sess.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isSuspicious
                        ? "bg-red-50/70 border-red-200 hover:border-red-300"
                        : "bg-slate-50/80 border-slate-150/70 border-slate-100 hover:bg-white hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg mt-0.5 ${isSuspicious ? "bg-red-100 text-red-600 animate-pulse" : "bg-slate-100 text-slate-500"}`}>
                        {sess.device.includes("iPhone") ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-sans font-semibold text-slate-900">{sess.device}</h4>
                          {sess.isCurrent && (
                            <span className="text-[9px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                              Current Session
                            </span>
                          )}
                          {isSuspicious && (
                            <span className="text-[9px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.2 bg-red-100 text-red-700 border border-red-200 rounded flex items-center gap-0.5">
                              <ShieldAlert className="w-3 h-3" /> Suspicious
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{sess.browser} &bull; {sess.ip}</p>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                          <span>{sess.location}</span>
                          <span>&bull;</span>
                          <span className={sess.isCurrent ? "text-emerald-600 font-semibold" : "text-slate-400"}>
                            {sess.lastActive}
                          </span>
                        </p>
                      </div>
                    </div>

                    {!sess.isCurrent ? (
                      <button
                        onClick={() => onRevokeSession(sess.id)}
                        className={`px-3 py-1.5 rounded text-[10px] font-mono font-semibold transition flex items-center gap-1 cursor-pointer ${
                          isSuspicious
                            ? "bg-red-100 hover:bg-red-200 text-red-700 border border-red-300"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Revoke Access
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-100 select-none">
                        Protected
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Informative Security Tips Card (Cloudflare Docs guidelines) */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 text-xs text-slate-600 space-y-3 leading-relaxed">
          <div className="flex items-center gap-2 text-slate-900 font-sans font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cloudflare Session Security Architecture</span>
          </div>
          <p>
            When users login through modern authentication APIs, Cloudflare establishes session tokens. In high-security organizations:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500 font-medium">
            <li><strong>Audit Logs</strong> register all session revoke processes immediately.</li>
            <li><strong>Geo-Locking Integration</strong> is applied, alerting the system if session calls cross country boundaries within impossible travel limits.</li>
            <li><strong>Token Expiry Enforcements</strong> automatically flush cookies globally.</li>
          </ul>
        </div>
      </div>

      {/* Zone Holds Panel (Right / Col-5) */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Zone configuration */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-slate-900 font-sans font-semibold text-xs tracking-wider uppercase">Zone Holds Protection</h3>
            <p className="text-slate-500 text-xs mt-1">
              Prevent unauthorized domain modifications or configuration transfers
            </p>
          </div>

          {/* Add custom Zone / Domain hold form */}
          <form onSubmit={handleCreateHold} className="mt-4 gap-2 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="domain.example.com"
                className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded px-3 py-1.5 focus:outline-none focus:border-orange-500 focus:bg-white font-mono"
              />
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-sans text-xs px-3 py-1.5 rounded font-semibold transition flex items-center gap-1 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                Add Hold
              </button>
            </div>
            {errorMessage && (
              <p className="text-[10px] text-red-500 font-mono font-medium">{errorMessage}</p>
            )}
          </form>

          {/* Zone Holds list */}
          <div className="mt-6 space-y-3">
            <AnimatePresence initial={false}>
              {zoneHolds.map((zone) => {
                const isLocked = zone.status === "Locked";
                return (
                  <motion.div
                    key={zone.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-3 rounded-lg border transition-all ${
                      isLocked
                        ? "bg-orange-50/20 border-orange-200"
                        : "bg-slate-50/50 border-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-0.5 truncate flex-1">
                        <span className="font-mono text-[11px] font-bold text-slate-800 truncate block">
                          {zone.domain}
                        </span>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-medium font-mono">
                          <span className={`px-1 rounded uppercase font-semibold border ${isLocked ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-slate-100 text-slate-550 text-slate-500 border-slate-200'}`}>
                            {zone.holdType}
                          </span>
                          <span>&bull;</span>
                          <span className="truncate block">{zone.heldBy === "N/A" ? "No admin associated" : zone.heldBy}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onToggleZoneHold(zone.id)}
                        className={`p-1.5 rounded transition flex items-center gap-1 text-[10px] font-mono font-bold shrink-0 cursor-pointer ${
                          isLocked
                            ? "bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300 animate-pulse"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-650 text-slate-600 border border-slate-200"
                        }`}
                        title={isLocked ? "Unlock Domain Zone" : "Lock Domain Zone"}
                      >
                        {isLocked ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Locked</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Unlock</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Explain Zone Holds documentation snippet */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-sans font-semibold text-xs">
            <Lock className="w-4 h-4 text-orange-500" />
            <span>Zone Holds Security Documentation</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-sans font-medium">
            By enabling a **Zone Hold**, you lock down critical zone parameters at the edge layer. Even administrative APIs will decline deletions or IP updates until the specific Hold is dismantled under offline multi-signature security checks. This eliminates high-frequency malicious domain transfers during team leaks.
          </p>
        </div>
      </div>
    </div>
  );
}
