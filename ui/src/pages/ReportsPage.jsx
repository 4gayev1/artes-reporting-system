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
  FiDownload
} from "react-icons/fi";

export default function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  /* -------------------- STATE -------------------- */

  const [logoUrl, setLogoUrl] = useState();
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [types, setTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [animateMode, setAnimateMode] = useState(false);
  const [layout, setLayout] = useState("table");
  const [editingReportId, setEditingReportId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 1,
  });

  const PAGE_SIZE_OPTIONS = [10, 20, 50];


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

  /* -------------------- EFFECTS -------------------- */

  useEffect(() => {
    const init = async () => {
      const logoRes = await getLogoURL();
      setLogoUrl(logoRes.data.url);

      const projRes = await getProjects();
      setProjects(projRes.data);

      const typeRes = await getTypes();
      setTypes(typeRes.data);

      fetchReports(filters);
    };

    init();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (debouncedName !== filters.name) {
        handleFilterChange("name", debouncedName);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [debouncedName]);

  /* -------------------- HELPERS -------------------- */

  const fetchReports = async (filterValues) => {
    const res = await getReports(filterValues);

    setReports(res.data.reports);
    setPagination({
      page: res.data.page,
      size: res.data.size,
      total: res.data.total,
      totalPages: res.data.totalPages,
    });
  };

  const syncUrl = (filterValues) => {
    const params = new URLSearchParams();
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value !== "" && value !== null) {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  };

  const handleFilterChange = (name, value) => {
    const newFilters = {
      ...filters,
      [name]: value,
      page: name === "page" ? value : 1,
    };

    setFilters(newFilters);
    syncUrl(newFilters);
    fetchReports(newFilters);
  };

  const changePage = (newPage) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    syncUrl(newFilters);
    fetchReports(newFilters);
  };

  const clearFilter = (name) => {
    if (name === "name") {
      setDebouncedName("");
    }
    handleFilterChange(name, "");
  };

  const toggleDarkMode = () => {
    setAnimateMode(true);
    setDarkMode((prev) => !prev);
    setTimeout(() => setAnimateMode(false), 700);
  };

  const toggleLayout = () =>
    setLayout((prev) => (prev === "grid" ? "table" : "grid"));

  const handleSaveName = async (id) => {
    if (!editingName.trim()) return;

    try {
      await patchName(id, { name: editingName });
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, name: editingName } : r)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setEditingReportId(null);
      setEditingName("");
    }
  };

  const changePageSize = (newSize) => {
    const newFilters = {
      ...filters,
      size: Number(newSize),
      page: 1,
    };
  
    setFilters(newFilters);
    syncUrl(newFilters);
    fetchReports(newFilters);
  };
  

  return (
    <div className="relative min-h-screen overflow-hidden">
      {animateMode && (
        <span className="absolute top-0 right-0 w-12 h-12 rounded-full z-50 animate-circle"></span>
      )}

      <div
        className={`${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"} min-h-screen p-6 sm:p-8 transition-colors duration-500`}
      >
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <a href="/">
              <img src={logoUrl} alt="Logo" className="h-20 rounded-md" />
            </a>
            <h1 className="text-3xl font-bold">Reports Dashboard</h1>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-500 shadow-lg relative overflow-hidden
                ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
            >
              {darkMode ? (
                <FiMoon className="text-xl" />
              ) : (
                <FiSun className="text-xl" />
              )}
            </button>

            {/* Layout Toggle */}
            <button
              onClick={toggleLayout}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-500 shadow-lg
                ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-800"}`}
              title={`Switch to ${layout === "grid" ? "Grid" : "Table"} View`}
            >
              {layout === "grid" ? (
                <FiList className="text-xl" />
              ) : (
                <FiGrid className="text-xl" />
              )}
            </button>

            {/* Add Report */}
            <button
              className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg whitespace-nowrap"
              onClick={() => setShowModal(true)}
            >
              + Add Report
            </button>
          </div>
        </header>

        {/* Filters */}
        <section className="mb-2 flex flex-wrap gap-4">
          {/* Name Input */}
          <div className="relative flex-1 min-w-[220px] max-w-[480px]">
            <input
              type="text"
              placeholder="Report Name"
              value={debouncedName}
              onChange={(e) => setDebouncedName(e.target.value)}
              className={`p-3 pl-12 pr-10 rounded-lg border shadow-md w-full transition-colors duration-500
                ${darkMode ? "bg-gray-800 text-gray-100 border-gray-700" : "bg-white text-gray-900 border-gray-400"}`}
            />
            <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            {filters.name && (
              <FiX
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                onClick={() => clearFilter("name")}
              />
            )}
          </div>

          {/* Project Select */}
          <div className="relative flex-1 min-w-[160px] max-w-[250px]">
            <select
              value={filters.project}
              onChange={(e) => handleFilterChange("project", e.target.value)}
              className={`p-3 pl-10 pr-10 border rounded-lg shadow-md w-full transition-colors duration-500 appearance-none
      ${darkMode ? "bg-gray-800 text-gray-100 border-gray-700" : "bg-white text-gray-900 border-gray-400"}`}
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={Object.keys(p)} value={Object.values(p)}>
                  {Object.values(p)}
                </option>
              ))}
            </select>
            <FiFolder className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            {filters.project && (
              <FiX
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                onClick={() => clearFilter("project")}
              />
            )}
          </div>

          {/* Type Select */}
          <div className="relative flex-1 min-w-[160px] max-w-[250px]">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className={`p-3 pl-10 pr-10 border rounded-lg shadow-md w-full transition-colors duration-500 appearance-none
      ${darkMode ? "bg-gray-800 text-gray-100 border-gray-700" : "bg-white text-gray-900 border-gray-400"}`}
            >
              <option value="">All Types</option>
              {types.map((t) => (
                <option key={Object.keys(t)} value={Object.values(t)}>
                  {Object.values(t)}
                </option>
              ))}
            </select>
            <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            {filters.type && (
              <FiX
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                onClick={() => clearFilter("type")}
              />
            )}
          </div>

          {/* Date Range */}
          <div className="relative flex-1 min-w-[220px] max-w-[350px] flex gap-2 cursor-pointer">
            <div
              className="relative flex-1"
              onClick={() =>
                document.getElementById("fromDateInput")?.showPicker?.()
              }
            >
              <input
                id="fromDateInput"
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                className={`w-full p-3 pl-10 pr-4 border rounded-lg shadow-md transition-colors duration-500
        ${darkMode ? "bg-gray-800 text-gray-100 border-gray-700" : "bg-white text-gray-900 border-gray-400"}`}
              />
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div
              className="relative flex-1"
              onClick={() =>
                document.getElementById("toDateInput")?.showPicker?.()
              }
            >
              <input
                id="toDateInput"
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange("toDate", e.target.value)}
                className={`w-full p-3 pl-10 pr-4 border rounded-lg shadow-md transition-colors duration-500
        ${darkMode ? "bg-gray-800 text-gray-100 border-gray-700" : "bg-white text-gray-900 border-gray-400"}`}
              />
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {(filters.fromDate || filters.toDate) && (
              <FiX
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                onClick={() => {
                  clearFilter("fromDate");
                  clearFilter("toDate");
                }}
              />
            )}
          </div>
        </section>

        <div className="flex justify-end items-center gap-3 my-3">
  <span className={`${darkMode ? "text-gray-300" : "text-gray-700"}`}>
    Rows per page:
  </span>

  <select
    value={filters.size}
    onChange={(e) => changePageSize(e.target.value)}
    className={`p-2 rounded-lg border transition-colors duration-300
      ${
        darkMode
          ? "bg-gray-800 text-gray-100 border-gray-700"
          : "bg-white text-gray-900 border-gray-400"
      }`}
  >
    {PAGE_SIZE_OPTIONS.map((s) => (
      <option key={s} value={s}>
        {s}
      </option>
    ))}
  </select>
