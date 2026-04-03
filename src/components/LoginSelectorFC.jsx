import { useCallback, useEffect, useState, useContext } from "react";
import { Container, Card, Button, Form, Spinner, Row, Col, Alert, InputGroup } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";
import { Eye, EyeSlash } from "react-bootstrap-icons";

export function LoginSelectorFC() {
  const { login } = useContext(AuthContext);
  const [view, setView] = useState("selector"); // "selector" | "login" | "register" | "forgotPassword"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "",
    confirmPassword: "", 
    nombre: "", 
    apellido: "",
    pais: "",
    ciudad: "",
    fechaNacimiento: "" 
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
        valor: response.credential, 
        tipo: 1, 
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
    setSuccessMsg("");

    if (view === "register" && formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }
    
    try {
       const endpoint = view === "login" ? "/usuarios/login" : "/usuarios/register";
       
       const payload = view === "login" 
           ? { email: formData.email, valor: formData.password, tipo: 0 } 
           : { 
               nombre: formData.nombre,
               apellido: formData.apellido,
               pais: formData.pais,
               ciudad: formData.ciudad,
               fechaCumpleaños: formData.fechaNacimiento,
               rol: 2, 
               email: formData.email,
               valor: formData.password,
               tipo: 0 
             };
       
       const res = await api.post(endpoint, payload);
       
       login(res.data);

       if (pendingCode) {
         try {
           await api.post(`/codigos/canjear/${pendingCode}`);
         } catch (redeemErr) {
           console.error("Error al canjear código tras registro:", redeemErr);
         }
       }
       
       navigate("/cursos");
    } catch (err) {
       setError(err.response?.data?.mensaje || "Error en la operación. Revisa los datos.");
    } finally { 
       setLoading(false); 
    }
  };

  // NUEVO: Función para manejar el envío del correo de recuperación
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      // Necesitarás crear este endpoint en tu backend de C#
      await api.post("/usuarios/recuperar-password", { email: formData.email });
      setSuccessMsg("Si el correo existe, hemos enviado un enlace para restablecer tu contraseña.");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para cambiar de vistas y limpiar errores
  const cambiarVista = (nuevaVista) => {
    setView(nuevaVista);
    setError("");
    setSuccessMsg("");
    setShowPassword(false);
  };

  return (
    <Container className="d-flex justify-content-center my-5">
      <Card className="login-card p-4 shadow-sm" style={{ maxWidth: view === "selector" ? '400px' : '450px', width: '100%', transition: 'max-width 0.3s ease' }}>
        
        {/* BOTÓN VOLVER (Oculto en el selector) */}
        {view !== "selector" && (
          <Button variant="link" className="p-0 mb-3 text-decoration-none text-muted-custom text-start" onClick={() => cambiarVista("selector")}>
            ← Volver
          </Button>
        )}

        {/* TÍTULO DINÁMICO */}
        <h4 className="mb-4 fw-bold text-center">
          {view === "selector" && "Inicia sesión"}
          {view === "login" && "¡Hola de nuevo!"}
          {view === "register" && "Crea tu cuenta"}
          {view === "forgotPassword" && "Recuperar Contraseña"}
        </h4>

        {/* MENSAJES DE ÉXITO O ERROR GLOBALES */}
        {error && <Alert variant="danger" className="small py-2">{error}</Alert>}
        {successMsg && <Alert variant="success" className="small py-2">{successMsg}</Alert>}

        {/* VISTA 1: SELECTOR PRINCIPAL */}
        {view === "selector" && (
          <>
            <Button variant="primary" className="w-100 mb-2 py-2 fw-bold" onClick={() => cambiarVista("login")}>
              Iniciar sesión con correo
            </Button>
            <Button variant="outline-primary" className="w-100 mb-3 py-2 fw-bold" onClick={() => cambiarVista("register")}>
              Crear cuenta nueva
            </Button>
            <div className="divider my-3"><span>o</span></div>
            <div id="googleBtn" className="d-flex justify-content-center" style={{ width: '100%' }}></div>
          </>
        )}

        {/* VISTA 2: FORMULARIO DE RECUPERACIÓN DE CONTRASEÑA */}
        {view === "forgotPassword" && (
          <Form onSubmit={handleForgotPassword}>
            <p className="text-muted-custom small text-center mb-3">
              Ingresa tu correo electrónico y te enviaremos las instrucciones para crear una nueva contraseña.
            </p>
            <Form.Control 
              type="email" 
              placeholder="Tu correo electrónico" 
              className="mb-3" 
              required 
              onChange={e => setFormData({...formData, email: e.target.value})} 
            />
            <Button variant="primary" type="submit" className="w-100 fw-bold py-2" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Enviar enlace"}
            </Button>
          </Form>
        )}

        {/* VISTAS 3 Y 4: LOGIN Y REGISTRO */}
        {(view === "login" || view === "register") && (
          <Form onSubmit={handleSubmit}>
            {/* Campos exclusivos de Registro */}
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

            {/* Email (Compartido) */}
            <Form.Control 
              type="email" 
              placeholder="Email" 
              className="mb-2" 
              required 
              onChange={e => setFormData({...formData, email: e.target.value})} 
            />
            
            {/* Contraseña (Compartida) */}
            <Form.Group className={view === "login" ? "mb-1" : "mb-2"}>
              <InputGroup>
                <Form.Control 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Contraseña" 
                  required 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlash size={18}/> : <Eye size={18}/>}
                </Button>
              </InputGroup>
            </Form.Group>

            {/* Enlace de recuperación exclusivo de Login */}
            {view === "login" && (
              <div className="text-end mb-3">
                <Button variant="link" className="p-0 small text-decoration-none" onClick={() => cambiarVista("forgotPassword")}>
                  ¿Olvidaste tu contraseña?
                </Button>
              </div>
            )}

            {/* Confirmar contraseña exclusivo de Registro */}
            {view === "register" && (
              <Form.Control 
                type="password" 
                placeholder="Confirmar contraseña" 
                className="mb-3" 
                required 
                onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
              />
            )}
            
            <Button variant="primary" type="submit" className="w-100 fw-bold py-2 mt-2" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : (view === "login" ? "Entrar" : "Registrarme")}
            </Button>
          </Form>
        )}
      </Card>
    </Container>
  );
}