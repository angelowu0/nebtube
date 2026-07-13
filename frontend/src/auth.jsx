import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext.js";
import * as api from "./api";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("nebtube_token"));
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(() => !token);

  useEffect(() => {
    if (!token) return;
    api
      .fetchMe(token)
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem("nebtube_token");
        setToken(null);
      })
      .finally(() => setReady(true));
  }, [token]);

  function persistToken(newToken, email) {
    localStorage.setItem("nebtube_token", newToken);
    setToken(newToken);
    setUser({ email });
  }

  async function login(email, password) {
    const data = await api.login(email, password);
    persistToken(data.access_token, data.email);
  }

  async function register(email, password) {
    const data = await api.register(email, password);
    persistToken(data.access_token, data.email);
  }

  function logout() {
    localStorage.removeItem("nebtube_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
