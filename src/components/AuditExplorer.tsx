/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, Filter, RefreshCw, Eye, Calendar, User, Globe, AlertCircle, ShieldAlert, CheckCircle2, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AuditLog } from "../types";

interface AuditExplorerProps {
  logs: AuditLog[];
  onClearLogs: () => void;
  onRefreshLogs: () => void;
}

export default function AuditExplorer({ logs, onClearLogs, onRefreshLogs }: AuditExplorerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Filter logic
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === "All" || log.severity === severityFilter;
    const matchesStatus = statusFilter === "All" || log.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-50 text-red-700 border border-red-200";
      case "Warning":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      default:
        return "bg-slate-100 text-slate-750 text-slate-700 border border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Success":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case "Blocked":
        return <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-red-600" />;
    }
  };

  return (
    <div id="audit-explorer-root" className="space-y-6">
      
      {/* Title head */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-slate-900 font-sans font-bold text-lg leading-snug">Audit Trails Explorer &bull; Version 2</h2>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Browse cryptographic system modifications, authentication tokens, and block events
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={onRefreshLogs}
            className="p-2 bg-white border border-slate-200 rounded hover:bg-slate-50 transition text-slate-600 text-xs flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm"
            title="Refresh logs stream"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="sr-only sm:not-sr-only font-semibold">Query DB</span>
          </button>
          
          <button 
            onClick={onClearLogs}
            className="p-2 bg-white border border-slate-200 rounded hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition text-slate-600 text-xs flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm font-semibold"
          >
            Clear Screen
          </button>
        </div>
      </div>

      {/* Grid containing Log explorer + interactive side details panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Main Records List (Left Side - Col 8) */}
        <div className={`${selectedLog ? "xl:col-span-8" : "xl:col-span-12"} bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all`}>
          
          {/* Query, Search and Filter Bar */}
          <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-3 items-center">
            
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search actions, triggers, actors, client IPs..."
                className="w-full bg-slate-50 border border-slate-200 rounded text-xs py-2 pl-9 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              {/* Severity Filter */}
              <div className="flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 rounded text-xs px-2 py-2 focus:outline-none focus:border-orange-500 cursor-pointer focus:bg-white"
                >
                  <option value="All">All Severities</option>
                  <option value="Info">Info</option>
                  <option value="Warning">Warning</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 rounded text-xs px-2 py-2 focus:outline-none focus:border-orange-500 cursor-pointer focus:bg-white"
              >
                <option value="All">All States</option>
                <option value="Success">Success</option>
                <option value="Failure">Failure</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          </div>

          {/* Table Headers */}
          <div className="grid grid-cols-12 gap-2 px-6 py-2.5 border-b border-slate-100 text-[10px] font-mono tracking-wider text-slate-500 uppercase font-bold bg-slate-50-60 bg-slate-50/50">
            <span className="col-span-3">Timestamp / Ref</span>
            <span className="col-span-4">Operation & Actor</span>
            <span className="col-span-3">Resource Location</span>
            <span className="col-span-2 text-right">Status / Sev</span>
          </div>

          {/* Row Entries */}
          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                  className={`grid grid-cols-12 gap-2 px-6 py-3.5 text-xs text-slate-700 hover:bg-slate-50 transition cursor-pointer items-center ${
                    selectedLog?.id === log.id ? "bg-orange-50/40 border-l-2 border-orange-500 text-slate-900" : ""
                  }`}
                >
                  {/* Timestamp */}
                  <div className="col-span-3 space-y-0.5">
                    <span className="font-mono text-[11px] text-slate-500 font-medium">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 block truncate">{log.id}</span>
                  </div>

                  {/* Operation & Actor */}
                  <div className="col-span-4 space-y-0.5">
                    <span className="font-sans font-semibold text-slate-900 line-clamp-1">{log.action}</span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 select-all hover:text-orange-600 font-mono">
                      {log.actor.email}
                    </span>
                  </div>

                  {/* Resource */}
                  <div className="col-span-3 text-[11px] text-slate-500 font-mono truncate">
                    {log.resource}
                  </div>

                  {/* Status/Sev */}
                  <div className="col-span-2 flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-[11px] font-bold font-sans text-slate-800">
                      {getStatusIcon(log.status)}
                      <span className="hidden md:inline">{log.status}</span>
                    </div>
                    <span className={`text-[8px] px-1.5 py-0.2 rounded-sm font-semibold uppercase font-mono tracking-wider border ${getSeverityStyle(log.severity)}`}>
                      {log.severity}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div id="no-logs" className="p-12 text-center text-slate-500 font-sans text-xs font-semibold">
                No matching security logs recorded in the current live interval. Change parameters.
              </div>
            )}
          </div>

          {/* Entry Counter footer */}
          <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500 bg-slate-50/50">
            <span>Showing {filteredLogs.length} of {logs.length} indexed event payloads</span>
            <span className="font-bold text-slate-400">SIEM Connected</span>
          </div>
        </div>

        {/* Dynamic Detail Side Panel Drawer (Right Side - Col 4) */}
        <AnimatePresence>
          {selectedLog && (
            <motion.div
              layout
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="xl:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-6 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h4 className="text-slate-400 font-mono text-[9px] uppercase tracking-widest">Metadata payload</h4>
                  <p className="text-slate-900 font-sans font-bold text-xs mt-0.5 truncate max-w-[200px]" title={selectedLog.action}>
                    {selectedLog.action}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Details Body */}
              <div className="space-y-4 text-xs font-sans">
                {/* ID segment */}
                <div className="bg-slate-50 border border-slate-200 rounded p-2 text-center">
                  <span className="text-[9px] text-slate-405 text-slate-500 font-mono block">Log Hash UUID</span>
                  <span className="text-slate-800 text-[11px] font-mono tracking-tight select-all font-semibold">{selectedLog.id}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Logged Timestamp</span>
                      <span className="text-slate-750 text-slate-800 font-mono text-[11px] font-semibold">{new Date(selectedLog.timestamp).toISOString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Initiating Actor</span>
                      <span className="text-slate-800 font-sans text-xs font-semibold">{selectedLog.actor.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Network Origin / Geo</span>
                      <span className="text-slate-800 font-mono text-[11px] font-semibold">
                        {selectedLog.actor.ip} &bull; {selectedLog.actor.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Event summary explanation */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2 mt-4">
                  <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase block font-bold">Context Details</span>
                  <p className="text-slate-700 text-xs leading-relaxed font-sans font-medium">{selectedLog.details}</p>
                </div>

                {/* Security threat audit rating */}
                <div className="pt-3 border-t border-slate-100 text-[11px] flex justify-between items-center text-slate-500 font-semibold">
                  <span>WAF Severity Rating</span>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[9px] border ${
                    selectedLog.severity === "Critical" 
                      ? "bg-red-50 text-red-700 border-red-200" 
                      : selectedLog.severity === "Warning" 
                      ? "bg-amber-50 text-amber-700 border-amber-200" 
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}>
                    {selectedLog.severity} Threshold
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
