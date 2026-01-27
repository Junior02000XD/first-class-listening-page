import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';

import { Link } from 'react-router-dom';
import { NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import Dropdown from 'react-bootstrap/Dropdown';

export function NavbarFC() {
  const { user, login, logout, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <Navbar expand="lg" className="navbar-custom">
      <Container>
        <Navbar.Brand as={Link} to="/" className='navbar-title'>First Class</Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />

        <Navbar.Collapse id="navbar-nav" className='navbar-navigation'>
          {/* Navegación izquierda */}
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" >Home</Nav.Link>
            <Nav.Link as={NavLink} to="/cursos">Cursos</Nav.Link>
            <Nav.Link as={NavLink} to="/Login" disabled={isAuthenticated} >Login</Nav.Link>
          </Nav>

          {isAuthenticated ? (
            <Dropdown>
              <Dropdown.Toggle variant="secondary" id="dropdown-basic" className='user-dropdown'>
                {user.name}
              </Dropdown.Toggle>
              <Dropdown.Menu className='menu-dropdown-custom'>
                <Dropdown.Item disabled className='dropdown-item-custom'>Mis Cursos</Dropdown.Item>
                <Dropdown.Item onClick={logout} className='dropdown-item-custom'>Log Out</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Nav className="gap-2">
              <Button variant="outline-secondary" onClick={() => login({
                name: "Usuario Demo",
                email: "demo@firstclass.com",
              })}>Log In</Button>
              <Button variant="primary" onClick={() => navigate("/login")}>Sign Up</Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarFC;