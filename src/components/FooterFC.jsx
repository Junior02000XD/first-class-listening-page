import { Container, Row, Col } from "react-bootstrap";
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
            <a href="#" className="footer-link me-3">Cursos</a>
            <a href="#" className="footer-link me-3">Soporte</a>
            <a href="#" className="footer-link">Contacto</a>
          </Col>

        </Row>
      </Container>
    </footer>
  );
}

export default FooterFC;
