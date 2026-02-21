import { useState } from "react";
import { addReport } from "../api";
import { FiX, FiUpload, FiLink, FiHash, FiUser } from "react-icons/fi";

const COUNT_FIELDS = [
  { key: "passed",  label: "Passed",  color: "#22c55e" },
  { key: "failed",  label: "Failed",  color: "#ef4444" },
  { key: "broken",  label: "Broken",  color: "#f97316" },
  { key: "skipped", label: "Skipped", color: "#a78bfa" },
  { key: "unknown", label: "Unknown", color: "#64748b" },
];

export default function AddReportModal({ onClose, onAdd, projects, types, darkMode }) {
  const [file, setFile]       = useState(null);
  const [name, setName]       = useState("");
  const [project, setProject] = useState("");
  const [type, setType]       = useState("");
  const [loading, setLoading] = useState(false);

  // Manual test counts
  const [counts, setCounts] = useState({ passed: "", failed: "", broken: "", skipped: "", unknown: "" });

  // Pipeline fields
  const [pipelineStatus, setPipelineStatus] = useState("");
  const [pipelineUrl,    setPipelineUrl]    = useState("");
  const [pipelineName,   setPipelineName]   = useState("");
  const [pipelineOrder,  setPipelineOrder]  = useState("");

  // Focus tracking without hooks in callbacks
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !file) return alert("Name and file are required!");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file",    file);
      formData.append("name",    name);
      formData.append("project", project);
      formData.append("type",    type);

      // Only send manual counts if filled (zip will override)
      Object.entries(counts).forEach(([k, v]) => { if (v !== "") formData.append(k, v); });

      if (pipelineStatus !== "") formData.append("pipeline_status",      pipelineStatus);
      if (pipelineUrl    !== "") formData.append("pipeline_url",         pipelineUrl);
      if (pipelineName   !== "") formData.append("pipeline_name",        pipelineName);
      if (pipelineOrder  !== "") formData.append("pipeline_build_order", pipelineOrder);

      await addReport(formData);
      onAdd();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add report.");
    } finally {
      setLoading(false);
    }
  };

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const dm       = darkMode;
  const bg       = dm ? "#0d1728" : "#ffffff";
  const hBg      = dm ? "#0a1628" : "#f8fafc";
  const bdr      = dm ? "#1a2d4a" : "#e2e8f0";
  const txt      = dm ? "#f1f5f9" : "#0f172a";
  const sub      = dm ? "#94a3b8" : "#374151";
  const mute     = dm ? "#4b6080" : "#9ca3af";
  const inputB   = dm ? "#0a1628" : "#f8fafc";
  const inputBdr = dm ? "#1a2d4a" : "#d1d5db";

  const baseInput = {
    width: "100%", padding: "10px 14px",
    background: inputB, border: `1px solid ${inputBdr}`,
    borderRadius: 10, color: txt, fontSize: 14, fontWeight: 500,
    outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: "border-color .2s, box-shadow .2s",
    boxSizing: "border-box",
  };

  function SectionLabel({ children }) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0 2px" }}>
        <div style={{ flex: 1, height: 1, background: bdr }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: mute, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
          {children}
        </span>
        <div style={{ flex: 1, height: 1, background: bdr }} />
      </div>
    );
  }

  function FieldLabel({ children }) {
    return <label style={{ fontSize: 12, fontWeight: 600, color: sub, textTransform: "uppercase", letterSpacing: "0.05em" }}>{children}</label>;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes modalIn { from{opacity:0;transform:translateY(14px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes spin     { to { transform: rotate(360deg); } }
        .modal-box { animation: modalIn .22s cubic-bezier(.34,1.56,.64,1) both; }
        .modal-box::-webkit-scrollbar { width: 5px; }
        .modal-box::-webkit-scrollbar-thumb { background: ${bdr}; border-radius: 99px; }

        .rp-input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px #3b82f620 !important; }
        .rp-input::placeholder { color: ${mute}; }

        .count-input:focus { box-shadow: 0 0 0 3px var(--focus-glow) !important; border-color: var(--status-color) !important; color: var(--status-color) !important; }
        .count-input::placeholder { color: ${mute}; }

        .upload-label:hover { border-color: #3b82f6 !important; }
        .modal-cancel:hover { background: ${bdr} !important; }
      `}</style>

      <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 50, padding: 20, backdropFilter: "blur(4px)",
      }}>
        <div className="modal-box" style={{
          background: bg, border: `1px solid ${bdr}`,
          borderRadius: 20, width: "100%", maxWidth: 500,
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: dm ? "0 24px 80px #000000aa" : "0 24px 80px #00000022",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          position: "relative",
        }}>

          {/* Loading overlay */}
          {loading && (
            <div style={{
              position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 10, borderRadius: 20,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                border: "4px solid rgba(255,255,255,0.15)",
                borderTopColor: "#22c55e",
                animation: "spin 0.8s linear infinite",
              }} />
            </div>
          )}

          {/* Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 24px 16px", borderBottom: `1px solid ${bdr}`,
            background: hBg, borderRadius: "20px 20px 0 0",
          }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: txt }}>Add New Report</h2>
              <p style={{ margin: "3px 0 0", fontSize: 13, color: mute }}>
                ZIP files auto-extract test data — manual fields are optional fallbacks
              </p>
            </div>
            <button onClick={onClose} disabled={loading} style={{
              background: "none", border: `1px solid ${bdr}`, borderRadius: 8,
              cursor: "pointer", color: mute, padding: 6, display: "flex",
              transition: "background .15s, color .15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = bdr; e.currentTarget.style.color = txt; }}
              onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = mute; }}
            ><FiX size={16} /></button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, padding: "20px 24px 24px" }}>

            {/* ── Report Info ── */}
            <SectionLabel>Report Info</SectionLabel>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <FieldLabel>Report Name *</FieldLabel>
              <input className="rp-input" style={baseInput}
                type="text" value={name} placeholder="e.g. regression-2024-02"
                onChange={e => setName(e.target.value)} disabled={loading} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <FieldLabel>Project</FieldLabel>
                <input className="rp-input" style={baseInput}
                  list="modal-projects" value={project} placeholder="e.g. my-app"
                  onChange={e => setProject(e.target.value)} disabled={loading} />
                <datalist id="modal-projects">
                  {projects.map((p, i) => <option key={i} value={Object.values(p)[0]} />)}
                </datalist>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <FieldLabel>Type</FieldLabel>
                <input className="rp-input" style={baseInput}
                  list="modal-types" value={type} placeholder="e.g. regression"
                  onChange={e => setType(e.target.value)} disabled={loading} />
                <datalist id="modal-types">
                  {types.map((t, i) => <option key={i} value={Object.values(t)[0]} />)}
                </datalist>
              </div>
            </div>

            {/* File upload */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <FieldLabel>Report File *</FieldLabel>
              <label className="upload-label" style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 10, padding: "12px 14px",
                background: inputB,
                border: `2px dashed ${file ? "#22c55e" : inputBdr}`,
                borderRadius: 10, cursor: loading ? "not-allowed" : "pointer",
                transition: "border-color .2s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <FiUpload size={16} color={file ? "#22c55e" : mute} />
                  <span style={{ fontSize: 14, color: file ? (dm ? "#86efac" : "#16a34a") : mute, fontWeight: file ? 600 : 400 }}>
                    {file ? file.name : "Click to choose a file…"}
                  </span>
                </div>
                {file && (
                  <span style={{ fontSize: 11, color: mute, fontFamily: "monospace", flexShrink: 0 }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                )}
                <input type="file" onChange={e => setFile(e.target.files[0])}
                  style={{ display: "none" }} disabled={loading} />
              </label>
            </div>

            {/* ── Pipeline ── */}
            <SectionLabel>Pipeline (optional)</SectionLabel>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {/* CI Name */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <FieldLabel>CI / CD Name</FieldLabel>
                <div style={{ position: "relative" }}>
                  <FiUser size={14} color={mute} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input className="rp-input" style={{ ...baseInput, paddingLeft: 34 }}
                    type="text" value={pipelineName} placeholder="e.g. GitLab CI"
                    onChange={e => setPipelineName(e.target.value)} disabled={loading} />
                </div>
              </div>

              {/* Status toggle */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <FieldLabel>Pipeline Status</FieldLabel>
                <div style={{ display: "flex", gap: 6, height: 41 }}>
                  {[{ val: "0", label: "✓ Success", color: "#22c55e" }, { val: "1", label: "✗ Failed", color: "#ef4444" }].map(opt => (
                    <button key={opt.val} type="button"
                      onClick={() => setPipelineStatus(p => p === opt.val ? "" : opt.val)}
                      style={{
                        flex: 1, borderRadius: 10, fontSize: 13, fontWeight: 700,
                        cursor: "pointer", border: `1px solid`,
                        borderColor: pipelineStatus === opt.val ? opt.color : inputBdr,
                        background: pipelineStatus === opt.val ? `${opt.color}22` : inputB,
                        color: pipelineStatus === opt.val ? opt.color : mute,
                        transition: "all .15s",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >{opt.label}</button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "end" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <FieldLabel>Pipeline URL</FieldLabel>
                <div style={{ position: "relative" }}>
                  <FiLink size={14} color={mute} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input className="rp-input" style={{ ...baseInput, paddingLeft: 34 }}
                    type="text" value={pipelineUrl} placeholder="https://ci.example.com/jobs/123"
                    onChange={e => setPipelineUrl(e.target.value)} disabled={loading} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, width: 90 }}>
                <FieldLabel>Build #</FieldLabel>
                <div style={{ position: "relative" }}>
                  <FiHash size={14} color={mute} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <input className="rp-input" style={{ ...baseInput, paddingLeft: 30 }}
                    type="number" min="1" value={pipelineOrder} placeholder="42"
                    onChange={e => setPipelineOrder(e.target.value)} disabled={loading} />
                </div>
              </div>
            </div>

            {/* ── Test Counts ── */}
            <SectionLabel>Test Counts (optional — auto from ZIP)</SectionLabel>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
              {COUNT_FIELDS.map(({ key, label, color }) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center" }}>
                    {label}
                  </label>
                  <input
                    className="count-input"
                    type="number" min="0"
                    value={counts[key]}
                    placeholder="0"
                    disabled={loading}
                    onChange={e => setCounts(prev => ({ ...prev, [key]: e.target.value }))}
                    style={{
                      "--status-color": color,
                      "--focus-glow": `${color}30`,
                      width: "100%", padding: "10px 6px",
                      background: inputB,
                      border: `1px solid ${counts[key] ? color : inputBdr}`,
                      borderRadius: 10,
                      color: counts[key] ? color : mute,
                      fontSize: 16, fontWeight: 700,
                      outline: "none", textAlign: "center",
                      fontFamily: "monospace",
                      transition: "border-color .2s, color .2s, box-shadow .2s",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}
            </div>

            {/* ── Actions ── */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
              <button type="button" onClick={onClose} disabled={loading}
                className="modal-cancel"
                style={{
                  padding: "10px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
                  border: `1px solid ${bdr}`, background: inputB, color: sub,
                  cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: "background .15s",
                }}>Cancel</button>

              <button type="submit" disabled={loading} style={{
                padding: "10px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                background: loading ? "#16a34a88" : "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#fff", border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: "0 4px 14px #22c55e44",
                transition: "transform .15s, box-shadow .15s",
              }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px #22c55e55"; } }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 14px #22c55e44"; }}
              >{loading ? "Uploading…" : "Add Report"}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}