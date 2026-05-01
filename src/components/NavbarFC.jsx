import { useState, useEffect, useContext } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';

import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import './NavbarCustom.css'; // Asegúrate de crear/tener este archivo

export function NavbarFC() {
  const { user, logout, isAuthenticated, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Estado para detectar el scroll
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Si bajamos más de 50px, activamos el fondo
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Navbar expand="lg" sticky="top" className={`navbar-custom ${scrolled ? 'navbar-scrolled' : ''}`}>
      <Container>
        <Navbar.Brand as={Link} to="/" className='navbar-title text-white fw-bold'>First Class</Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" className="bg-light" />

        <Navbar.Collapse id="navbar-nav" className='navbar-navigation'>
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" className="text-white">Home</Nav.Link>
            <Nav.Link as={NavLink} to="/Cursos" className="text-white">Audios y Videos</Nav.Link>
            
            {!isAuthenticated && (
              <Nav.Link as={NavLink} to="/login" className="text-white">Login</Nav.Link>
            )}

            {isAdmin && (
              <Nav.Link as={NavLink} to="/Panel" className="text-warning fw-bold">
                Panel Admin
              </Nav.Link>
            )}
          </Nav>

          {isAuthenticated ? (
            <Dropdown>
              <Dropdown.Toggle variant="outline-light" id="dropdown-basic" className='user-dropdown'>
                Hola, {user?.nombre || "Usuario"}
              </Dropdown.Toggle>
              <Dropdown.Menu className='menu-dropdown-custom shadow' align="end">
                <Dropdown.Item as={Link} to="/Cursos" className='dropdown-item-custom'>Mis Cursos</Dropdown.Item>
                <Dropdown.Item as={Link} to="/Perfil" className='dropdown-item-custom'>Perfil</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className='dropdown-item-custom text-danger'>Log Out</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Nav className="gap-2">
              <Button variant="outline-light" onClick={() => navigate("/login")}>Log In</Button>
              <Button variant="warning" onClick={() => navigate("/login")} style={{backgroundColor: '#DEB831', borderColor: '#DEB831', color: '#2E1572', fontWeight: 'bold'}}>Sign Up</Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarFC;