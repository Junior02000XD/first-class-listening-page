import axios from 'axios';

// 1. Definimos la URL base de tu API en Railway
const API_URL = "https://first-class-listening-api-production.up.railway.app/api";

const api = axios.create({
    baseURL: API_URL,
    // IMPORTANTE: Para videos de 1GB, el timeout debe ser 0 (infinito) 
    // o muy alto, ya que la subida puede tardar varios minutos.
    timeout: 0, 
});

// 2. INTERCEPTOR: Se ejecuta antes de cada petición
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. INTERCEPTOR: Manejo global de errores
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("userData");
            
            if (!window.location.pathname.includes("/Cursos/")) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
