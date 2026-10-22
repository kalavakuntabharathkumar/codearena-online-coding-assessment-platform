import { useEffect, useState } from "react";

type Submission = { id: string; status: string; result?: { message?: string; verdict?: string } };
const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export default function App() {
  const [candidateId, setCandidateId] = useState("candidate-demo");
  const [language, setLanguage] = useState("python");
  const [sourceCode, setSourceCode] = useState("print(1 + 1)");
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!submission?.id || submission.status === "accepted") return;
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`${API}/api/submissions/${submission.id}`);
        if (response.ok) setSubmission(await response.json());
      } catch { /* API may restart during local development. */ }
    }, 1200);
    return () => window.clearInterval(timer);
  }, [submission?.id, submission?.status]);

  async function submit() {
    setLoading(true); setError(""); setSubmission(null);
    try {
      const response = await fetch(`${API}/api/submissions`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, language, sourceCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Could not submit code");
      setSubmission(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Unknown error"); }
    finally { setLoading(false); }
  }

  return <main className="shell">
    <header><div className="brand-mark">CA</div><div><p className="eyebrow">ASSESSMENT WORKSPACE</p><h1>CodeArena</h1></div><span className="pill">Demo environment</span></header>
    <section className="hero"><div><p className="eyebrow">CODING CHALLENGE · #001</p><h2>Two Sum Warm-up</h2><p>Submit a solution to see the asynchronous queue workflow in action.</p></div><div className="hero-icon">{"{ }"}</div></section>
    <section className="workspace">
      <div className="editor-panel">
        <div className="panel-heading"><span>Solution editor</span><select value={language} onChange={e => setLanguage(e.target.value)}><option value="python">Python 3</option><option value="javascript">JavaScript</option></select></div>
        <label>Candidate ID<input value={candidateId} onChange={e => setCandidateId(e.target.value)} /></label>
        <textarea spellCheck={false} value={sourceCode} onChange={e => setSourceCode(e.target.value)} aria-label="Source code" />
        <div className="editor-footer"><span>UTF-8 · {sourceCode.length} characters</span><button onClick={submit} disabled={loading || !sourceCode.trim()}>{loading ? "Submitting…" : "▶  Submit solution"}</button></div>
      </div>
      <aside className="result-panel"><p className="eyebrow">SUBMISSION STATUS</p><h3>{submission ? submission.status.replace("_", " ") : "Ready when you are"}</h3><p className="muted">{submission ? `ID: ${submission.id}` : "Your submission will be queued and processed by a background worker."}</p>
        {submission && <div className="result-card"><strong>Worker response</strong><p>{submission.result?.message ?? "Job accepted into the Redis queue. Waiting for worker…"}</p>{submission.result?.verdict && <span className="tag">{submission.result.verdict}</span>}</div>}
        {error && <p className="error">{error}</p>}
        <div className="pipeline"><div className="step"><span>1</span><div><strong>REST API</strong><small>Validate & persist</small></div></div><div className="connector" /><div className="step"><span>2</span><div><strong>Redis queue</strong><small>Schedule judge job</small></div></div><div className="connector" /><div className="step"><span>3</span><div><strong>Worker</strong><small>Process demo result</small></div></div></div>
        <p className="notice">This starter does not execute arbitrary code. The verdict is a workflow demo only.</p>
      </aside>
    </section>
    <footer>CodeArena · Portfolio starter · React + Express + PostgreSQL + Redis</footer>
  </main>;
}
