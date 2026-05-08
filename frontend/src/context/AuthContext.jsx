import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    () => localStorage.getItem("rm_token") || null
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        delete axios.defaults.headers.common["Authorization"];
        localStorage.removeItem("rm_token");
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;

        localStorage.setItem("rm_token", token);

        const { data } = await axios.get("/api/auth/me");

        if (data.success) {
          setUser(data.user);
        } else {
          logout();
        }
      } catch (err) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post(
        "/api/auth/login",
        {
          email,
          password,
        }
      );

      if (!data.success)
        throw new Error(data.message);

      setToken(data.token);
      setUser(data.user);

      return data.user;
    } catch (err) {
      throw new Error(
        err.response?.data?.message ||
          "Login failed"
      );
    }
  };

  const register = async (payload) => {
    try {
      const { data } = await axios.post(
        "/api/auth/register",
        payload
      );

      if (!data.success)
        throw new Error(data.message);

      setToken(data.token);
      setUser(data.user);

      return data.user;
    } catch (err) {
      throw new Error(
        err.response?.data?.message ||
          "Registration failed"
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("rm_token");

    delete axios.defaults.headers.common[
      "Authorization"
    ];

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);