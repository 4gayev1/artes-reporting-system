import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

export const getLogoURL = () => api.get("/logo-url");
export const getReports = (filters) => api.get("/reports", { params: filters });
export const getReportById = (id) => api.get(`/preview/${id}`);
export const getProjects = () => api.get("/projects");
export const getTypes = () => api.get("/types");
export const getBrowsers = () => api.get("/browsers");
export const getOS = () => api.get("/os");
export const getExecutors = () => api.get("/executors");
export const getEnvironments = () => api.get("/environments");

export const patchName = (id, data) => api.patch(`/report/${id}`, data);

export const addReport = (data) =>
  api.post("/report", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const uploadLogo = (data) =>
  api.post("/logo", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteReportById = (id) => api.delete(`/report/${id}`);
export const deleteFilteredReports = (filters) =>
  api.delete("/reports", { params: filters });

export default api;