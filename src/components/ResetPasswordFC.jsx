// src/components/ResetPasswordFC.jsx
import { useState } from "react";
import { Container, Card, Button, Form, Spinner, Alert, InputGroup } from "react-bootstrap";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import api from "../api/axios";

export function ResetPasswordFC() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); 
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Token de recuperación inválido o ausente.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/usuarios/reset-password", {
        token: token,
        nuevaPassword: password,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.mensaje || "El enlace es inválido o ha expirado.");
    } finally {
      setLoading(false);
    }
  };

  // ESTILOS COMUNES PARA INPUTS (Igual que en el Login)
  const inputStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: '#2E1572',
    border: 'none'
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "85vh" }}>
      <Card 
        className="p-4 shadow-lg border-0 rounded-4" 
        style={{ 
          maxWidth: '450px', 
          width: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.25)', // Fondo oscuro con transparencia
          backdropFilter: 'blur(12px)', // Efecto cristal
          color: '#FFFFFF' // Todo el texto blanco
        }}
      >
        <div className="text-center mb-4">
          <h2 className="fw-bold mb-1" style={{ color: '#DEB831', fontFamily: '"Baloo 2", sans-serif' }}>First Class</h2>
          <h5 className="fw-normal" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Crear nueva contraseña
          </h5>
        </div>

        {success ? (
          <div className="text-center">
            <Alert variant="success" className="py-2 border-0 shadow-sm">
              Tu contraseña ha sido actualizada con éxito.
            </Alert>
            <Button 
              className="w-100 fw-bold mt-3 border-0 shadow-sm py-2" 
              style={{ backgroundColor: '#DEB831', color: '#2E1572' }}
              onClick={() => navigate("/login")}
            >
              Ir a Iniciar Sesión
            </Button>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            {!token && (
              <Alert variant="warning" className="small py-2 border-0 shadow-sm">
                No se detectó un código de seguridad en la URL. Asegúrate de usar el enlace completo enviado a tu correo.
              </Alert>
            )}
            {error && <Alert variant="danger" className="small py-2 border-0 shadow-sm">{error}</Alert>}

            <p className="small text-center mb-4" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Ingresa tu nueva contraseña a continuación.
            </p>

            <Form.Group className="mb-3">
              <InputGroup className="shadow-sm rounded overflow-hidden">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Nueva contraseña"
                  style={inputStyle}
                  className="py-2"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!token}
                />
                <Button
                  variant="light"
                  className="border-0"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlash size={18} color="#2E1572" /> : <Eye size={18} color="#2E1572" />}
                </Button>
              </InputGroup>
            </Form.Group>

            <Form.Control
              type="password"
              placeholder="Confirmar nueva contraseña"
              className="mb-4 py-2 shadow-sm"
              style={inputStyle}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={!token}
            />

            <Button
              type="submit"
              className="w-100 fw-bold py-2 border-0 shadow-sm"
              style={{ backgroundColor: '#DEB831', color: '#2E1572' }}
              disabled={loading || !token}
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Guardar contraseña"}
            </Button>

            <div className="text-center mt-4">
              <Link to="/login" className="small text-decoration-none" style={{ color: '#DEB831' }}>
                ← Volver al inicio de sesión
              </Link>
            </div>
          </Form>
        )}
      </Card>
    </Container>
  );
}

export default ResetPasswordFC;