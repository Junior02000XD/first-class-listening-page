import axios from 'axios';

// 1. Definimos la URL base de tu API en Railway
const API_URL = "https://first-class-listening-api-production.up.railway.app/api";

const api = axios.create({
    baseURL: API_URL,
});

// 2. INTERCEPTOR: Se ejecuta antes de cada petición
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            // Adjuntamos el token al Header Authorization
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. INTERCEPTOR: Manejo global de errores (ej. Token expirado)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Si la API dice que el token no sirve, cerramos sesión
            localStorage.removeItem("token");
            localStorage.removeItem("userData");
            window.location.href = "/login"; 
        }
        return Promise.reject(error);
    }
);

export default api;
