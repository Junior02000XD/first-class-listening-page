import { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { AuthContext } from "./context/AuthContext";
import { CursosDisponiblesFC } from "./components/CursosDisponiblesFC";
import api from "./api/axios";
import NavbarFC from "./components/NavbarFC";
import FooterFC from "./components/FooterFC";
import './PerfilUsuario.css';

export function PerfilUsuario() {
    const { user, login } = useContext(AuthContext);
    
    const [editMode, setEditMode] = useState(false);
    const [canjes, setCanjes] = useState([]);
    const [msg, setMsg] = useState({ type: "", text: "" });
    
    const [formData, setFormData] = useState({
        nombre: user?.nombre || "",
        apellido: user?.apellido || "",
        pais: user?.pais || "N/A",
        ciudad: user?.ciudad || "N/A",
        fechaCumpleaños: user?.fechaCumpleaños || "",
        email: user?.email || "",
        valor: "",
        tipo: 0,
        rol: user?.rolUsuario || 2
    });

    useEffect(() => {
        if (user?.id) {
            api.get("/codigos/mis-canjes")
                .then(res => setCanjes(res.data))
                .catch(err => console.error("Error al cargar historial:", err));
        }
    }, [user?.id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/usuarios/${user.id}`, {
                ...formData,
                fechaCumpleaños: formData.fechaCumpleaños
            });
            
            login(res.data);

            setMsg({ type: "success", text: "¡Perfil actualizado con éxito!" });
            setEditMode(false);
            
            setTimeout(() => setMsg({ type: "", text: "" }), 3000);
        } catch (err) {
            setMsg({ type: "danger", text: err.response?.data?.mensaje || "Error al actualizar." });
        }
    };

    // --- ESTILOS COMPARTIDOS ---
    const glassCardStyle = {
        backgroundColor: 'rgba(0, 0, 0, 0.25)', 
        backdropFilter: 'blur(12px)', 
        color: '#FFFFFF',
        borderRadius: '16px',
        border: 'none'
    };

    const inputStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        color: '#2E1572',
        border: 'none'
    };

    const btnPrimaryStyle = {
        backgroundColor: '#DEB831',
        borderColor: '#DEB831',
        color: '#2E1572',
        fontWeight: 'bold'
    };

    return (
        <>
            <NavbarFC />
            <Container className="my-5 animate__animated animate__fadeIn" style={{ minHeight: '80vh' }}>
                <Row className="g-4">
                    {/* Columna Izquierda: Perfil e Historial */}
                    <Col lg={4}>
                        <Card className="shadow-lg p-4 text-center h-100" style={glassCardStyle}>
                            <div className="mb-3">
                                <div className="rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm" 
                                     style={{ width: '90px', height: '90px', fontSize: '2.5rem', backgroundColor: '#DEB831', color: '#2E1572', border: '3px solid rgba(255,255,255,0.2)' }}>
                                    {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                                </div>
                            </div>
                            <h4 className="fw-bold" style={{ color: '#DEB831' }}>{user?.nombre} {user?.apellido}</h4>
                            <p className="small mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>{user?.email}</p>
                            
                            <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                            
                            {!editMode ? (
                                <div className="text-start animate__animated animate__fadeIn">
                                    <div className="mb-4 p-3 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}>
                                        <p className="mb-2 small" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                            <strong style={{ color: '#DEB831' }}>País:</strong> {user?.pais || "N/A"}
                                        </p>
                                        <p className="mb-2 small" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                            <strong style={{ color: '#DEB831' }}>Ciudad:</strong> {user?.ciudad || "N/A"}
                                        </p>
                                        <p className="mb-0 small" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                            <strong style={{ color: '#DEB831' }}>Cumpleaños:</strong> {user?.fechaCumpleaños || "No definida"}
                                        </p>
                                    </div>
                                    <Button 
                                        className="w-100 py-2 shadow-sm" 
                                        style={btnPrimaryStyle}
                                        onClick={() => {
                                            setFormData({
                                                nombre: user.nombre,
                                                apellido: user.apellido,
                                                pais: user.pais,
                                                ciudad: user.ciudad,
                                                fechaCumpleaños: user.fechaCumpleaños
                                            });
                                            setEditMode(true);
                                        }}
                                    >
                                        Editar Datos
                                    </Button>
                                    
                                    <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} className="my-4" />
                                    
                                    <h6 className="fw-bold mb-3 small" style={{ color: '#DEB831' }}>Códigos Activados</h6>
                                    <div className="custom-scroll text-start pe-2 rounded" style={{maxHeight: '220px', overflowY: 'auto', backgroundColor: 'rgba(0,0,0,0.15)', padding: '10px'}}>
                                        {canjes.length > 0 ? (
                                            canjes.map((c, i) => (
                                                <div key={i} className="mb-3 p-2 rounded border-start border-4 shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: '#DEB831 !important' }}>
                                                    <div className="fw-bold" style={{fontSize: '0.85rem', color: '#FFFFFF'}}>{c.cursoTitulo}</div>
                                                    <code className="d-block mt-1 mb-1 px-2 py-1 rounded" style={{fontSize: '0.75rem', backgroundColor: 'rgba(0,0,0,0.3)', color: '#DEB831'}}>{c.valor}</code>
                                                    <span className="small d-block text-end" style={{fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)'}}>{new Date(c.fechaCanje).toLocaleDateString()}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="small fst-italic text-center py-3 m-0" style={{ color: 'rgba(255,255,255,0.5)' }}>Aún no has canjeado códigos.</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <Form onSubmit={handleUpdate} className="text-start animate__animated animate__fadeIn">
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>País</Form.Label>
                                        <Form.Control className="py-2 shadow-sm" style={inputStyle} value={formData.pais} onChange={e => setFormData({...formData, pais: e.target.value})} placeholder="Ej: Bolivia" />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>Ciudad</Form.Label>
                                        <Form.Control className="py-2 shadow-sm" style={inputStyle} value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} placeholder="Ej: Santa Cruz de la Sierra" />
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="small fw-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>Fecha de Nacimiento</Form.Label>
                                        <Form.Control className="py-2 shadow-sm" style={inputStyle} type="date" value={formData.fechaCumpleaños} onChange={e => setFormData({...formData, fechaCumpleaños: e.target.value})} />
                                    </Form.Group>
                                    <div className="d-flex gap-2">
                                        <Button type="submit" className="w-100 py-2 shadow-sm" style={btnPrimaryStyle}>Guardar</Button>
                                        <Button variant="outline-light" className="w-100 py-2" onClick={() => setEditMode(false)}>Cancelar</Button>
                                    </div>
                                </Form>
                            )}
                            {msg.text && <Alert variant={msg.type} className="mt-4 py-2 small fw-bold border-0 shadow-sm">{msg.text}</Alert>}
                        </Card>
                    </Col>

                    {/* Columna Derecha: Cursos */}
                    <Col lg={8}>
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <h3 className="fw-bold mb-0" style={{ color: '#DEB831', fontFamily: '"Baloo 2", sans-serif' }}>Mi Biblioteca</h3>
                            <div className="badge shadow-sm px-3 py-2" style={{ backgroundColor: '#2E1572', color: '#DEB831', border: '1px solid #DEB831' }}>Mis Cursos</div>
                        </div>
                        <div className="rounded-4 p-3 shadow-lg" style={{ minHeight: '450px', backgroundColor: 'rgba(0, 0, 0, 0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <CursosDisponiblesFC soloMios={true} />
                        </div>
                    </Col>
                </Row>
            </Container>
            <FooterFC />
        </>
    );
}