import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance — withCredentials so Better Auth cookies are sent on every request
const client = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState({});

  // ── Restore session on mount — Better Auth uses cookies, no localStorage ───
  useEffect(() => {
    client
      .get('/auth/get-session')
      .then((r) => {
        if (r.data?.user) setUser(r.data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Fetch collection whenever user changes ─────────────────────────────────
  const refreshCollection = useCallback(async () => {
    if (!user) { setCollection({}); return; }
    try {
      const { data } = await client.get('/collections');
      const map = {};
      (data || []).forEach(({ amiibo_id, category }) => {
        if (!map[amiibo_id]) map[amiibo_id] = { favorite: false, owned: false, wanted: false };
        map[amiibo_id][category] = true;
      });
      setCollection(map);
    } catch (_) {}
  }, [user]);

  useEffect(() => { refreshCollection(); }, [refreshCollection]);

  // ── Auth actions ───────────────────────────────────────────────────────────
  const signup = async ({ username, email, password }) => {
    const { data } = await client.post('/auth/sign-up/email', {
      name: username,
      email,
      password,
    });
    const u = data?.user || data;
    setUser(u);
    return u;
  };

  const login = async ({ email, password }) => {
    const { data } = await client.post('/auth/sign-in/email', { email, password });
    const u = data?.user || data;
    setUser(u);
    return u;
  };

  const logout = async () => {
    try { await client.post('/auth/sign-out'); } catch (_) {}
    setUser(null);
    setCollection({});
  };

  // ── Profile / password updates ─────────────────────────────────────────────
  const updateProfile = async (payload) => {
    const { data } = await client.put('/auth/profile', payload);
    setUser((prev) => ({ ...prev, ...data }));
    return data;
  };

  const updatePassword = async (payload) => {
    const { data } = await client.post('/auth/change-password', payload);
    return data;
  };

  // ── Collection toggle with optimistic update + rollback ───────────────────
  // amiibo = full amiibo object from amiiboapi.org
  // category = 'favorite' | 'owned' | 'wanted'
  const toggleStatus = async (amiibo, category) => {
    const amiiboId = `${amiibo.head}${amiibo.tail}`;
    const current = collection[amiiboId]?.[category] || false;

    // Optimistic update — also handle owned/wanted mutual exclusivity locally
    setCollection((prev) => {
      const entry = { ...(prev[amiiboId] || { favorite: false, owned: false, wanted: false }) };
      entry[category] = !current;
      // Mirror backend: owned and wanted are mutually exclusive
      if (!current) {
        if (category === 'owned') entry.wanted = false;
        if (category === 'wanted') entry.owned = false;
      }
      return { ...prev, [amiiboId]: entry };
    });

    try {
      if (current) {
        await client.delete('/collections', { data: { amiiboId, category } });
      } else {
        await client.post('/collections', {
          amiiboId,
          amiiboName:   amiibo.name,
          amiiboImage:  amiibo.image,
          amiiboSeries: amiibo.amiiboSeries,
          amiiboType:   amiibo.type,
          category,
        });
      }
    } catch (_) {
      // Rollback on failure
      await refreshCollection();
    }
  };

  const getAmiiboStatus = (amiibo) => {
    const amiiboId = `${amiibo.head}${amiibo.tail}`;
    return collection[amiiboId] || { favorite: false, owned: false, wanted: false };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        collection,
        login,
        signup,
        logout,
        updateProfile,
        updatePassword,
        toggleStatus,
        getAmiiboStatus,
        refreshCollection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);