import { Col, Container, Row } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

export function CodeInputFC() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if(!/^[A-Za-z0-9]{9}$/.test(code)){
      setError("Código inválido. Debe tener 9 caracteres alfanuméricos.");
      setLoading(false);
      return;
    }

    // Simular verificación de código
    setTimeout(() => {
      setLoading(false);
      if(!isAuthenticated){
        navigate("/Login", { state: { from: "/cursos", code } });
      }else{
        navigate(`/Cursos/1`);
      }
    }, 1500);
  }


  return (
    <Container className="my-4">
      <Row className="align-items-center" gap={4} ms={1} md={2}>
        
        {/* Imagen recortada */}
        <Col xs={12} md={6} className="mb-4 mb-md-0">
          <img
            src="/images/ilustracion.png"
            alt="Ilustracion"
            className="img-fluid rounded"
          />
        </Col>

        {/* Formulario */}
        <Col xs={12} md={6}>
          <h4>Ingresa el código de tu libro</h4>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="form-control"
              placeholder="Escribe tu código aquí..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
            />
            {error && <div className="text-danger mt-2">{error}</div>}
            <button type="submit" className="btn btn-primary mt-2" disabled={loading}>
              {loading ? "Verificando..." : "Enviar"}
            </button>
          </form>
        </Col>

      </Row>
    </Container>
  );
}

export default CodeInputFC;
