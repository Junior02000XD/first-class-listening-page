import { Col, Container, Row, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import api from "../api/axios";

export function CodeInputFC({ onSuccess }) { 
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); 
  
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!/^[A-Za-z0-9]{9,10}$/.test(code)) {
      setError("Código inválido. Debe tener 9 o 10 caracteres alfanuméricos.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.get(`/codigos/verificar/${code}`);
      
      if (!response.data.valido) {
        setError("El código no existe o ya ha sido utilizado.");
        setLoading(false);
        return;
      }

      if (!isAuthenticated) {
        navigate("/login", { state: { pendingCode: code.toUpperCase() } });
      } else {
        await api.post(`/codigos/canjear/${code}`);
        
        setSuccess("¡Contenido activado con éxito!");
        setCode(""); 

        if (onSuccess) {
          setTimeout(() => onSuccess(), 1500); 
        } else {
          setTimeout(() => navigate("/cursos"), 1500);
        }
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: '#2E1572',
    border: 'none',
    letterSpacing: '2px', 
    fontWeight: 'bold',
    textTransform: 'uppercase'
  };

  return (
    <Container className="my-4">
      <Row className="align-items-center g-4">
        <Col xs={12} md={5} className="text-center">
          <img
            src="/images/ilustracion.png"
            alt="Ilustracion"
            className="img-fluid rounded"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          />
        </Col>

        <Col xs={12} md={7} className="text-center text-md-start">
          <h4 className="fw-bold" style={{ color: '#DEB831', fontFamily: '"Baloo 2", sans-serif' }}>
            Ingresa el código de tu libro
          </h4>
          <p className="subtitle small" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Al canjearlo, tendrás acceso permanente a los audios y videos exclusivos.
          </p>
          
          <Form onSubmit={handleSubmit}>
            <Form.Control
              type="text"
              placeholder="Ej: A1B2C3D4E"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={loading || success !== ""}
              className="mb-2 py-2 shadow-sm"
              maxLength={10} 
              style={inputStyle}
            />
            {error && <div className="text-danger mb-2 small fw-bold">{error}</div>}
            {success && <Alert variant="success" className="py-2 small border-0 fw-bold">{success}</Alert>}
            
            <Button 
              type="submit" 
              className="w-100 fw-bold shadow-sm border-0 mt-2" 
              disabled={loading || success !== "" || code.length < 9}
              style={{ backgroundColor: '#DEB831', color: '#2E1572' }}
            >
              {loading ? <Spinner size="sm" className="me-2"/> : null}
              {loading ? "Verificando..." : "Activar Contenido"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default CodeInputFC;