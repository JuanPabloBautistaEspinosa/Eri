import { createContext, useContext, useState } from "react";
import { api } from "./api.js";

const AuthContext = createContext(null);

const leerSesion = () => {
  try {
    return JSON.parse(localStorage.getItem("sesion"));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerSesion);

  const abrirSesion = ({ token, usuario }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("sesion", JSON.stringify(usuario));
    setUsuario(usuario);
  };

  const login = async (datos) => abrirSesion(await api.login(datos));
  const register = async (datos) => abrirSesion(await api.register(datos));
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("sesion");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, esAdmin: usuario?.rol === "admin", login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
