import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api/accounts",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export const findAccount = (id) => API.get(`/${encodeURIComponent(id)}`);
export const createAccount = (data) => API.post("", data);
export const updateAccount = (id, data) => API.put(`/${encodeURIComponent(id)}`, data);
export const deleteAccount = (id) => API.delete(`/${encodeURIComponent(id)}`);

export const depositMoney = (id, amount) =>
  API.post(`/${encodeURIComponent(id)}/deposit`, { amount: Number(amount) });

export const withdrawMoney = (id, amount) =>
  API.post(`/${encodeURIComponent(id)}/withdraw`, { amount: Number(amount) });

export const findBalance = (id) => API.get(`/${encodeURIComponent(id)}/balance`);
export const listTransactions = (id) => API.get(`/${encodeURIComponent(id)}/history`);

export const searchAccounts = ({ keyword = "", page = 0, size = 100 } = {}) =>
  API.get("/search", { params: { keyword: keyword || undefined, page, size } });

export const searchTransactions = (id, { type = "", dateFrom = "", dateTo = "", page = 0, size = 100 } = {}) =>
  API.get(`/${encodeURIComponent(id)}/transactions`, {
    params: {
      type: type || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page,
      size,
    },
  });

export const readError = (error, fallback = "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์") => {
  if (error.response?.data) {
    if (typeof error.response.data === "string") return error.response.data;
    if (error.response.data.error) return error.response.data.error;
    if (error.response.data.message) return error.response.data.message;
  }
  return error.message || fallback;
};

export const readFieldErrors = (error) => {
  if (error.response?.data?.fieldErrors) {
    return error.response.data.fieldErrors;
  }
  return {};
};

export default API;
