import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';

import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

export function NavbarFC() {
  // Extraemos isAdmin e isRoot del contexto actualizado
  const { user, logout, isAuthenticated, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirigir al home tras cerrar sesión
  };

  return (
    <Navbar expand="lg" className="navbar-custom">
      <Container>
        <Navbar.Brand as={Link} to="/" className='navbar-title'>First Class</Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />

        <Navbar.Collapse id="navbar-nav" className='navbar-navigation'>
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" >Home</Nav.Link>
            <Nav.Link as={NavLink} to="/cursos">Cursos</Nav.Link>
            
            {/* Solo mostramos el link de Login si NO está autenticado */}
            {!isAuthenticated && (
              <Nav.Link as={NavLink} to="/login">Login</Nav.Link>
            )}

            {/* OPCIÓN PARA ADMINS: Se activa solo si es Admin o Root */}
            {isAdmin && (
              <Nav.Link as={NavLink} to="/admin/dashboard" className="text-warning">
                Panel Admin
              </Nav.Link>
            )}
          </Nav>

          {isAuthenticated ? (
            <Dropdown>
              <Dropdown.Toggle variant="secondary" id="dropdown-basic" className='user-dropdown'>
                {/* Usamos 'nombre' porque así viene de tu API de C# */}
                Hola, {user?.nombre || "Usuario"}
              </Dropdown.Toggle>
              <Dropdown.Menu className='menu-dropdown-custom' align="end">
                <Dropdown.Item as={Link} to="/mis-cursos" className='dropdown-item-custom'>
                  Mis Cursos
                </Dropdown.Item>
                
                <Dropdown.Divider />
                
                <Dropdown.Item onClick={handleLogout} className='dropdown-item-custom text-danger'>
                  Log Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Nav className="gap-2">
              {/* Botón simplificado: ahora ambos llevan al Login/Register real */}
              <Button variant="outline-secondary" onClick={() => navigate("/login")}>
                Log In
              </Button>
              <Button variant="primary" onClick={() => navigate("/login")}>
                Sign Up
              </Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarFC;
