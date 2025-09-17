import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "https://crm-construction-api.onrender.com",
  timeout: 15000,
});

async function tryGet(path) {
  try {
    const { data } = await api.get(path);
    return data;
  } catch (e) {
    if (e?.response?.status === 404) return null;
    throw e;
  }
}

export async function getHealth() {
  const { data } = await api.get("/health");
  return data;
}

export async function getDashboard() {
  return await tryGet("/dashboard");
}

// ---- Obras CRUD ----
export async function listObras() {
  return await tryGet("/obras");
}
export async function createObra(payload) {
  const { data } = await api.post("/obras", payload);
  return data;
}
export async function updateObra(id, payload) {
  const { data } = await api.put(`/obras/${id}`, payload);
  return data;
}
export async function deleteObra(id) {
  await api.delete(`/obras/${id}`);
  return true;
}
