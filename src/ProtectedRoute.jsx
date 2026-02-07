import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

export const ProtectedRoute = ({ children, minRole }) => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const location = useLocation();

    // 1. Si no hay usuario y no está autenticado, al Login
    // Usamos 'replace' para que no pueda volver atrás al panel vacío
    if (!isAuthenticated) {
        return <Navigate to="/Login" state={{ from: location }} replace />;
    }
    
    // 2. IMPORTANTE: Verificar que el objeto 'user' ya cargó antes de leer 'rol'
    if (!user) return null; // O un <Spinner /> mientras carga el contexto

    // 3. Validación de Roles (User = 0, Admin = 1, Root = 2)
    if (user.rol < minRole) {
        return <Navigate to="/" replace />;
    }

    return children;
};
