import { useState, useCallback } from "react";
import { AuthContext } from "./AuthContext.jsx";

export const AuthProvider = ({ children }) => {
    // Inicializamos el estado desde localStorage
    const [user, setUser] = useState(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("userData");
        if (savedToken && savedUser) {
            try {
                return JSON.parse(savedUser);
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("userData");
                return null;
            }
        }
        return null;
    });

    const login = (loginResponse) => {
        const userData = {
            id: loginResponse.id,
            nombre: loginResponse.nombre,
            apellido: loginResponse.apellido,
            email: loginResponse.email,
            pais: loginResponse.pais,
            ciudad: loginResponse.ciudad,
            fechaCumpleaños: loginResponse.fechaCumpleaños,
            rol: loginResponse.rolUsuario
        };

        localStorage.setItem("token", loginResponse.token);
        localStorage.setItem("userData", JSON.stringify(userData));
        setUser(userData);
    };

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        setUser(null);
    }, []);

    const isAuthenticated = !!user;
    // Asegúrate de que estos números coincidan con tu Enum de C# (ej: Root=2, Admin=1, User=0)
    const isRoot = user?.rol === 2;
    const isAdmin = user?.rol === 1 || isRoot;

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthenticated,
            isRoot,
            isAdmin
        }}>
            {children}
        </AuthContext.Provider>
    );
};
