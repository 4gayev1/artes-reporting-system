import { useEffect, useState } from "react";
import {
  getReports,
  getProjects,
  getTypes,
  getLogoURL,
  patchName,
} from "../api";
import dayjs from "dayjs";
import { useSearchParams } from "react-router-dom";
import AddReportModal from "../components/AddReportModal";
import ReportCard from "../components/ReportCard";
import {
  FiX,
  FiCalendar,
  FiFolder,
  FiTag,
  FiMoon,
  FiSun,
  FiGrid,
  FiList,
  FiEdit,
  FiDownload,
  FiExternalLink,
  FiChevronDown,
  FiCopy,
} from "react-icons/fi";

const SP = {
  passed: "#22c55e",
  failed: "#ef4444",
  broken: "#f97316",
  skipped: "#a78bfa",
  unknown: "#64748b",
};

// pipeline_status: 0 = success, 1 = failed
function PipelineCell({ status, dark }) {
  if (!status?.pipeline_url && !status?.pipeline_name)
    return (
      <span style={{ color: dark ? "#475569" : "#94a3b8", fontSize: 14 }}>
        —
      </span>
    );
  const ps = status.pipeline_status;
  const sc = ps === 0 ? "#22c55e" : ps === 1 ? "#ef4444" : "#64748b";
  const label = ps === 0 ? "passed" : ps === 1 ? "failed" : "unknown";
  const bn = status.pipeline_build_order
    ? `#${status.pipeline_build_order}`
    : null;
  return (
    <a
      href={status.pipeline_url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 12px",
        borderRadius: 99,
        textDecoration: "none",
        background: `${sc}18`,
        border: `1px solid ${sc}45`,
        transition: "background 0.2s, transform 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${sc}30`;
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = `${sc}18`;
        e.currentTarget.style.transform = "";
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: sc,
          boxShadow: `0 0 6px ${sc}`,
        }}
      />
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: dark ? "#cbd5e1" : "#334155",
          maxWidth: 120,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {status.pipeline_name || "Pipeline"}
      </span>
      {bn && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: sc,
            fontFamily: "monospace",
          }}
        >
          {bn}
        </span>
      )}
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: sc,
          textTransform: "uppercase",
          fontFamily: "monospace",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </span>
      <FiExternalLink size={11} color={sc} />
    </a>
  );
}

function StatusCell({ status }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 5,
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {Object.entries(SP).map(([k, color]) => {
        const val = status?.[k] ?? 0;
        return (
          <span
            key={k}
            title={k}
            style={{
              fontSize: 15,
              fontWeight: 700,
              color,
              background: `${color}18`,
              border: `1px solid ${color}35`,
              borderRadius: 99,
              padding: "2px 9px",
              fontFamily: "monospace",
              opacity: val === 0 ? 0.3 : 1,
            }}
          >
            {val}
          </span>
        );
      })}
    </div>
  );
}

