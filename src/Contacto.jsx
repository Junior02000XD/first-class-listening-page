import { Container, Row, Col, Card, Button } from "react-bootstrap";
import NavbarFC from "./components/NavbarFC";
import FooterFC from "./components/FooterFC";

export default function Contacto() {
  const handleWhatsAppDev = () => {
    const telefono = "59172640600"; // Tu número personal/profesional (sin el +)
    const mensaje = "¡Hola, Julio! Vengo de la plataforma de First Class Institute. Me gustaría conversar contigo sobre un proyecto o consulta técnica.";
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <NavbarFC />
      <Container className="py-5 d-flex flex-column justify-content-center" style={{ minHeight: "85vh" }}>
        <Row className="justify-content-center mb-4 text-center">
          <Col md={8}>
            <h1 className="courses-title" style={{ color: "#DEB831" }}>Acerca del Desarrollador</h1>
            <div className="separator-small"></div>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card id="BorderCarousel" className="text-white" style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}>
              <Card.Body className="p-4 text-center">
                <h2 id="title" style={{ fontSize: "2.5rem", color: "#FFFFFF" }}>Julio Cesar Cruz Kübber</h2>
                <h5 id="subtitle" className="mb-4" style={{ color: "#DEB831" }}>Ingeniero de Software</h5>
                
                <p id="description" className="mb-4 text-start">
                  Diseñador y desarrollador de la arquitectura técnica de First Class Institute. 
                  Encargado de la integración de plataformas en la nube, bases de datos en PostgreSQL, APIs en ASP.NET Core y la interfaz de usuario en React.
                </p>

                <div className="d-flex flex-column gap-3 mt-4">
                  <Button 
                    onClick={handleWhatsAppDev} 
                    variant="warning" 
                    className="fw-bold py-2 shadow-sm"
                    style={{ backgroundColor: '#DEB831', borderColor: '#DEB831', color: '#2E1572' }}
                  >
                    💬 Hablemos por WhatsApp
                  </Button>

                  <div className="d-flex justify-content-center gap-2">
                    <a href="https://www.linkedin.com/in/julio-cesar-cruz-k-0a4a3733a" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-light w-100">
                      LinkedIn
                    </a>
                    <a href="https://github.com/Junior02000XD" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-light w-100">
                      GitHub
                    </a>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <FooterFC />
    </>
  );
}