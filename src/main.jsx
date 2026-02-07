// 1. ESTILOS PRIMERO (Para evitar el parpadeo y la advertencia de la consola)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';
import './components/NavbarCustom.css';

// 2. LIBRERÍAS DE REACT
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// 3. CONTEXTO Y PROTECCIÓN
import { AuthProvider } from './context/AuthProvider.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';

// 4. COMPONENTES DE PÁGINAS
import { App } from './App.jsx';
import { Cursos } from './Cursos.jsx';
import { Login } from './Login.jsx';
import { CursoItem } from './CursoItem.jsx';
import { PerfilUsuario } from './PerfilUsuario.jsx';
import { Panel } from './Panel.jsx';
import { NotFoundPage } from './NotFoundPage.jsx';

// CONFIGURACIÓN DE RUTAS
const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/Cursos", element: <Cursos /> },
  { path: "/Login", element: <Login /> },
  { path: "/Cursos/:id", element: <CursoItem /> },
  { 
    path: "/Perfil", 
    element: (
      <ProtectedRoute minRole={0}> {/* Protegemos también el perfil para usuarios logueados */}
        <PerfilUsuario />
      </ProtectedRoute>
    )
  },
  { 
    path: "/panel", 
    element: (
      <ProtectedRoute minRole={1}> 
        <Panel />
      </ProtectedRoute>
    ) 
  },
  { path: "*", element: <NotFoundPage /> }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
