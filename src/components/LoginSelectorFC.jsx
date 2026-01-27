import { Container, Card, Button } from "react-bootstrap";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";

export function LoginSelectorFC() {
  const { login, IsAuthenticated } = useContext(AuthContext);
  const Navigate = useNavigate();

  const location = useLocation();

  const handleLogin = () => {
    login({
      name: "Usuario Demo",
      email: "demo@firstclass.com",
    });
    
    if (location.state?.fromCode) {
      Navigate(`/Cursos/1`)
    } else {
      Navigate("/Cursos");
    }
  }

  return(
    <Container className="d-flex justify-content-center my-5">
      <Card className="login-card p-4 text-center">
        <h4 className="mb-3">Inicia sesión</h4>

        {/* Login por correo */}
        <Button variant="primary" className="w-100 mb-2" onClick={handleLogin}>
          Iniciar sesión con correo
        </Button>

        <small className="d-block mb-3 description-text">
          Usa tu correo y contraseña
        </small>

        {/* Divider */}
        <div className="divider my-1">
          <span>o</span>
        </div>

        {/* Login con Google */}
        <Button variant="outline-secondary" className="w-100" onClick={handleLogin}>
          Continuar con Google
        </Button>

        {/* Olvidé contraseña */}
        <div className="mt-3">
          <a href="#" className="forgot-link">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </Card>
    </Container>
  );
}

export default LoginSelectorFC;
