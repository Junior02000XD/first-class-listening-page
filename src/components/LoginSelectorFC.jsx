import { useCallback, useEffect, useState, useContext } from "react";
import { Container, Card, Button, Form, Spinner, Row, Col, Alert, InputGroup } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";
import { Eye, EyeSlash } from "react-bootstrap-icons";

export function LoginSelectorFC() {
  const { login } = useContext(AuthContext);
  const [view, setView] = useState("selector");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [animate, setAnimate] = useState(true);
  
  const initialState = { 
    email: "", password: "", confirmPassword: "", 
    nombre: "", apellido: "", pais: "", ciudad: "", fechaNacimiento: "" 
  };
  const [formData, setFormData] = useState(initialState);
  
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
               nombre: formData.nombre, apellido: formData.apellido,
               pais: formData.pais, ciudad: formData.ciudad,
               fechaCumpleaños: formData.fechaNacimiento,
               rol: 2, email: formData.email,
               valor: formData.password, tipo: 0 
             };
       
       const res = await api.post(endpoint, payload);
       login(res.data);

       if (pendingCode) {
         try { await api.post(`/codigos/canjear/${pendingCode}`); } 
         catch (redeemErr) { console.error("Error al canjear código", redeemErr); }
       }
       navigate("/cursos");
    } catch (err) {
       setError(err.response?.data?.mensaje || "Error en la operación. Revisa los datos.");
    } finally { 
       setLoading(false); 
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      await api.post("/usuarios/recuperar-password", { email: formData.email });
      setSuccessMsg("Si el correo existe, hemos enviado un enlace para restablecer tu contraseña.");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  const cambiarVista = (nuevaVista) => {
    setAnimate(false);
    setTimeout(() => {
      setView(nuevaVista);
      setError("");
      setSuccessMsg("");
      setShowPassword(false);
      setFormData(initialState);
      setAnimate(true);
    }, 150);
  };

  // ESTILOS COMUNES PARA INPUTS (Para mantener legibilidad sobre fondo oscuro)
  const inputStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: '#2E1572',
    border: 'none'
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "85vh" }}>
      <Card 
        className="login-card p-4 shadow-lg border-0 rounded-4" 
        style={{ 
          maxWidth: view === "selector" ? '400px' : '480px', 
          width: '100%', 
          transition: 'max-width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          backgroundColor: 'rgba(0, 0, 0, 0.25)', // Fondo oscuro con transparencia
          backdropFilter: 'blur(12px)', // Efecto cristal
          color: '#FFFFFF' // Todo el texto blanco por defecto
        }}
      >
        <div style={{ opacity: animate ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}>
          
          {view !== "selector" && (
            <Button variant="link" className="p-0 mb-3 text-decoration-none text-start" style={{ color: '#DEB831' }} onClick={() => cambiarVista("selector")}>
              ← Volver
            </Button>
          )}

          <div className="text-center mb-4">
            {/* Título en Dorado Corporativo */}
            <h2 className="fw-bold mb-1" style={{ color: '#DEB831', fontFamily: '"Baloo 2", sans-serif' }}>First Class</h2>
            {/* Subtítulo en blanco semitransparente */}
            <h5 className="fw-normal" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {view === "selector" && "Inicia sesión en tu cuenta"}
              {view === "login" && "¡Hola de nuevo!"}
              {view === "register" && "Crea tu cuenta de estudiante"}
              {view === "forgotPassword" && "Recuperar Contraseña"}
            </h5>
          </div>

          {error && <Alert variant="danger" className="small py-2 border-0 shadow-sm">{error}</Alert>}
          {successMsg && <Alert variant="success" className="small py-2 border-0 shadow-sm">{successMsg}</Alert>}

          {view === "selector" && (
            <>
              {/* Botón Principal (Dorado con texto Morado) */}
              <Button 
                className="w-100 mb-3 py-2 fw-bold border-0 shadow-sm" 
                style={{ backgroundColor: '#DEB831', color: '#2E1572' }}
                onClick={() => cambiarVista("login")}
              >
                Iniciar sesión con correo
              </Button>
              
              {/* Botón Secundario (Borde Dorado, Fondo Transparente, Texto Dorado) */}
              <Button 
                className="w-100 mb-4 py-2 fw-bold shadow-sm" 
                style={{ backgroundColor: 'transparent', border: '2px solid #DEB831', color: '#DEB831' }} 
                onClick={() => cambiarVista("register")}
              >
                Crear cuenta nueva
              </Button>
              
              {/* Separador usando Flexbox para evitar fondos sólidos incompatibles */}
              <div className="d-flex align-items-center mb-4">
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}></div>
                <span className="px-3 small" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>o continúa con</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}></div>
              </div>
              
              <div id="googleBtn" className="d-flex justify-content-center" style={{ width: '100%' }}></div>
            </>
          )}

          {view === "forgotPassword" && (
            <Form onSubmit={handleForgotPassword}>
              <p className="small text-center mb-3" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Ingresa tu correo electrónico y te enviaremos las instrucciones para crear una nueva contraseña.
              </p>
              <Form.Control 
                type="email" placeholder="Tu correo electrónico" className="mb-3 py-2 shadow-sm" 
                style={inputStyle} required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
              />
              <Button type="submit" className="w-100 fw-bold py-2 border-0 shadow-sm" style={{ backgroundColor: '#DEB831', color: '#2E1572' }} disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : "Enviar enlace"}
              </Button>
            </Form>
          )}

          {(view === "login" || view === "register") && (
            <Form onSubmit={handleSubmit}>
              {view === "register" && (
                <>
                  <Row className="mb-2 g-2">
                    <Col><Form.Control placeholder="Nombre" style={inputStyle} className="shadow-sm" required value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} /></Col>
                    <Col><Form.Control placeholder="Apellido" style={inputStyle} className="shadow-sm" required value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} /></Col>
                  </Row>
                  <Row className="mb-2 g-2">
                    <Col><Form.Control placeholder="País" style={inputStyle} className="shadow-sm" required value={formData.pais} onChange={e => setFormData({...formData, pais: e.target.value})} /></Col>
                    <Col><Form.Control placeholder="Ciudad" style={inputStyle} className="shadow-sm" required value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} /></Col>
                  </Row>
                  <Form.Group className="mb-2">
                    <Form.Label className="small mb-1" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Fecha de Nacimiento</Form.Label>
                    <Form.Control type="date" style={inputStyle} className="shadow-sm" required value={formData.fechaNacimiento} onChange={e => setFormData({...formData, fechaNacimiento: e.target.value})} />
                  </Form.Group>
                </>
              )}

              <Form.Control 
                type="email" placeholder="Email" className="mb-3 py-2 shadow-sm" 
                style={inputStyle} required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
              />
              
              <Form.Group className={view === "login" ? "mb-1" : "mb-3"}>
                <InputGroup className="shadow-sm rounded overflow-hidden">
                  <Form.Control 
                    type={showPassword ? "text" : "password"} placeholder="Contraseña" style={inputStyle} className="py-2"
                    required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} 
                  />
                  <Button variant="light" className="border-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeSlash size={18} color="#2E1572"/> : <Eye size={18} color="#2E1572"/>}
                  </Button>
                </InputGroup>
              </Form.Group>

              {view === "login" && (
                <div className="text-end mb-3">
                  <Button variant="link" className="p-0 small text-decoration-none" style={{ color: '#DEB831' }} onClick={() => cambiarVista("forgotPassword")}>
                    ¿Olvidaste tu contraseña?
                  </Button>
                </div>
              )}

              {view === "register" && (
                <Form.Control 
                  type="password" placeholder="Confirmar contraseña" className="mb-4 py-2 shadow-sm" 
                  style={inputStyle} required value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                />
              )}
              
              <Button 
                type="submit" 
                className="w-100 fw-bold py-2 border-0 shadow-sm" 
                style={{ backgroundColor: '#DEB831', color: '#2E1572' }} 
                disabled={loading}
              >
                {loading ? <Spinner animation="border" size="sm" /> : (view === "login" ? "Entrar" : "Registrarme")}
              </Button>
            </Form>
          )}
        </div>
      </Card>
    </Container>
  );
}