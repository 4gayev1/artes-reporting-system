import { useState } from "react";
import dayjs from "dayjs";
import { FiEdit, FiDownload, FiExternalLink, FiCopy } from "react-icons/fi";

// ── CI detection ──────────────────────────────────────────────────────────────
const CI_MAP = [
  ["github", { color: "#e2e8f0", label: "GitHub Actions" }],
  ["gitlab", { color: "#fc6d26", label: "GitLab CI" }],
  ["jenkins", { color: "#ef4444", label: "Jenkins" }],
  ["circleci", { color: "#02d4a0", label: "CircleCI" }],
  ["azure", { color: "#0078d4", label: "Azure Pipelines" }],
  ["bitbucket", { color: "#0052cc", label: "Bitbucket" }],
  ["teamcity", { color: "#21d789", label: "TeamCity" }],
  ["travis", { color: "#3eaaaf", label: "Travis CI" }],
  ["drone", { color: "#8b5cf6", label: "Drone CI" }],
];

function detectCI(name, url) {
  const hay = ((name || "") + (url || "")).toLowerCase();
  const hit = CI_MAP.find(([k]) => hay.includes(k));
  return hit ? hit[1] : { color: "#94a3b8", label: name || "Pipeline" };
}

// ── Status config: pipeline_status 0 = success, 1 = failed ───────────────────
const S = {
  passed: { color: "#22c55e", label: "Passed" },
  failed: { color: "#ef4444", label: "Failed" },
  broken: { color: "#f97316", label: "Broken" },
  skipped: { color: "#a78bfa", label: "Skipped" },
  unknown: { color: "#64748b", label: "Unknown" },
};

