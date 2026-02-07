import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.jsx'
import { Cursos } from './Cursos.jsx';
import { NotFoundPage } from './NotFoundPage.jsx';
import { createBrowserRouter, Router, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { Login } from './Login.jsx';
import { AuthProvider } from './context/AuthProvider.jsx';
import { Panel } from './Panel.jsx';
import { PerfilUsuario } from './PerfilUsuario.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './components/NavbarCustom.css';
import './index.css'
import CursoItem from './CursoItem.jsx';

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/cursos", element: <Cursos /> },
  { path: "/Login", element: <Login /> },
  { path: "/Cursos/:id", element: <CursoItem/> },
  { path: "/Perfil", element: <PerfilUsuario />},
  // RUTA PROTEGIDA: Solo Root (Rol 2) o Admin (Rol 1)
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
  </StrictMode>,
)
