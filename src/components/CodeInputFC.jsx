import { Col, Container, Row, Button, Form } from "react-bootstrap";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import api from "../api/axios"; // Importamos nuestro cliente configurado

export function CodeInputFC() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. Validación de formato (Coincide con los 9 caracteres de tu API)
    if (!/^[A-Za-z0-9]{9}$/.test(code)) {
      setError("Código inválido. Debe tener 9 caracteres alfanuméricos.");
      setLoading(false);
      return;
    }

    try {
      // 2. Verificar si el código es válido/existe en PostgreSQL
      // Usamos el endpoint GET api/codigos/verificar/{valor}
      const response = await api.get(`/codigos/verificar/${code}`);
      
      if (!response.data.valido) {
        setError("El código no existe o ya ha sido utilizado.");
        setLoading(false);
        return;
      }

      // 3. Lógica de redirección según autenticación
      if (!isAuthenticated) {
        // Guardamos el código en el state para canjearlo tras el login
        navigate("/login", { state: { pendingCode: code } });
      } else {
        // Intentar canje inmediato si ya está logueado
        await api.post(`/codigos/canjear/${code}`);
        
        // En tu API, el canje vincula el curso al usuario. 
        // Nota: Habría que obtener el cursoId para redirigir exacto, 
        // por ahora redirigimos a la lista para que vea su nuevo curso.
        navigate("/cursos");
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
          <p className="text-muted small">Al canjearlo, tendrás acceso permanente a los audios exclusivos.</p>
          
          <Form onSubmit={handleSubmit}>
            <Form.Control
              type="text"
              placeholder="Ej: A1B2C3D4E"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())} // Forzamos mayúsculas
              disabled={loading}
              className="mb-2"
              maxLength={9}
            />
            {error && <div className="text-danger mb-2 small">{error}</div>}
            
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
