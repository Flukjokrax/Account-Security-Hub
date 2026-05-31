/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Shield, Sparkles, Terminal, Code2, AlertTriangle, CheckCircle, Database, HelpCircle, Lock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SecurityScoreMetrics } from "../types";

interface SqliPlaygroundProps {
  metrics: SecurityScoreMetrics;
  onUpdateMetrics: (newMetrics: Partial<SecurityScoreMetrics>) => void;
  onAddAuditLog: (action: string, details: string, severity: "Info" | "Warning" | "Critical", status: "Success" | "Failure" | "Blocked") => void;
}

export default function SqliPlayground({
  metrics,
  onUpdateMetrics,
  onAddAuditLog,
}: SqliPlaygroundProps) {
  const [activeTab, setActiveTab] = useState<"sandbox" | "remediation">("sandbox");
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [selectedPayload, setSelectedPayload] = useState("");
  const [dbMode, setDbMode] = useState<"vulnerable" | "parameterized">("vulnerable");

  // Query Execution Output State
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    success: boolean;
    authSuccess: boolean;
    logs: string[];
    returnedData: any[] | null;
    error?: string;
  } | null>(null);

  // Payload Quickselects
  const payloads = [
    {
      label: "Classic Auth Bypass",
      email: "' OR '1'='1",
      pass: "password",
      desc: "Changes WHERE check to always true, ignoring password."
    },
    {
      label: "Comment administration exploit",
      email: "admin@cloudflare.com' --",
      pass: "anything",
      desc: "Splices query stream, commenting out completely the trailing password matches."
    },
    {
      label: "Dangerous Stacked drop payload",
      email: "victim@host.com'; DROP TABLE sessions; --",
      pass: "test",
      desc: "Attempts destructive execution sequence (Only supported on stacked server setups)."
    },
    {
      label: "Safe Authentication (Match)",
      email: "jokraxfluk@gmail.com",
      pass: "correct_password_hash",
      desc: "Valid parameters triggering normal authentication paths."
    }
  ];

  const handleSelectPayload = (pay: typeof payloads[0]) => {
    setInputEmail(pay.email);
    setInputPassword(pay.pass);
    setSelectedPayload(pay.label);
  };

  const handleExecute = () => {
    setIsExecuting(true);
    setExecutionResult(null);

    // Dynamic execution simulation logic
    setTimeout(() => {
      setIsExecuting(false);
      const email = inputEmail.trim();
      const pass = inputPassword.trim();

      const queryLogs: string[] = [];
      let success = true;
      let authSuccess = false;
      let returnedData: any[] | null = null;
      let errorMsg: string | undefined = undefined;

      if (dbMode === "vulnerable") {
        queryLogs.push(`INIT SQL CLIENT: Connecting to development core database...`);
        queryLogs.push(`PREPARE STATEMENT: SELECT * FROM users WHERE email = '${email}' AND password = '${pass}'`);
        queryLogs.push(`DATABASE ENGINE: Executing raw query string without compilation bindings...`);

        // SQL injection detection triggers
        const hasBypass = email.includes("' OR '1'='1") || pass.includes("' OR '1'='1");
        const hasCommentBypass = email.includes("' --") || email.endsWith("'--");
        const hasDrop = email.includes("DROP TABLE") || pass.includes("DROP TABLE");

        if (hasDrop) {
          errorMsg = "SQL Syntax Error: Table 'sessions' dropped. Server returned exit code (1). Stacked statement executed successfully.";
          success = false;
          onAddAuditLog(
            "Destructive SQL Injection Exploited",
            "Vulnerable query database drop query executed from client sandbox. System components compromised.",
            "Critical",
            "Failure"
          );
        } else if (hasBypass) {
          authSuccess = true;
          queryLogs.push("EVALUATION RESULT: '1'='1' yielded TRUE for user constraints.");
          queryLogs.push("RECORD SET MATCHED: Returning all active administrative users from store.");
          returnedData = [
            { id: 1, email: "admin@cloudflare-enterprise.com", role: "SuperAdmin" },
            { id: 2, email: "jokraxfluk@gmail.com", role: "Developer" },
            { id: 3, email: "audit-sso@cloudflare-enterprise.com", role: "ExternalAuditor" }
          ];
          onAddAuditLog(
            "SQL Injection Bypass Accomplished",
            "Auth bypass triggered against vulnerable auth endpoint using classic bypass payload.",
            "Critical",
            "Failure"
          );
        } else if (hasCommentBypass) {
          authSuccess = true;
          queryLogs.push("EVALUATION RESULT: Trailing constraints commented out by '--' delimiter.");
          queryLogs.push("RECORD MATCH: First entry returned by raw parsing sequence.");
          returnedData = [
            { id: 1, email: "admin@cloudflare-enterprise.com", role: "SuperAdmin" }
          ];
          onAddAuditLog(
            "SQL Injection Comment Bypass Executed",
            "Bypassed authentication using inline SQL injection comment block.",
            "Critical",
            "Failure"
          );
        } else if (email === "jokraxfluk@gmail.com" && pass === "correct_password_hash") {
          authSuccess = true;
          queryLogs.push("RECORD MATCH: Valid email parameters detected. Credentials approved.");
          returnedData = [{ id: 2, email: "jokraxfluk@gmail.com", role: "Developer" }];
        } else {
          errorMsg = "Login Refused: Email or password mismatch.";
          success = false;
          queryLogs.push("MATCH RESULT: 0 records matched query parameters.");
        }
      } else {
        // SECURE MODE
        queryLogs.push(`INIT SQL CLIENT: Connecting to development core database...`);
        queryLogs.push(`PREPARE STATEMENT: SELECT id, email, username FROM users WHERE email = ? AND password = ?`);
        queryLogs.push(`PARAMETER INJECTION: Binding parameter values directly into schema markers...`);
        queryLogs.push(`PARAM [1]: "${email}"`);
        queryLogs.push(`PARAM [2]: "${pass}"`);
        queryLogs.push(`DATABASE ENGINE: Analyzing prepared statement boundaries. User input parsed strictly as literal data.`);

        if (email === "jokraxfluk@gmail.com" && pass === "correct_password_hash") {
          authSuccess = true;
          queryLogs.push("RESOLVER STATUS: Valid literal bounds hit. Authenticated!");
          returnedData = [{ id: 2, email: "jokraxfluk@gmail.com", role: "Developer" }];
        } else {
          const literalExploitDetected = email.includes("'") || pass.includes("'");
          if (literalExploitDetected) {
            queryLogs.push(`WARNING DETECTED: Special characters in client input bounded safely. SQL parser bypassed exploit schema entirely.`);
          }
          errorMsg = "Login Refused: No database row matches literal search values.";
          success = false;
          queryLogs.push("RESOLVER STATUS: Complete comparison evaluated 0 matches. User inputs safely quarantined.");
        }
      }

      setExecutionResult({
        success,
        authSuccess,
        logs: queryLogs,
        returnedData,
        error: errorMsg
      });
    }, 1000);
  };

  const handleApplyFix = () => {
    onUpdateMetrics({ codeSecured: true });
    setDbMode("parameterized");
    onAddAuditLog(
      "Code Remediation Complete",
      "Vulnerable string concatenation query refactored into a high-security parameterized prepared statement.",
      "Info",
      "Success"
    );
  };

  return (
    <div id="sqli-playground-root" className="space-y-6">
      
      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-slate-900 font-sans font-bold text-base leading-snug flex items-center gap-2">
            <Code2 className="w-5 h-5 text-orange-500" />
            OWASP A03 Injection Sandbox Review
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Analyze, exploit, and remediate the SQL Authentication Injection vulnerability identified in the static audit
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex gap-2 p-0.5 bg-slate-100 border border-slate-200 rounded">
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`px-3 py-1.5 text-xs rounded font-semibold transition cursor-pointer ${
              activeTab === "sandbox"
                ? "bg-orange-500 text-white shadow font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Exploit Sandbox
          </button>
          
          <button
            onClick={() => setActiveTab("remediation")}
            className={`px-3 py-1.5 text-xs rounded font-semibold transition cursor-pointer ${
              activeTab === "remediation"
                ? "bg-orange-500 text-white shadow font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Remediation Code (Review)
          </button>
        </div>
      </div>

      {activeTab === "sandbox" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Controls Panel (Col 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Simulation configuration details */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-150 flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-slate-400" />
                  <div>
                    <h3 className="text-slate-900 font-sans font-semibold text-xs tracking-wider uppercase">Live Query Constructor</h3>
                    <p className="text-slate-500 text-[11px] mt-0.5">Toggle database mode and type inputs to see query construction in real-time</p>
                  </div>
                </div>

                {/* DB Mode Toggles */}
                <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-lg">
                  <button
                    onClick={() => {
                      setDbMode("vulnerable");
                      setExecutionResult(null);
                    }}
                    className={`px-2..5 px-3 py-1 text-[10px] font-bold tracking-wider uppercase font-mono rounded cursor-pointer ${
                      dbMode === "vulnerable"
                        ? "bg-red-50 text-red-700 border border-red-200 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Vulnerable DB
                  </button>
                  <button
                    onClick={() => {
                      setDbMode("parameterized");
                      setExecutionResult(null);
                    }}
                    className={`px-2...5 px-3 py-1 text-[10px] font-bold tracking-wider uppercase font-mono rounded cursor-pointer ${
                      dbMode === "parameterized"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-250 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Secure DB
                  </button>
                </div>
              </div>

              {/* Sandbox Quick Exploit Grid */}
              <div id="exploit-payload-section" className="mt-5">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-2">Exploit Payloads Quickselect</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {payloads.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectPayload(p)}
                      className={`text-left p-2.5 rounded-lg border transition text-xs flex flex-col gap-0.5 cursor-pointer ${
                        selectedPayload === p.label 
                          ? "bg-orange-50 border-orange-300 text-orange-950" 
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-900"
                      }`}
                    >
                      <span className="font-semibold text-slate-800 font-sans text-[11px]">{p.label}</span>
                      <span className="text-[10px] text-slate-500 font-mono truncate w-full">{p.email}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Input fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">User Email Input</label>
                  <input
                    type="text"
                    value={inputEmail}
                    onChange={(e) => {
                      setInputEmail(e.target.value);
                      setSelectedPayload("");
                    }}
                    placeholder="Enter security email or payload..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-orange-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">User Password Input</label>
                  <input
                    type="text"
                    value={inputPassword}
                    onChange={(e) => {
                      setInputPassword(e.target.value);
                      setSelectedPayload("");
                    }}
                    placeholder="Enter password..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded px-3 py-2 focus:outline-none focus:border-orange-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Live Query Generation Display */}
              <div className="mt-6 bg-slate-900 rounded-lg p-4 border border-slate-950 relative overflow-hidden">
                <div className="absolute right-3 top-3 text-[9px] uppercase font-mono text-slate-400 flex items-center gap-1 bg-slate-850 px-2 py-0.5 rounded-sm">
                  <Terminal className="w-3 h-3 text-orange-400" />
                  <span>Real-time Code SQL Generator</span>
                </div>
                
                <div className="space-y-4 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block mb-1 uppercase text-[10px] font-bold">Client Input Code Parsing:</span>
                    {dbMode === "vulnerable" ? (
                      <code className="text-red-400 block select-all overflow-x-auto whitespace-pre">
                        {`const query = "SELECT * FROM users WHERE email = '" + req.body.email + "' AND password = '" + req.body.password + "'";`}
                      </code>
                    ) : (
                      <code className="text-emerald-400 block select-all overflow-x-auto whitespace-pre">
                        {`const query = "SELECT id, email, username FROM users WHERE email = ? AND password = ?";\nconst queryParams = [req.body.email, req.body.password];`}
                      </code>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1 uppercase text-[10px] font-bold">Constructed Query Sent to Engine:</span>
                    {dbMode === "vulnerable" ? (
                      <code className="text-slate-100 block select-all overflow-x-auto whitespace-pre bg-slate-950/60 p-2.5 border border-slate-950 rounded">
                        {`SELECT * FROM users WHERE email = '${inputEmail || "..."}' AND password = '${inputPassword || "..."}'`}
                      </code>
                    ) : (
                      <code className="text-slate-100 block select-all overflow-x-auto whitespace-pre bg-slate-950/60 p-2.5 border border-slate-950 rounded">
                        {`SELECT id, email, username FROM users WHERE email = ? AND password = ?\n-- Bound values: ["${inputEmail || ""}", "${inputPassword || ""}"]`}
                      </code>
                    )}
                  </div>
                </div>
              </div>

              {/* Execute / Apply Fix actions */}
              <div className="pt-6 border-t border-slate-100 mt-6 flex flex-col sm:flex-row gap-3 justify-between items-center bg-white">
                <button
                  onClick={handleExecute}
                  disabled={isExecuting || (!inputEmail && !inputPassword)}
                  className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-sans text-xs px-4 py-2 rounded font-semibold transition active:scale-95 disabled:opacity-50 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  {isExecuting ? "Executing database transaction..." : "Test exploit against Sandbox"}
                </button>

                {!metrics.codeSecured ? (
                  <button
                    onClick={handleApplyFix}
                    className="w-full sm:w-auto bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-sans text-xs px-4 py-2 rounded font-semibold transition animate-pulse hover:shadow"
                  >
                    Apply Parameterizer Fix (+30 Score)
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-250 text-xs font-bold font-mono">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    Code Secured
                  </div>
                )}
              </div>
            </div>

            {/* Live sandbox result logs output */}
            <AnimatePresence>
              {executionResult && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 space-y-4"
                >
                  <h4 className="text-slate-900 font-sans font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-orange-500 animate-pulse" />
                    Simulated Console Output log
                  </h4>

                  <div className="bg-slate-950 font-mono text-[11px] p-4 rounded-lg border border-slate-900 space-y-2 overflow-x-auto max-h-48 overflow-y-auto shadow-inner text-slate-300">
                    {executionResult.logs.map((log, lidx) => (
                      <p key={lidx}>
                        <span className="text-slate-500 block sm:inline mr-2">[{new Date().toLocaleTimeString()}]</span>
                        {log}
                      </p>
                    ))}
                    {executionResult.error && (
                      <p className="text-red-400 font-semibold">{executionResult.error}</p>
                    )}
                  </div>

                  {/* Auth outcomes */}
                  {executionResult.authSuccess ? (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-950 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 font-sans font-bold text-xs text-red-700">
                          <AlertTriangle className="w-4 h-4 text-red-650 shrink-0" />
                          CRITICAL: Auth Bypass Accomplished successfully
                        </div>
                        <p className="text-[11px] mt-1 text-red-800 leading-relaxed font-sans font-medium">
                          Database accepted exploit syntax parameters. Admin role was returned because parameter boundaries merged directly into statement query branches.
                        </p>
                      </div>

                      {/* Display retrieved records */}
                      {executionResult.returnedData && (
                        <div className="bg-white border border-slate-200 p-2.5 rounded text-[10px] font-mono text-slate-850 min-w-[200px] shadow-sm">
                          <span className="text-slate-500 font-bold block mb-1 border-b border-slate-100 pb-1 uppercase tracking-wider">RECORDS RECEIVED</span>
                          {executionResult.returnedData.map((d, index) => (
                            <div key={index} className="flex justify-between gap-4 mt-0.5 text-red-700 font-semibold">
                              <span>{d.email.split("@")[0]}</span>
                              <span className="text-red-600 font-bold">{d.role}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    !executionResult.error && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-lg">
                        <div className="flex items-center gap-1.5 font-sans font-bold text-xs text-emerald-700">
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                          SECURE: Query safely parsed by Parameterized Bounds
                        </div>
                        <p className="text-[11px] mt-1 text-emerald-800 leading-relaxed font-sans font-medium">
                          The SQL driver bound user parameters into pre-compiled structures. Special query tokens such as quotes or parentheses were evaluated strictly as harmless text entries, rendering structural exploits completely useless.
                        </p>
                      </div>
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Education side panel (Col 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Vulnerability Summary scorecard */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
              <span className="text-slate-500 text-[10px] uppercase font-mono font-bold tracking-wider block">Severity Audit Rating</span>
              <h3 className="text-slate-900 font-sans text-sm font-semibold mt-1">OWASP A03 SQL Injection</h3>
              
              <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">CVST v3</span>
                  <span className="text-lg font-sans font-extrabold tracking-tight">9.8</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded p-2 text-slate-700">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Exploitability</span>
                  <span className="text-xs font-sans font-semibold">Critical Threat</span>
                </div>
              </div>

              <div className="mt-6 space-y-3 font-sans text-xs text-slate-600">
                <p className="font-sans font-medium">
                  <strong>Why does this load?</strong> Direct concatenation links program directives together with user inputs. 
                </p>
                <p className="font-sans font-medium">
                  Because the SQL server parses single quotes to wrap string constraints, injection payloads trick the engine into interpreting user inputs as executable commands.
                </p>
                <div className="pt-3 border-t border-slate-100">
                  <span className="font-bold text-slate-800 block mb-1">Defense vector checklist:</span>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500 leading-relaxed font-medium">
                    <li>Parameterized Prepared Statements</li>
                    <li>Robust Bcrypt password hashing</li>
                    <li>Minimized column selections (No SELECT *)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Cloudflare WAF block quote */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 text-[11px] text-slate-600 leading-relaxed space-y-2">
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                <Shield className="w-3.5 h-3.5 text-orange-500" />
                <span>WAF Edge Interceptors</span>
              </div>
              <p className="font-sans font-medium">
                Before queries reach backends, Cloudflare WAF layers inspect input parameters, quarantining common patterns like single quotes coupled with boolean tautologies (e.g. `' OR '1'='1`). However, code-level parameters remain the gold standard.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Remediation code tab (using precisely the recommended code from static audit) */
        <div id="remediation-tab-root" className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 space-y-8">
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-mono font-bold tracking-widest block">Audit Refactoring Recommendation</span>
            <h3 className="text-slate-900 font-sans text-xs font-semibold tracking-wider uppercase mt-1">Refactored Secure Login Code Segment</h3>
            <p className="text-slate-500 text-xs mt-1">
              Below is the corrected secure implementation using standard parameterized prepared statement parameters, preventing injection bugs completely.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            
            {/* Displaying Code */}
            <div className="bg-slate-900 border border-slate-950 p-4 rounded-xl relative overflow-hidden">
              <div className="absolute right-3 top-3 text-[9px] uppercase font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Secure Controller Snippet</span>
              </div>
              
              <pre className="font-mono text-[11.5px] text-slate-100 leading-relaxed overflow-x-auto whitespace-pre pt-4">
{`// Refactored secure login code segment
app.post("/auth/login", (req, res) => {
  // Use placeholders (?) to represent parameters safely
  const query = "SELECT id, email, username FROM users WHERE email = ? AND password = ?";
  const queryParams = [req.body.email, req.body.password];

  // Pass parameters as a separate array to the database driver
  db.query(query, queryParams, (err, result) => {
    if (err) {
      // Log error internally, return generic error to user
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result && result.length > 0) {
      // Avoid returning the entire user object to the client
      res.json({ success: true, user: result[0] });
    } else {
      res.status(401).json({ error: "Access Refused" });
    }
  });
});`}
              </pre>
            </div>

            {/* In-depth remediation documentation */}
            <div className="space-y-4 text-xs leading-relaxed text-slate-600 font-sans font-medium">
              
              <div className="space-y-1">
                <h4 className="text-slate-900 font-semibold font-sans">1. Prepared Statements (Parameterization)</h4>
                <p>
                  Parameterized engines precompile the structural outline of the query structure on the DB. When variables arrive separately, the compiler reads them solely as parameters (literal string data), meaning special characters lose program command abilities completely.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="text-slate-900 font-semibold font-sans">2. Minimize Exposed Columns (SELECT Specifics)</h4>
                <p>
                  Avoid `SELECT *` patterns. Retrieve solely index information or usernames (`SELECT id, email, username`). This safeguards secret fields (such as pass-hashes) from leaking on response blocks.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="text-slate-900 font-semibold font-sans">3. Password Hashing (Cryptographic Checkpoints)</h4>
                <p>
                  Passwords should never reside as cleartext in your database stores. Check inputs via secure slow comparison libraries (like **Bcrypt** or **Argon2**):
                </p>
                <div className="bg-slate-950 border border-slate-905 rounded p-2 text-[10px] font-mono text-slate-300 mt-2">
                  {`// Best practice check block\nconst verify = await bcrypt.compare(req.body.password, user.passwordHash);`}
                </div>
              </div>

              {!metrics.codeSecured && (
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={handleApplyFix}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-sans text-xs px-4 py-2 rounded font-semibold transition active:scale-95 cursor-pointer"
                  >
                    Harden system: Apply Parameterizer Fix now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
