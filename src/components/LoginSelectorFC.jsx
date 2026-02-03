import { useCallback, useEffect, useState, useContext } from "react";
import { Container, Card, Button, Form, Spinner } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import api from "../api/axios";

export function LoginSelectorFC() {
  const { login } = useContext(AuthContext);
  const [view, setView] = useState("selector");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "", nombre: "", apellido: "" });
  
  const navigate = useNavigate();
  const location = useLocation();
  const pendingCode = location.state?.pendingCode;

  const handleGoogleLogin = useCallback(async (response) => {
    setLoading(true);
    try {
      const res = await api.post("/usuarios/login", {
        email: "", 
        tipo: 1, 
        valor: response.credential 
      });
      login(res.data);
      if (pendingCode) await api.post(`/codigos/canjear/${pendingCode}`);
      navigate("/cursos");
    } catch {
      setError("Error al autenticar con Google.");
    } finally {
      setLoading(false);
    }
  }, [login, pendingCode, navigate]);

  useEffect(() => {
    const renderGoogleButton = () => {
      /* global google */
      if (typeof google !== "undefined" && google.accounts) {
        google.accounts.id.initialize({
          client_id: "662255015594-t0on5fggh2mjjo0o4oeb7bbdprqrc33j.apps.googleusercontent.com",
          callback: handleGoogleLogin,
        });

        const btnContainer = document.getElementById("googleBtn");
        if (btnContainer) {
          google.accounts.id.renderButton(btnContainer, { 
            theme: "outline", 
            size: "large", 
            width: btnContainer.offsetWidth, // Forzamos el ancho del contenedor padre
            text: "continue_with",
            shape: "rectangular" // Hace que se vea más integrado con tus otros botones
          });
        }
      }
    };

    if (view === "selector") {
      const timer = setTimeout(renderGoogleButton, 150);
      return () => clearTimeout(timer);
    }
  }, [handleGoogleLogin, view]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
       const endpoint = view === "login" ? "/usuarios/login" : "/usuarios/register";
       const payload = view === "login" 
           ? { email: formData.email, valor: formData.password, tipo: 0 } 
           : { ...formData, valor: formData.password, tipo: 0, pais: "N/A", ciudad: "N/A" };
       
       const res = await api.post(endpoint, payload);
       login(res.data);
       if (pendingCode) await api.post(`/codigos/canjear/${pendingCode}`);
       navigate("/cursos");
    } catch (err) {
       setError(err.response?.data?.mensaje || "Error en credenciales.");
    } finally { setLoading(false); }
  };

  if (view === "selector") {
    return (
      <Container className="d-flex justify-content-center my-5">
        <Card className="login-card p-4 text-center" style={{ maxWidth: '400px', width: '100%' }}>
          <h4 className="mb-4 fw-bold">Inicia sesión</h4>
          <Button variant="primary" className="w-100 mb-2" onClick={() => setView("login")}>
            Iniciar sesión con correo
          </Button>
          <Button variant="outline-primary" className="w-100 mb-3" onClick={() => setView("register")}>
            Crear cuenta nueva
          </Button>
          <div className="divider my-3"><span>o</span></div>
          
          {/* Ajuste de estilo para asegurar centrado y ancho */}
          <div className="d-flex justify-content-center">
            <div id="googleBtn" style={{ width: '100%' }}></div>
          </div>
          
          {loading && <Spinner animation="border" size="sm" className="mt-2" />}
          {error && <p className="text-danger small mt-2">{error}</p>}
        </Card>
      </Container>
    );
  }

  return (
    <Container className="d-flex justify-content-center my-5">
      <Card className="login-card p-4" style={{ maxWidth: '400px', width: '100%' }}>
        <Button variant="link" className="p-0 mb-3" onClick={() => setView("selector")}>← Volver</Button>
        <h4 className="mb-4">{view === "login" ? "Login" : "Registro"}</h4>
        <Form onSubmit={handleSubmit}>
          {view === "register" && (
            <div className="d-flex gap-2 mb-2">
              <Form.Control placeholder="Nombre" required onChange={e => setFormData({...formData, nombre: e.target.value})} />
              <Form.Control placeholder="Apellido" required onChange={e => setFormData({...formData, apellido: e.target.value})} />
            </div>
          )}
          <Form.Control type="email" placeholder="Email" className="mb-2" required onChange={e => setFormData({...formData, email: e.target.value})} />
          <Form.Control type="password" placeholder="Contraseña" className="mb-3" required onChange={e => setFormData({...formData, password: e.target.value})} />
          {error && <p className="text-danger small">{error}</p>}
          <Button variant="primary" type="submit" className="w-100" disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Continuar"}
          </Button>
        </Form>
      </Card>
    </Container>
  );
}
