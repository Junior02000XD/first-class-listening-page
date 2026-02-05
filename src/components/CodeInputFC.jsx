import { Col, Container, Row, Button, Form, Alert } from "react-bootstrap";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import api from "../api/axios";

export function CodeInputFC({ onSuccess }) { // Recibimos onSuccess como prop
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // Estado para mensaje de éxito
  
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!/^[A-Za-z0-9]{9}$/.test(code)) {
      setError("Código inválido. Debe tener 9 caracteres alfanuméricos.");
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
        // Redirigimos al login guardando el código
        navigate("/login", { state: { pendingCode: code.toUpperCase() } });
      } else {
        // CANJE REAL
        await api.post(`/codigos/canjear/${code}`);
        
        setSuccess("¡Contenido activado con éxito!");
        setCode(""); // Limpiamos el input

        // Si el padre pasó la función onSuccess (cargarDetalle), la ejecutamos
        if (onSuccess) {
          onSuccess(); 
        } else {
          // Si no hay onSuccess (ej: estamos en el Home), lo mandamos a ver sus cursos
          setTimeout(() => navigate("/cursos"), 2000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="my-4">
      <Row className="align-items-center">
        <Col xs={12} md={6} className="mb-4 mb-md-0">
          <img
            src="/images/ilustracion.png"
            alt="Ilustracion"
            className="img-fluid rounded"
          />
        </Col>

        <Col xs={12} md={6}>
          <h4 className="fw-bold">Ingresa el código de tu libro</h4>
          <p className="subtitle small">Al canjearlo, tendrás acceso permanente a los audios exclusivos.</p>
          
          <Form onSubmit={handleSubmit}>
            <Form.Control
              type="text"
              placeholder="Ej: A1B2C3D4E"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={loading}
              className="mb-2"
              maxLength={9}
            />
            {error && <div className="text-danger mb-2 small">{error}</div>}
            {success && <Alert variant="success" className="py-2 small">{success}</Alert>}
            
            <Button 
              type="submit" 
              variant="primary" 
              className="w-100" 
              disabled={loading}
            >
              {loading ? "Verificando..." : "Activar Contenido"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default CodeInputFC;