// ── Interactive Donut ─────────────────────────────────────────────────────────
function Donut({ data, total, dark }) {
  const [hov, setHov] = useState(null);
  const SIZE = 100,
    R = 36,
    cx = SIZE / 2,
    cy = SIZE / 2;
  const circ = 2 * Math.PI * R;

  const segments = [];
  let offset = 0;
  Object.entries(data).forEach(([k, v]) => {
    if (v <= 0) return;
    const dash = (v / total) * circ;
    segments.push({ k, v, dash, gap: circ - dash, offset, color: S[k].color });
    offset += dash;
  });

  const passedPct =
    total > 0 ? Math.round(((data.passed || 0) / total) * 100) : 0;
  const hovSeg = hov ? segments.find((s) => s.k === hov) : null;

  if (total === 0)
    return (
      <svg width={SIZE} height={SIZE}>
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke={dark ? "#1e293b" : "#e2e8f0"}
          strokeWidth={10}
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="12"
          fill={dark ? "#475569" : "#94a3b8"}
          fontFamily="monospace"
          fontWeight="700"
        >
          N/A
        </text>
      </svg>
    );

  return (
    <div
      style={{ position: "relative", width: SIZE, height: SIZE, flexShrink: 0 }}
    >
      <svg width={SIZE} height={SIZE} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke={dark ? "#1e293b" : "#e2e8f0"}
          strokeWidth={10}
        />
        {segments.map((seg) => (
          <circle
            key={seg.k}
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke={seg.color}
            strokeWidth={hov === seg.k ? 14 : 10}
            strokeDasharray={`${seg.dash} ${seg.gap}`}
            strokeDashoffset={-seg.offset}
            strokeLinecap="butt"
            style={{
              transition: "stroke-width 0.15s, opacity 0.15s",
              opacity: hov && hov !== seg.k ? 0.25 : 1,
              cursor: "pointer",
            }}
            onMouseEnter={() => setHov(seg.k)}
            onMouseLeave={() => setHov(null)}
          />
        ))}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        {hovSeg ? (
          <>
            <span
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: hovSeg.color,
                fontFamily: "monospace",
                lineHeight: 1.1,
              }}
            >
              {hovSeg.v}
            </span>
            <span
              style={{
                fontSize: 9,
                color: dark ? "#64748b" : "#94a3b8",
                fontFamily: "monospace",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {S[hovSeg.k].label}
            </span>
          </>
        ) : (
          <>
            <span
              style={{
                fontSize: 19,
                fontWeight: 800,
                color: dark ? "#f1f5f9" : "#0f172a",
                fontFamily: "monospace",
                lineHeight: 1.1,
              }}
            >
              {passedPct}%
            </span>
            <span
              style={{
                fontSize: 9,
                color: dark ? "#475569" : "#94a3b8",
                fontFamily: "monospace",
              }}
            >
              pass rate
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ── Segmented bar + stat pills ────────────────────────────────────────────────
function StatRow({ data, total, dark }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Bar */}
      <div
        style={{
          height: 6,
          borderRadius: 99,
          overflow: "hidden",
          background: dark ? "#1e293b" : "#e2e8f0",
          display: "flex",
        }}
      >
        {Object.entries(data).map(
          ([k, v]) =>
            v > 0 && (
              <div
                key={k}
                title={`${S[k].label}: ${v}`}
                style={{
                  width: `${(v / total) * 100}%`,
                  background: S[k].color,
                  transition: "width 0.4s",
                }}
              />
            ),
        )}
      </div>
      {/* Pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {Object.entries(data).map(([k, v]) => (
          <span
            key={k}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 10px",
              borderRadius: 99,
              background: `${S[k].color}18`,
              border: `1px solid ${S[k].color}40`,
              opacity: v === 0 ? 0.4 : 1,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: S[k].color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: S[k].color,
                fontFamily: "monospace",
                marginBottom: 2,
              }}
            >
              {v}
            </span>
            <span
              style={{
                fontSize: 13,
                color: dark ? "#94a3b8" : "#475569",
                fontFamily: "monospace",
              }}
            >
              {S[k].label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Pipeline badge ─────────────────────────────────────────────────────────────
// pipeline_status: 0 = success (green), 1 = failed (red), null = unknown
function PipelineBadge({ status, dark }) {
  if (!status?.pipeline_url && !status?.pipeline_name) return null;

  const ci = detectCI(status.pipeline_name, status.pipeline_url);

  // 0 = success, 1 = failed
  const ps = status.pipeline_status;
  const isSuccess = ps === 0;
  const isFailure = ps === 1;
  const sc = isSuccess ? "#22c55e" : isFailure ? "#ef4444" : "#64748b";
  const statusLabel = isSuccess ? "passed" : isFailure ? "failed" : "unknown";

  const bn = status.pipeline_build_order
    ? `#${status.pipeline_build_order}`
    : null;

  return (
    <a
      href={status.pipeline_url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        borderRadius: 10,
        background: dark ? "#0a1628" : "#f8fafc",
        border: `1px solid ${sc}40`,
        textDecoration: "none",
        transition: "border-color 0.2s, transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = sc;
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = `0 4px 12px ${sc}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${sc}40`;
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {/* Status dot */}
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: sc,
          boxShadow: `0 0 7px ${sc}`,
          flexShrink: 0,
          animation: isSuccess ? "pulseDot 2s infinite" : "none",
        }}
      />

      {/* CI name */}
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: ci.color,
          fontFamily: "monospace",
          flex: 1,
        }}
      >
        {ci.label}
      </span>

      {/* Build number */}
      {bn && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: sc,
            marginBottom: 3,
            fontFamily: "monospace",
            background: `${sc}18`,
            padding: "1px 7px",
            borderRadius: 6,
          }}
        >
          {bn}
        </span>
      )}

      {/* Status label */}
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: sc,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontFamily: "monospace",
        }}
      >
        {statusLabel}
      </span>

      <FiExternalLink size={12} color={dark ? "#475569" : "#94a3b8"} />
    </a>
  );
}

