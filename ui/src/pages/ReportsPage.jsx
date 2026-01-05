import { useEffect, useState } from "react";
import  {
  getReports,
  getProjects,
  getReportById,
  getTypes,
  deleteReportById,
  getLogoURL,
} from "../api";
import dayjs from "dayjs";
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
} from "react-icons/fi";

export default function ReportsPage() {
  const [logoUrl, setLogoUrl] = useState();
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [types, setTypes] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    project: "",
    type: "",
    fromDate: "",
    toDate: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [animateMode, setAnimateMode] = useState(false);
  const [layout, setLayout] = useState("table"); 

  const [debouncedName, setDebouncedName] = useState(filters.name);

  useEffect(() => {
    const handler = setTimeout(() => {
      handleFilterChange("name", debouncedName);
    }, 500); 
  
    return () => clearTimeout(handler); 
  }, [debouncedName]);

  useEffect(() => {

    const fetchLogo = async () => {
      const res = await getLogoURL();
      setLogoUrl(res.data.url);
    }
    fetchLogo()

    const fetchDropdowns = async () => {
      const projRes = await getProjects();
      setProjects(projRes.data);
      const typeRes = await getTypes();
      setTypes(typeRes.data);
    };
    fetchDropdowns();

    fetchReports(filters);
  }, []);

  const fetchReports = async (filterValues) => {
    const res = await getReports(filterValues);
    setReports(res.data);
  };

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    fetchReports(newFilters);
  };

  const clearFilter = (name) => handleFilterChange(name, "");

  const handleDelete = async (id) => {
    await deleteReportById(id);
    fetchReports(filters);
  };

  const toggleDarkMode = () => {
    setAnimateMode(true);
    setDarkMode(!darkMode);
    setTimeout(() => setAnimateMode(false), 700);
  };

  const toggleLayout = () => setLayout(layout === "grid" ? "table" : "grid");

  return (
    <div
      className={`relative min-h-screen transition-colors duration-500 overflow-hidden`}
    >
      {/* Soft-edge circle animation */}
      {animateMode && (
        <span className="absolute top-0 right-0 w-12 h-12 rounded-full z-50 animate-circle"></span>
      )}

      <div
        className={`${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"} min-h-screen p-6 sm:p-8 transition-colors duration-500`}
      >
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <img
              src={logoUrl}
              alt="Logo"
              className="h-20 rounded-md"
            />
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
        <section className="mb-8 flex flex-wrap gap-4">
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

        {/* Reports Layout */}
        {layout === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {reports?.reports?.map((r) => (
              <div
                key={r.id}
                className={`rounded-xl shadow-lg p-5 relative transition-colors duration-500
                  ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"}`}
              >
               <button
                      onClick={async () => {
                        const res = await getReportById(r.id);
                        console.log(res.data.url)
                        window.open(
                          res.data.url,
                          "_blank",
                        );
                      }}
                      className="text-xl font-bold text-blue-400 hover:text-blue-300  bg-transparent border-0 p-0 cursor-pointer"
                    >
                      {r.name}
                    </button>
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
              ${darkMode
                ? "bg-gray-800 text-gray-100 border border-gray-700"
                : "bg-white text-gray-900 border border-gray-300"
              }`}
            >
              <thead>
                <tr
                  className={`${darkMode
                    ? "bg-gray-700 text-gray-100"
                    : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <th className="p-3 text-center">Name</th>
                  <th className="p-3 text-center">Project</th>
                  <th className="p-3 text-center ">Type</th>
                  <th className="p-3 text-center">Date</th>
                </tr>
              </thead>
    
              <tbody >
                {reports?.reports?.map((r) => (
                  <tr
                    key={r.id}
                    className={`${darkMode
                      ? "hover:bg-gray-700 border-gray-700"
                      : "hover:bg-gray-50 border-gray-300"
                    } border-b`}
                  >
                    <td className="p-3 text-center">
                      <button
                        onClick={async () => {
                          const res = await getReportById(r.id);
                          window.open(res.data.url, "_blank");
                        }}
                        className="font-bold text-blue-400 hover:text-blue-300 bg-transparent border-0 p-0 cursor-pointer truncate"
                        title={r.name}
                      >
                        {r.name}
                      </button>
                    </td>
    
                    <td className=" text-center">{r.project}</td>
                    <td className=" text-center">{r.type}</td>
                    <td className=" text-center">
                      {dayjs(r.upload_date).format("YYYY-MM-DD HH:mm:ss")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      `}</style>
    </div>
  );
}
