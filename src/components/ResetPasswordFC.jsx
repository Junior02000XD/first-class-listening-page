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

  return (
    <Container className="d-flex justify-content-center my-5" style={{ minHeight: "60vh" }}>
      <Card className="login-card p-4 shadow-sm" style={{ maxWidth: '450px', width: '100%' }}>
        <h4 className="mb-4 fw-bold text-center">Crear nueva contraseña</h4>

        {success ? (
          <div className="text-center">
            <Alert variant="success" className="py-2">
              Tu contraseña ha sido actualizada con éxito.
            </Alert>
            <Button variant="primary" className="w-100 fw-bold mt-3" onClick={() => navigate("/login")}>
              Ir a Iniciar Sesión
            </Button>
          </div>
        ) : (
          <Form onSubmit={handleSubmit}>
            {!token && (
              <Alert variant="warning" className="small py-2">
                No se detectó un código de seguridad en la URL. Asegúrate de usar el enlace completo enviado a tu correo.
              </Alert>
            )}
            {error && <Alert variant="danger" className="small py-2">{error}</Alert>}

            <p className="text-muted small text-center mb-3">
              Ingresa tu nueva contraseña a continuación.
            </p>

            <Form.Group className="mb-3">
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Nueva contraseña"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!token}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </Button>
              </InputGroup>
            </Form.Group>

            <Form.Control
              type="password"
              placeholder="Confirmar nueva contraseña"
              className="mb-4"
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={!token}
            />

            <Button
              variant="primary"
              type="submit"
              className="w-100 fw-bold py-2"
              disabled={loading || !token}
            >
              {loading ? <Spinner animation="border" size="sm" /> : "Guardar contraseña"}
            </Button>

            <div className="text-center mt-3">
              <Link to="/login" className="small text-decoration-none text-muted">
                Volver al inicio de sesión
              </Link>
            </div>
          </Form>
        )}
      </Card>
    </Container>
  );
}

export default ResetPasswordFC;