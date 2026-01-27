import { useState } from "react";
import { AuthContext } from "./AuthContext.jsx";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = (userData) => {
        setUser(userData);
    }
    const logout = () => {
        setUser(null);
    }
    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthenticated
        }}>
            {children}
        </AuthContext.Provider>
    );
};