import axios from 'axios';

// Amiibo API (public, no auth required)
const AMIIBO_BASE = 'https://www.amiiboapi.org/api';

export const amiiboApi = {
  getAll: () => axios.get(`${AMIIBO_BASE}/amiibo/`).then(r => r.data.amiibo),
  getByGameSeries: (series) =>
    axios.get(`${AMIIBO_BASE}/amiibo/?gameseries=${encodeURIComponent(series)}`).then(r => r.data.amiibo),
  getByCharacter: (name) =>
    axios.get(`${AMIIBO_BASE}/amiibo/?character=${encodeURIComponent(name)}`).then(r => r.data.amiibo),
  getGameSeries: () => axios.get(`${AMIIBO_BASE}/gameseries/`).then(r => r.data.amiibo),
  getAmiiboSeries: () => axios.get(`${AMIIBO_BASE}/amiiboseries/`).then(r => r.data.amiibo),
  getDetail: (head, tail) =>
    axios
      .get(`${AMIIBO_BASE}/amiibo/?character=&showusage`)
      .then(r => {
        const list = r.data.amiibo;
        // API returns an array; head+tail is unique so take first element
        return Array.isArray(list) ? list[0] : list;
      }),
};

// Backend API (requires auth for most endpoints)
const API_BASE = import.meta.env.VITE_API_API_URL;

const authHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const authApi = {
  me: () =>
    axios.get(`${API_BASE}/auth/me`, { headers: authHeader() }).then(r => r.data),
  login: (data) =>
    axios.post(`${API_BASE}/auth/sign-in/email`, {
      email: data.email,
      password: data.password,
    }).then(r => r.data),
  signup: (data) =>
    axios.post(`${API_BASE}/auth/sign-up/email`, {
      name: data.username,
      email: data.email,
      password: data.password,
    }).then(r => r.data),
  updatePassword: (data) =>
    axios.post(`${API_BASE}/auth/change-password`, data, { headers: authHeader() }).then(r => r.data),
  updateProfile: (data) =>
    axios.put(`${API_BASE}/auth/profile`, data, { headers: authHeader() }).then(r => r.data),
};

export const collectionApi = {
  getCollection: () =>
    axios.get(`${API_BASE}/collection`, { headers: authHeader() }).then(r => r.data),
  setStatus: (head, tail, status) =>
    axios
      .post(`${API_BASE}/collection`, { head, tail, status }, { headers: authHeader() })
      .then(r => r.data),
  removeStatus: (head, tail, status) =>
    axios
      .delete(`${API_BASE}/collection`, {
        headers: authHeader(),
        data: { head, tail, status },
      })
      .then(r => r.data),
};