// ── Custom Select ─────────────────────────────────────────────────────────────
function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  icon: Icon,
  dark,
  compact,
}) {
  const [open, setOpen] = useState(false);
  const bg = dark ? "#0d1930" : "#ffffff";
  const bdr = dark ? "#1a2e4a" : "#d1d5db";
  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const hov = dark ? "#1a2e4a" : "#f1f5f9";
  const acc = "#3b82f6";
  const selected = options.find((o) => o.value === value);

  return (
    <div
      style={{
        position: "relative",
        flex: compact ? "0 0 auto" : "1 1 160px",
        maxWidth: compact ? 100 : 240,
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: compact ? "9px 12px" : "11px 14px",
          borderRadius: 12,
          background: bg,
          border: `1.5px solid ${open ? acc : bdr}`,
          color: selected ? txt : sub,
          cursor: "pointer",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: compact ? 14 : 15,
          fontWeight: selected ? 600 : 400,
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: open ? `0 0 0 3px ${acc}22` : "none",
        }}
      >
        {Icon && <Icon size={16} color={sub} style={{ flexShrink: 0 }} />}
        <span
          style={{
            flex: 1,
            textAlign: "left",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selected ? selected.label : placeholder}
        </span>
        {value && !compact && (
          <FiX
            size={13}
            color={sub}
            style={{ flexShrink: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
              setOpen(false);
            }}
          />
        )}
        <FiChevronDown
          size={14}
          color={sub}
          style={{
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              background: dark ? "#0d1930" : "#ffffff",
              border: `1.5px solid ${acc}`,
              borderRadius: 12,
              zIndex: 50,
              overflow: "hidden",
              boxShadow: dark
                ? "0 16px 48px rgba(0,0,0,0.7)"
                : "0 8px 30px rgba(0,0,0,0.13)",
              minWidth: 160,
            }}
          >
            <div
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              style={{
                padding: "11px 14px",
                cursor: "pointer",
                fontSize: 14,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: !value ? acc : sub,
                fontWeight: !value ? 700 : 400,
                background: !value ? `${acc}18` : "transparent",
              }}
              onMouseEnter={(e) => {
                if (value) e.currentTarget.style.background = hov;
              }}
              onMouseLeave={(e) => {
                if (value) e.currentTarget.style.background = "transparent";
              }}
            >
              {placeholder}
            </div>
            <div
              style={{ height: 1, background: dark ? "#1a2e4a" : "#f1f5f9" }}
            />
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  padding: "11px 14px",
                  cursor: "pointer",
                  fontSize: 14,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: value === opt.value ? acc : txt,
                  fontWeight: value === opt.value ? 700 : 400,
                  background: value === opt.value ? `${acc}18` : "transparent",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => {
                  if (value !== opt.value)
                    e.currentTarget.style.background = hov;
                }}
                onMouseLeave={(e) => {
                  if (value !== opt.value)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function DateInput({ value, onChange, placeholder, dark }) {
  const bg = dark ? "#0d1930" : "#ffffff";
  const bdr = dark ? "#1a2e4a" : "#d1d5db";
  const txt = dark ? "#f1f5f9" : "#0f172a";
  const sub = dark ? "#94a3b8" : "#64748b";
  const acc = "#3b82f6";
  return (
    <div style={{ position: "relative", flex: "1 1 150px", maxWidth: 200 }}>
      <FiCalendar
        size={16}
        color={sub}
        style={{
          position: "absolute",
          left: 13,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "11px 14px 11px 38px",
          background: bg,
          border: `1.5px solid ${value ? acc : bdr}`,
          borderRadius: 12,
          color: value ? txt : sub,
          fontSize: 15,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          outline: "none",
          cursor: "pointer",
          boxShadow: value ? `0 0 0 3px ${acc}22` : "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
          colorScheme: dark ? "dark" : "light",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = acc;
          e.target.style.boxShadow = `0 0 0 3px ${acc}22`;
        }}
        onBlur={(e) => {
          if (!value) {
            e.target.style.borderColor = bdr;
            e.target.style.boxShadow = "none";
          }
        }}
      />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [logoUrl, setLogoUrl] = useState();
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [types, setTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [animateMode, setAnimateMode] = useState(false);
  const [layout, setLayout] = useState("grid");
  const [editingReportId, setEditingReportId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 1,
  });
  const PAGE_SIZE_OPTIONS = [10, 20, 50];
  const [copiedId, setCopiedId] = useState(null);

  const [filters, setFilters] = useState(() => ({
    name: searchParams.get("name") || "",
    project: searchParams.get("project") || "",
    type: searchParams.get("type") || "",
    fromDate: searchParams.get("fromDate") || "",
    toDate: searchParams.get("toDate") || "",
    page: Number(searchParams.get("page")) || 1,
    size: Number(searchParams.get("size")) || 20,
  }));
  const [debouncedName, setDebouncedName] = useState(filters.name);

  useEffect(() => {
    const init = async () => {
      const [logoRes, projRes, typeRes] = await Promise.all([
        getLogoURL(),
        getProjects(),
        getTypes(),
      ]);
      setLogoUrl(logoRes.data.url);
      setProjects(projRes.data);
      setTypes(typeRes.data);
      fetchReports(filters);
    };
    init();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (debouncedName !== filters.name)
        handleFilterChange("name", debouncedName);
    }, 500);
    return () => clearTimeout(t);
  }, [debouncedName]);

  const fetchReports = async (f) => {
    const res = await getReports(f);
    setReports(res.data.reports);
    setPagination({
      page: res.data.page,
      size: res.data.size,
      total: res.data.total,
      totalPages: res.data.totalPages,
    });
  };
  const syncUrl = (f) => {
    const p = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => {
      if (v !== "" && v !== null) p.set(k, v);
    });
    setSearchParams(p);
  };
  const handleFilterChange = (name, value) => {
    const nf = { ...filters, [name]: value, page: name === "page" ? value : 1 };
    setFilters(nf);
    syncUrl(nf);
    fetchReports(nf);
  };
  const changePage = (p) => {
    const nf = { ...filters, page: p };
    setFilters(nf);
    syncUrl(nf);
    fetchReports(nf);
  };
  const clearFilter = (name) => {
    if (name === "name") setDebouncedName("");
    handleFilterChange(name, "");
  };
  const toggleDarkMode = () => {
    setAnimateMode(true);
    setDarkMode((p) => !p);
    setTimeout(() => setAnimateMode(false), 700);
  };
  const handleSaveName = async (id) => {
    if (!editingName.trim()) return;
    try {
      await patchName(id, { name: editingName });
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, name: editingName } : r)),
      );
    } catch (e) {
      console.error(e);
    } finally {
      setEditingReportId(null);
      setEditingName("");
    }
  };
  const changePageSize = (s) => {
    const nf = { ...filters, size: Number(s), page: 1 };
    setFilters(nf);
    syncUrl(nf);
    fetchReports(nf);
  };

  const dm = darkMode;
  const pageBg = dm ? "#060e1f" : "#f0f4fa";
  const cardBg = dm ? "#0a1628" : "#ffffff";
  const bdr = dm ? "#1a2e4a" : "#e2e8f0";
  const txtMain = dm ? "#f1f5f9" : "#0f172a";
  const txtSub = dm ? "#cbd5e1" : "#334155";
  const txtMut = dm ? "#E0E0E0" : "#212121";
  const inputBg = dm ? "#0d1930" : "#ffffff";
  const tblHead = dm ? "#0d1930" : "#f8fafc";
  const acc = "#3b82f6";

  const projectOptions = projects.map((p) => ({
    value: Object.values(p)[0],
    label: Object.values(p)[0],
  }));
  const typeOptions = types.map((t) => ({
    value: Object.values(t)[0],
    label: Object.values(t)[0],
  }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        @keyframes circleExp { 0%{transform:scale(0);opacity:.7} 100%{transform:scale(90);opacity:0} }
        .anim-circle { position:fixed;top:0;right:0;width:3rem;height:3rem;border-radius:50%;background:${dm ? "#f1f5f9" : "#060e1f"};z-index:9999;pointer-events:none;animation:circleExp .7s cubic-bezier(.4,0,.2,1) forwards; }
        .pg-btn { transition: background .15s, transform .1s; }
        .pg-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .pg-btn:disabled { opacity:.35; cursor:not-allowed; }
        .tbl-tr:hover td { background: ${dm ? "#0d193090" : "#f8fafc"} !important; }
        .tbl-td { transition: background .12s; }
        .srch:focus { border-color: ${acc} !important; box-shadow: 0 0 0 3px ${acc}22 !important; }
      `}</style>
      {animateMode && <span className="anim-circle" />}

      <div
        style={{
          minHeight: "100vh",
          background: pageBg,
          color: txtMain,
          padding: "28px 32px",
          fontFamily: "'Plus Jakarta Sans',sans-serif",
          transition: "background .4s,color .4s",
        }}
      >
        {/* ── Header ── */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 20,
            background: cardBg,
            borderRadius: 20,
            padding: "20px 28px",
            border: `1.5px solid ${bdr}`,
            boxShadow: dm
              ? "0 8px 40px rgba(0,0,0,0.55)"
              : "0 4px 20px rgba(0,0,0,0.07)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <a href="/">
              <img
                src={logoUrl}
                alt="Logo"
                style={{ height: 80, borderRadius: 14, objectFit: "contain" }}
              />
            </a>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 28,
                  fontWeight: 800,
                  color: txtMain,
                  letterSpacing: "-0.025em",
                }}
              >
                Reports Dashboard
              </h1>
              <p style={{ margin: "4px 0 0", fontSize: 15, color: txtMut }}>
                {pagination.total} report{pagination.total !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {[
              {
                icon: dm ? <FiMoon size={20} /> : <FiSun size={20} />,
                onClick: toggleDarkMode,
                title: "Toggle theme",
              },
              {
                icon:
                  layout === "grid" ? (
                    <FiList size={20} />
                  ) : (
                    <FiGrid size={20} />
                  ),
                onClick: () =>
                  setLayout((l) => (l === "grid" ? "table" : "grid")),
                title: "Toggle layout",
              },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.onClick}
                title={btn.title}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 12,
                  border: `1.5px solid ${bdr}`,
                  background: inputBg,
                  color: txtSub,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "border-color .2s, color .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = acc;
                  e.currentTarget.style.color = txtMain;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = bdr;
                  e.currentTarget.style.color = txtSub;
                }}
              >
                {btn.icon}
              </button>
            ))}
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: "linear-gradient(135deg,#22c55e,#16a34a)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "12px 24px",
                fontWeight: 700,
                fontSize: 16,
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans',sans-serif",
                boxShadow: "0 4px 16px rgba(34,197,94,.4)",
                transition: "transform .15s, box-shadow .15s",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 24px rgba(34,197,94,.55)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(34,197,94,.4)";
              }}
            >
              + Add Report
            </button>
          </div>
        </header>

        {/* ── Filters panel ── */}
        <div
          style={{
            background: cardBg,
            borderRadius: 16,
            padding: "18px 22px",
            border: `1.5px solid ${bdr}`,
            marginBottom: 22,
            boxShadow: dm
              ? "0 4px 20px rgba(0,0,0,.4)"
              : "0 2px 12px rgba(0,0,0,.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
            }}
          >
            {/* Search */}
            <div
              style={{ position: "relative", flex: "1 1 220px", maxWidth: 380 }}
            >
              <FiTag
                size={16}
                color={txtMut}
                style={{
                  position: "absolute",
                  left: 13,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
              <input
                className="srch"
                placeholder="Search reports…"
                value={debouncedName}
                onChange={(e) => setDebouncedName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 36px 11px 40px",
                  background: inputBg,
                  border: `1.5px solid ${bdr}`,
                  borderRadius: 12,
                  color: txtMain,
                  fontSize: 15,
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                  outline: "none",
                  transition: "border-color .2s, box-shadow .2s",
                }}
              />
              {debouncedName && (
                <FiX
                  size={15}
                  color={txtMut}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                  }}
                  onClick={() => clearFilter("name")}
                />
              )}
            </div>

            <CustomSelect
              value={filters.project}
              onChange={(v) => handleFilterChange("project", v)}
              options={projectOptions}
              placeholder="All Projects"
              icon={FiFolder}
              dark={dm}
            />

            <CustomSelect
              value={filters.type}
              onChange={(v) => handleFilterChange("type", v)}
              options={typeOptions}
              placeholder="All Types"
              icon={FiTag}
              dark={dm}
            />

            <DateInput
              value={filters.fromDate}
              onChange={(v) => handleFilterChange("fromDate", v)}
              placeholder="From"
              dark={dm}
            />
            <DateInput
              value={filters.toDate}
              onChange={(v) => handleFilterChange("toDate", v)}
              placeholder="To"
              dark={dm}
            />

            {(filters.fromDate || filters.toDate) && (
              <button
                onClick={() => {
                  clearFilter("fromDate");
                  clearFilter("toDate");
                }}
                style={{
                  background: "none",
                  border: `1.5px solid ${bdr}`,
                  color: txtMut,
                  cursor: "pointer",
                  borderRadius: 10,
                  padding: "9px 12px",
                  fontSize: 15,
                  display: "flex",
                }}
              >
                <FiX />
              </button>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginLeft: "auto",
              }}
            >
              <span
                style={{ fontSize: 14, color: txtMut, whiteSpace: "nowrap" }}
              >
                Per page:
              </span>
              <CustomSelect
                compact
                value={String(filters.size)}
                onChange={(v) => changePageSize(v)}
                options={PAGE_SIZE_OPTIONS.map((s) => ({
                  value: String(s),
                  label: String(s),
                }))}
                placeholder="20"
                dark={dm}
              />
            </div>
          </div>
        </div>

        {/* ── Grid ── */}
        {layout === "grid" ? (
          <div
            style={{
              display: "grid",
              gap: 20,
              gridTemplateColumns: "repeat(auto-fill,minmax(310px,1fr))",
            }}
          >
            {reports?.map((r) => (
              <ReportCard
                key={r.id}
                r={r}
                darkMode={darkMode}
                editingReportId={editingReportId}
                editingName={editingName}
                setEditingName={setEditingName}
                setEditingReportId={setEditingReportId}
                handleSaveName={handleSaveName}
              />
            ))}
          </div>
        ) : (
          /* ── Table ── */
          <div
            style={{
              overflowX: "auto",
              borderRadius: 16,
              border: `1.5px solid ${bdr}`,
              boxShadow: dm
                ? "0 8px 32px rgba(0,0,0,.45)"
                : "0 4px 20px rgba(0,0,0,.06)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: cardBg,
              }}
            >
              <thead>
                <tr style={{ background: tblHead }}>
                  {[
                    "Name",
                    "Project",
                    "Type",
                    "Date",
                    "Test Results",
                    "Pipeline",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "15px 18px",
                        textAlign: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        color: txtMut,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        borderBottom: `1.5px solid ${bdr}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports?.map((r) => (
                  <tr key={r.id} className="tbl-tr">
                    <td
                      className="tbl-td"
                      style={{
                        padding: "14px 18px",
                        borderBottom: `1px solid ${bdr}`,
                        background: cardBg,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        {editingReportId === r.id ? (
                          <input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveName(r.id);
                            }}
                            onBlur={() => handleSaveName(r.id)}
                            autoFocus
                            style={{
                              background: inputBg,
                              border: `1.5px solid ${acc}`,
                              borderRadius: 8,
                              padding: "5px 10px",
                              color: txtMain,
                              fontSize: 14,
                              outline: "none",
                              width: 170,
                              fontFamily: "'Plus Jakarta Sans',sans-serif",
                            }}
                          />
                        ) : (
                          <>
                            <a
                              href={r.report || r.report_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: 15,
                                fontWeight: 700,
                                color: "#60a5fa",
                                textDecoration: "none",
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.color = "#93c5fd")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.color = "#60a5fa")
                              }
                            >
                              {r.name}
                            </a>
                            <FiEdit
                              size={14}
                              color={txtMut}
                              style={{ cursor: "pointer", flexShrink: 0 }}
                              onClick={() => {
                                setEditingReportId(r.id);
                                setEditingName(r.name);
                              }}
                            />
                            <span
                              onClick={() => {
                                const text = r.report || r.report_url;
                                
                                if (navigator.clipboard && navigator.clipboard.writeText) {
                                  navigator.clipboard.writeText(text);
                                } else {
                                  const textarea = document.createElement("textarea");
                                  textarea.value = text;
                                  textarea.style.position = "fixed";
                                  textarea.style.opacity = "0";
                                  document.body.appendChild(textarea);
                                  textarea.focus();
                                  textarea.select();
                                  document.execCommand("copy");
                                  document.body.removeChild(textarea);
                                }
                                
                                setCopiedId(r.id);
                                setTimeout(() => setCopiedId(null), 1500);
                              }}
                              style={{
                                display: "flex",
                                color: copiedId === r.id ? "#22c55e" : txtMut,
                                flexShrink: 0,
                                cursor: "pointer",
                                transition: "color .2s",
                              }}
                              title="Copy report URL"
                            >
                              <FiCopy size={14} />
                            </span>
                            <a
                              href={r.minio || r.minio_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "flex",
                                color: txtMut,
                                flexShrink: 0,
                                transition: "color .2s",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.color = "#22c55e")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.color = txtMut)
                              }
                            >
                              <FiDownload size={14} />
                            </a>
                          </>
                        )}
                      </div>
                    </td>
                    <td
                      className="tbl-td"
                      style={{
                        padding: "14px 18px",
                        textAlign: "center",
                        fontSize: 15,
                        color: txtSub,
                        borderBottom: `1px solid ${bdr}`,
                        background: cardBg,
                      }}
                    >
                      {r.project}
                    </td>
                    <td
                      className="tbl-td"
                      style={{
                        padding: "14px 18px",
                        textAlign: "center",
                        borderBottom: `1px solid ${bdr}`,
                        background: cardBg,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: txtSub,
                          background: dm ? "#1a2e4a" : "#f1f5f9",
                          padding: "3px 10px",
                          borderRadius: 8,
                          fontFamily: "monospace",
                          textTransform: "uppercase",
                        }}
                      >
                        {r.type}
                      </span>
                    </td>
                    <td
                      className="tbl-td"
                      style={{
                        padding: "14px 18px",
                        textAlign: "center",
                        fontSize: 15,
                        color: txtSub,
                        borderBottom: `1px solid ${bdr}`,
                        fontFamily: "monospace",
                        whiteSpace: "nowrap",
                        background: cardBg,
                      }}
                    >
                      {dayjs(r.upload_date).format("D MMM YY · HH:mm")}
                    </td>
                    <td
                      className="tbl-td"
                      style={{
                        padding: "14px 18px",
                        textAlign: "center",
                        borderBottom: `1px solid ${bdr}`,
                        background: cardBg,
                      }}
                    >
                      <StatusCell status={r.status} />
                    </td>
                    <td
                      className="tbl-td"
                      style={{
                        padding: "14px 18px",
                        textAlign: "center",
                        borderBottom: `1px solid ${bdr}`,
                        background: cardBg,
                      }}
                    >
                      <PipelineCell status={r.status} dark={dm} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {pagination.totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              marginTop: 36,
            }}
          >
            <button
              className="pg-btn"
              disabled={pagination.page === 1}
              onClick={() => changePage(pagination.page - 1)}
              style={{
                padding: "10px 22px",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                border: `1.5px solid ${bdr}`,
                background: cardBg,
                color: txtMain,
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans',sans-serif",
              }}
            >
              ← Prev
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  className="pg-btn"
                  onClick={() => changePage(p)}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: 700,
                    border: `1.5px solid ${p === pagination.page ? acc : bdr}`,
                    background: p === pagination.page ? acc : cardBg,
                    color: p === pagination.page ? "#fff" : txtSub,
                    cursor: "pointer",
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                  }}
                >
                  {p}
                </button>
              ),
            )}
            <button
              className="pg-btn"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => changePage(pagination.page + 1)}
              style={{
                padding: "10px 22px",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 600,
                border: `1.5px solid ${bdr}`,
                background: cardBg,
                color: txtMain,
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans',sans-serif",
              }}
            >
              Next →
            </button>
          </div>
        )}

        {showModal && (
          <AddReportModal
            onClose={() => setShowModal(false)}
            onAdd={() => fetchReports(filters)}
            projects={projects}
            types={types}
          />
        )}
      </div>
    </>
  );
}
