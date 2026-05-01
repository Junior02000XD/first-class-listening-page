import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom"; // Importante importar Link
import './FooterCustom.css';

export function FooterFC() {
  return (
    <footer className="footer-custom mt-5">
      <Container>
        <Row className="align-items-center py-4">
          
          {/* Marca */}
          <Col xs={12} md={6} className="text-center text-md-start mb-3 mb-md-0">
            <h5 className="footer-title mb-1">First Class Institute</h5>
            <small className="footer-text">
              Aprender es una aventura. © {new Date().getFullYear()}
            </small>
          </Col>

          {/* Links */}
          <Col xs={12} md={6} className="text-center text-md-end">
            <Link to="/Cursos" className="footer-link me-3 text-decoration-none">Cursos</Link>
            <Link to="/Soporte" className="footer-link me-3 text-decoration-none">Soporte</Link>
            <Link to="/Contacto" className="footer-link text-decoration-none">Contacto</Link>
          </Col>

        </Row>
      </Container>
    </footer>
  );
}

export default FooterFC;