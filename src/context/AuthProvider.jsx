import { useState, useCallback } from "react";
import { AuthContext } from "./AuthContext.jsx";

export const AuthProvider = ({ children }) => {
    // Inicializamos el estado directamente desde localStorage
    const [user, setUser] = useState(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("userData");
        if (savedToken && savedUser) {
            try {
                return JSON.parse(savedUser);
            } catch {
                // Si el JSON está mal, limpiamos el storage y devolvemos null
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
            rol: loginResponse.rolUsuario,
            misCursos: loginResponse.misCursos
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
