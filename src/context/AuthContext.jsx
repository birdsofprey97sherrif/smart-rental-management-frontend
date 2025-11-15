// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useRef } from "react";
import axiosInstance from "../utils/axiosInstance"; 
import axios from "axios";
import { toast } from "react-toastify";
import { useTheme } from "./ThemeContext";
import { useLanguage } from "./LanguageContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  const { theme } = useTheme();
  const { language } = useLanguage();

  // 🔒 Fetch logged-in user on page reload
  useEffect(() => {
    const fetchUser = async () => {
      if (hasFetched.current) return;
      hasFetched.current = true;

      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axiosInstance.get("/users/profile/get");
        setUser(data);
      } catch (err) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // 🔑 Login function
  const login = async (credentials) => {
    try {
      const { data } = await axios.post(
        "https://smart-rental-management.onrender.com/api/auth/login",
        credentials
      );

      localStorage.setItem("token", data.token);
      setUser(data.user);

      toast.success(
        language === "en" ? "Login successful" : "Kuingia kumefaulu",
        { theme }
      );

      return data;
    } catch (error) {
      toast.error(
        language === "en" ? "Login failed" : "Kuingia kumeshindikana",
        { theme }
      );
      throw error;
    }
  };

  // 🚪 Logout
  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");

      localStorage.removeItem("token");
      setUser(null);

      toast.info(
        language === "en" ? "Logged out" : "Umetoka", 
        { theme }
      );
    } catch (error) {
      toast.error(
        language === "en" ? "Logout failed" : "Kutoka kumeshindikana",
        { theme }
      );
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
