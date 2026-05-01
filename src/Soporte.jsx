import { Container, Row, Col, Card, Button } from "react-bootstrap";
import NavbarFC from "./components/NavbarFC";
import FooterFC from "./components/FooterFC";

export default function Soporte() {
  const handleWhatsAppSoporte = () => {
    const telefono = "59172640600"; // Tu número de soporte (sin el +)
    const mensaje = "¡Hola, equipo de soporte! Soy estudiante de First Class Institute y necesito ayuda con mi acceso a la plataforma.";
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <NavbarFC />
      <Container className="py-5 d-flex flex-column justify-content-center" style={{ minHeight: "85vh" }}>
        <Row className="justify-content-center text-center mb-5">
          <Col md={8}>
            <h1 className="courses-title" style={{ color: "#DEB831" }}>Centro de Soporte</h1>
            <div className="separator-small"></div>
            <p className="mt-4" id="description">
              ¿Tienes problemas con tus audios, videos o códigos de acceso? Estamos aquí para ayudarte a continuar tu aventura de aprendizaje sin interrupciones.
            </p>
          </Col>
        </Row>
        
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="text-center shadow text-white" style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", border: "2px solid #DEB831" }}>
              <Card.Body className="p-5">
                <h3 className="course-title mb-4">Contacto Institucional</h3>
                <p>Escríbenos directamente para validar tu inscripción o recuperar tu código de acceso de manera rápida.</p>
                <div className="mt-4 mb-4">
                  <p>📧 <strong>Email:</strong> juliocesarcruzkubber@gmail.com</p>
                </div>
                
                <Button 
                  onClick={handleWhatsAppSoporte}
                  variant="warning" 
                  className="w-100 fw-bold py-2 shadow-sm" 
                  style={{ backgroundColor: '#DEB831', borderColor: '#DEB831', color: '#2E1572' }}
                >
                  🎧 Hablar con Soporte en WhatsApp
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <FooterFC />
    </>
  );
}