</div>

        {/* Reports Layout */}
        {layout === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {reports?.map((r) => (
              <div
                key={r.id}
                className={`rounded-xl shadow-lg p-5 relative transition-colors duration-500
                  ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}
              >
                <div className="flex items-center gap-2">
                  {editingReportId === r.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName(r.id);
                      }}
                      onBlur={() => handleSaveName(r.id)}
                      className={`border px-2 py-1 rounded text-sm w-[50%] focus:outline-none
      ${darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <a
                        href={r.report_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-blue-400 hover:text-blue-300 truncate"
                        title={r.name}
                      >
                        {r.name}
                      </a>
                      <FiEdit
                        className="cursor-pointer text-gray-400 hover:text-gray-600"
                        onClick={() => {
                          setEditingReportId(r.id);
                          setEditingName(r.name);
                        }}
                      />
                      <a href={r.minio_url}>
                      <FiDownload
                        className="cursor-pointer text-gray-400 hover:text-green-500"
                        title="Download report"
                      />
                      </a>
                    </div>
                  )}
                </div>

                <div
                  className={`mt-2 space-y-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  <p className="flex items-center gap-2">
                    <FiFolder /> {r.project}
                  </p>
                  <p className="flex items-center gap-2">
                    <FiTag /> {r.type}
                  </p>
                  <p
                    className={`flex items-center gap-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    <FiCalendar /> {dayjs(r.date).format("YYYY-MM-DD HH:mm:ss")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full flex justify-center ">
            <table
              className={`w-full border-collapse rounded-lg overflow-hidden shadow-md
              transition-colors duration-500
              ${darkMode ? "bg-gray-800 text-gray-100 border border-gray-700" : "bg-white text-gray-900 border border-gray-300"}`}
            >
              <thead>
                <tr
                  className={`${darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"}`}
                >
                  <th className="p-3 text-center">Name</th>
                  <th className="p-3 text-center">Project</th>
                  <th className="p-3 text-center ">Type</th>
                  <th className="p-3 text-center">Date</th>
                </tr>
              </thead>

              <tbody>
                {reports?.map((r) => (
                  <tr
                    key={r.id}
                    className={`${darkMode ? "hover:bg-gray-700 border-gray-700" : "hover:bg-gray-50 border-gray-300"} border-b`}
                  >
                    <td className="p-3 text-center flex justify-center items-center gap-2">
                      {editingReportId === r.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveName(r.id);
                          }}
                          onBlur={() => handleSaveName(r.id)}
                          className={`border px-2 py-1 rounded text-sm w-[30%] focus:outline-none
      ${darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white text-gray-900 border-gray-300"}`}
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <a
                            href={r.report_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-blue-400 hover:text-blue-300 truncate"
                            title={r.name}
                          >
                            {r.name}
                          </a>
                          <FiEdit
                            className="cursor-pointer text-gray-400 hover:text-gray-600"
                            onClick={() => {
                              setEditingReportId(r.id);
                              setEditingName(r.name);
                            }}
                          />
                      <a href={r.minio_url}>
                      <FiDownload
                        className="cursor-pointer text-gray-400 hover:text-green-500"
                        title="Download report"
                      />
                      </a>
                        </div>
                      )}
                    </td>
                    <td className="text-center">{r.project}</td>
                    <td className="text-center">{r.type}</td>
                    <td className="text-center">
                      {dayjs(r.upload_date).format("YYYY-MM-DD HH:mm:ss")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            {/* Prev */}
            <button
              disabled={pagination.page === 1}
              onClick={() => changePage(pagination.page - 1)}
              className={`px-4 py-2 rounded-lg font-medium transition
        ${
          darkMode
            ? "bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
        }`}
            >
              Prev
            </button>

            {/* Page Numbers */}
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => changePage(p)}
                  className={`w-10 h-10 rounded-lg font-semibold transition
            ${
              p === pagination.page
                ? darkMode
                  ? "bg-blue-500 text-white"
                  : "bg-blue-600 text-white"
                : darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
                >
                  {p}
                </button>
              ),
            )}

            {/* Next */}
            <button
              disabled={pagination.page === pagination.totalPages}
              onClick={() => changePage(pagination.page + 1)}
              className={`px-4 py-2 rounded-lg font-medium transition
        ${
          darkMode
            ? "bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
        }`}
            >
              Next
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

      {/* Animations */}
      <style jsx>{`
        @keyframes circle-expand {
          0% {
            transform: scale(0);
            opacity: 0.5;
          }
          100% {
            transform: scale(80);
            opacity: 0;
          }
        }
        .animate-circle {
          position: absolute;
          top: 0;
          right: 0;
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          background: ${darkMode ? "white" : "black"};
          z-index: 50;
          animation: circle-expand 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          pointer-events: none;
        }
        .animate-spin {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