// ── Main ReportCard ────────────────────────────────────────────────────────────
export default function ReportCard({
  r,
  darkMode,
  editingReportId,
  editingName,
  setEditingName,
  setEditingReportId,
  handleSaveName,
}) {
  const status = r.status || {};
  const [copiedId, setCopiedId] = useState(null);
  const data = {
    passed: status.passed ?? 0,
    failed: status.failed ?? 0,
    broken: status.broken ?? 0,
    skipped: status.skipped ?? 0,
    unknown: status.unknown ?? 0,
  };
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const hasPipelineStatus =
    status.pipeline_status === 0 || status.pipeline_status === 1;
  const accent = hasPipelineStatus
    ? status.pipeline_status === 0
      ? "#22c55e"
      : "#ef4444"
    : total === 0
      ? "#475569"
      : data.failed === 0 && data.broken === 0
        ? "#22c55e"
        : "#ef4444";

  const dm = darkMode;
  const bg = dm ? "#0d1930" : "#ffffff";
  const border = dm ? "#1a2e4a" : "#e2e8f0";
  const txtMain = dm ? "#f1f5f9" : "#0f172a";
  const txtMuted = dm ? "#E0E0E0" : "#212121";
  const divider = dm ? "#1a2e4a" : "#f1f5f9";
  const inputBg = dm ? "#1a2e4a" : "#f8fafc";
  const editing = editingReportId === r.id;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes rcIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseDot { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .rc { animation: rcIn .28s ease both; transition: transform .2s, box-shadow .2s; }
        .rc:hover { transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,0,0,0.3) !important; }
        .rc-dl { transition: color 0.2s; }
        .rc-dl:hover { color: #22c55e !important; }
        .rc-ed { transition: color 0.2s; }
        .rc-ed:hover { color: #60a5fa !important; }
      `}</style>

      <div
        className="rc"
        style={{
          background: bg,
          border: `1px solid ${border}`,
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: dm
            ? "0 4px 24px rgba(0,0,0,0.5)"
            : "0 4px 20px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          minWidth: 0,
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            height: 4,
            background: `linear-gradient(90deg, ${accent}, ${accent}33)`,
          }}
        />

        <div
          style={{
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            flex: 1,
          }}
        >
          {/* ── Header ── */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Breadcrumb */}
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: txtMuted,
                  background: dm ? "#1a2e4a" : "#f1f5f9",
                  padding: "2px 8px",
                  borderRadius: 6,
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                }}
              >
                {r.type}
              </span>

              {/* Name */}
              {editing ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName(r.id);
                      if (e.key === "Escape") setEditingReportId(null);
                    }}
                    onBlur={() => handleSaveName(r.id)}
                    autoFocus
                    style={{
                      flex: 1,
                      background: inputBg,
                      border: `1.5px solid ${accent}66`,
                      borderRadius: 8,
                      padding: "5px 10px",
                      marginTop: 4,
                      color: txtMain,
                      fontSize: 15,
                      fontWeight: 700,
                      outline: "none",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  />
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <a
                    href={r.report || r.report_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: txtMain,
                      textDecoration: "none",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      transition: "color 0.15s",
                    }}
                    title={r.name}
                    onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = txtMain)
                    }
                  >
                    {r.name}
                  </a>
                  <button
                    className="rc-ed"
                    onClick={() => {
                      setEditingReportId(r.id);
                      setEditingName(r.name);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 3,
                      cursor: "pointer",
                      color: txtMuted,
                      display: "flex",
                      flexShrink: 0,
                    }}
                  >
                    <FiEdit size={14} />
                  </button>
                  <button
                    className="rc-cp"
                    onClick={() => {
                      navigator.clipboard.writeText(r.report || r.report_url);
                      setCopiedId(r.id);
                      setTimeout(() => setCopiedId(null), 1500);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 3,
                      cursor: "pointer",
                      color: copiedId === r.id ? "#22c55e" : txtMuted,
                      display: "flex",
                      flexShrink: 0,
                      transition: "color 0.2s",
                    }}
                    title="Copy report URL"
                  >
                    <FiCopy size={14} />
                  </button>
                  <a
                    href={r.minio || r.minio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rc-dl"
                    style={{
                      display: "flex",
                      padding: 3,
                      color: txtMuted,
                      flexShrink: 0,
                    }}
                    title="Download"
                  >
                    <FiDownload size={14} />
                  </a>
                </div>
              )}

              {/* Date */}
              <p
                style={{
                  fontSize: 14,
                  color: txtMuted,
                  marginTop: 5,
                  fontFamily: "monospace",
                }}
              >
                {dayjs(r.upload_date).format("D MMM YYYY · HH:mm")}
              </p>
            </div>

            {/* Donut */}
            <Donut data={data} total={total} dark={dm} />
          </div>

          {/* ── Divider ── */}
          <div style={{ height: 1, background: divider }} />

          {/* ── Stats ── */}
          {total > 0 ? (
            <StatRow data={data} total={total} dark={dm} />
          ) : (
            <p
              style={{
                fontSize: 13,
                color: txtMuted,
                fontFamily: "monospace",
                margin: 0,
              }}
            >
              No test data
            </p>
          )}

          {/* ── Pipeline ── */}
          {(status.pipeline_url || status.pipeline_name) && (
            <>
              <div style={{ height: 1, background: divider }} />
              <PipelineBadge status={status} dark={dm} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
