// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance"; // 👈 use your custom instance
import axios from "axios"; // still needed for login
import { toast } from "react-toastify";
import { useTheme } from "./ThemeContext";
import { useLanguage } from "./LanguageContext";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { theme } = useTheme();
  const { language } = useLanguage();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axiosInstance.get("/users/profile/get"); // ✅ uses token
        setUser(data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (credentials) => {
    try {
      const { data } = await axios.post(
        "https://smart-rental-management.onrender.com/api/auth/login",
        credentials
      );

      localStorage.setItem("token", data.token); // ✅ store the token
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

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      localStorage.removeItem("token"); // ✅ clear token
      setUser(null);
      toast.info(language === "en" ? "Logged out" : "Umetoka", { theme });
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
