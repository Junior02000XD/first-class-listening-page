import { useCallback, useEffect, useState, useContext } from "react";
import { Container, Card, Button, Form, Spinner, Row, Col } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { InputGroup } from "react-bootstrap";

export function LoginSelectorFC() {
  const { login } = useContext(AuthContext);
  const [view, setView] = useState("selector");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado ampliado para el registro completo
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "",
    confirmPassword: "", 
    nombre: "", 
    apellido: "",
    pais: "",
    ciudad: "",
    fechaNacimiento: "" // Formato YYYY-MM-DD
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const pendingCode = location.state?.pendingCode;

  const handleGoogleLogin = useCallback(async (response) => {
    setLoading(true);
    try {
      const decoded = jwtDecode(response.credential);
      
      const res = await api.post("/usuarios/login-google", {
        nombre: decoded.given_name || "Usuario",
        apellido: decoded.family_name || "Google",
        email: decoded.email,
        valor: response.credential, // El GoogleId o Token
        tipo: 1, // TipoCredencial.Google
        pais: "N/A",
        ciudad: "N/A"
      });

      login(res.data);
      if (pendingCode) await api.post(`/codigos/canjear/${pendingCode}`);
      navigate("/cursos");
    } catch {
      setError("Error al sincronizar con Google.");
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
            width: btnContainer.offsetWidth,
            text: "continue_with",
            shape: "rectangular"
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

    // Validación de coincidencia de contraseña en registro
    if (view === "register" && formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    
    try {
       const endpoint = view === "login" ? "/usuarios/login" : "/usuarios/register";
       
       // Construcción del Payload según tu DTO de C#
       const payload = view === "login" 
           ? { email: formData.email, valor: formData.password, tipo: 0 } 
           : { 
               nombre: formData.nombre,
               apellido: formData.apellido,
               pais: formData.pais,
               ciudad: formData.ciudad,
               fechaCumpleaños: formData.fechaNacimiento, // Mapeado a tu DTO
               rol: 2, // User
               email: formData.email,
               valor: formData.password,
               tipo: 0 // Local
             };
       
       const res = await api.post(endpoint, payload);
       
       // 1. Iniciar sesión globalmente
       login(res.data);

       // 2. Canje automático si existe código pendiente
       if (pendingCode) {
         try {
           await api.post(`/codigos/canjear/${pendingCode}`);
         } catch (redeemErr) {
           console.error("Error al canjear código tras registro:", redeemErr);
           // Nota: El usuario ya está logueado, el canje falló pero la sesión es válida
         }
       }
       
       navigate("/cursos");
    } catch (err) {
       setError(err.response?.data?.mensaje || "Error en la operación. Revisa los datos.");
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
      <Card className="login-card p-4 shadow-sm" style={{ maxWidth: view === "selector" ? '400px' : '450px', width: '100%' }}>
        {view !== "selector" && (
          <Button variant="link" className="p-0 mb-3 text-decoration-none text-muted" onClick={() => {setView("selector"); setError(""); setShowPassword(false);}}>
            ← Volver
          </Button>
        )}

        <h4 className="mb-4 fw-bold text-center">
          {view === "selector" ? "Inicia sesión" : view === "login" ? "¡Hola de nuevo!" : "Crea tu cuenta"}
        </h4>

        {view === "selector" ? (
          <>
            <Button variant="primary" className="w-100 mb-2 py-2 fw-bold" onClick={() => setView("login")}>
              Iniciar sesión con correo
            </Button>
            <Button variant="outline-primary" className="w-100 mb-3 py-2 fw-bold" onClick={() => setView("register")}>
              Crear cuenta nueva
            </Button>
            <div className="divider my-3"><span>o</span></div>
            <div id="googleBtn" className="d-flex justify-content-center" style={{ width: '100%' }}></div>
          </>
        ) : (
          <Form onSubmit={handleSubmit}>
            {view === "register" && (
              <>
                <Row className="mb-2 g-2">
                  <Col><Form.Control placeholder="Nombre" required onChange={e => setFormData({...formData, nombre: e.target.value})} /></Col>
                  <Col><Form.Control placeholder="Apellido" required onChange={e => setFormData({...formData, apellido: e.target.value})} /></Col>
                </Row>
                <Row className="mb-2 g-2">
                  <Col><Form.Control placeholder="País" required onChange={e => setFormData({...formData, pais: e.target.value})} /></Col>
                  <Col><Form.Control placeholder="Ciudad" required onChange={e => setFormData({...formData, ciudad: e.target.value})} /></Col>
                </Row>
                <Form.Group className="mb-2">
                  <Form.Label className="small text-muted mb-1">Fecha de Nacimiento</Form.Label>
                  <Form.Control type="date" required onChange={e => setFormData({...formData, fechaNacimiento: e.target.value})} />
                </Form.Group>
              </>
            )}

            <Form.Control type="email" placeholder="Email" className="mb-2" required onChange={e => setFormData({...formData, email: e.target.value})} />
            
             {/* Input con Ojo para mostrar contraseña */}
            <Form.Group className="mb-2">
              <div className="input-group">
                <Form.Control 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Contraseña" 
                  required 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                >
                  {showPassword ? <EyeSlash size={18}/> : <Eye size={18}/>}
                </Button>
              </div>
            </Form.Group>

            {view === "register" && (
              <Form.Control 
                type="password" 
                placeholder="Confirmar contraseña" 
                className="mb-3" 
                required 
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
              />
            )}
            
            {error && <p className="text-danger small text-center">{error}</p>}
            
            <Button variant="primary" type="submit" className="w-100 fw-bold py-2 mt-2" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : (view === "login" ? "Entrar" : "Registrarme")}
            </Button>
          </Form>
        )}
      </Card>
    </Container>
  );
}
