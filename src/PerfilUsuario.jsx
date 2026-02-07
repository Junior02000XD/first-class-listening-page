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
    
    // Eliminamos los useEffects de sincronización y usamos el estado inicial 
    // Basado en el objeto user actual.
    const [formData, setFormData] = useState({
        nombre: user?.nombre || "",
        apellido: user?.apellido || "",
        pais: user?.pais || "N/A",
        ciudad: user?.ciudad || "N/A",
        fechaCumpleaños: user?.fechaCumpleaños || ""
    });

    // Solo mantenemos el Effect que consulta la API externa (Historial de canjes)
    useEffect(() => {
        if (user?.id) { // Verificamos que el ID exista
            api.get("/codigos/mis-canjes")
                .then(res => setCanjes(res.data))
                .catch(err => console.error("Error al cargar canjes", err));
        }
    }, [user?.id]); // Usamos el ID como dependencia para evitar re-ejecuciones

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/usuarios/${user.id}`, formData);
            
            // Actualizamos el contexto
            login({
                ...user,
                ...formData,
                rolUsuario: user.rol,
                token: localStorage.getItem("token")
            });

            setMsg({ type: "success", text: "¡Perfil actualizado!" });
            setEditMode(false);
        } catch {
            setMsg({ type: "danger", text: "Error al actualizar." });
        }
    };


    return (
        <>
            <NavbarFC />
            <Container className="my-5" style={{ minHeight: '80vh' }}>
                <Row className="g-4">
                    {/* Columna Izquierda: Perfil e Historial */}
                    <Col lg={4}>
                        <Card className="border-0 shadow-sm p-4 text-center admin-card">
                            <div className="mb-3">
                                <div className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center text-white fw-bold shadow-sm" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                                    {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                                </div>
                            </div>
                            <h4 className="fw-bold">{user?.nombre} {user?.apellido}</h4>
                            <p className="text-muted-custom small mb-3">{user?.email}</p>
                            <hr />
                            
                            {!editMode ? (
                                <div className="text-start animate__animated animate__fadeIn">
                                    <div className="mb-3 p-2 rounded">
                                        <p className="mb-1 small"><strong>País:</strong> {user?.pais || "N/A"}</p>
                                        <p className="mb-1 small"><strong>Ciudad:</strong> {user?.ciudad || "N/A"}</p>
                                        <p className="mb-0 small"><strong>Cumpleaños:</strong> {user?.fechaCumpleaños || "No definida"}</p>
                                    </div>
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm" 
                                        className="w-100 fw-bold" 
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
                                    
                                    <hr />
                                    <h6 className="fw-bold mb-3 small">Códigos Activados</h6>
                                    <div className="custom-scroll text-start pe-2" style={{maxHeight: '200px', overflowY: 'auto'}}>
                                        {canjes.length > 0 ? (
                                            canjes.map((c, i) => (
                                                <div key={i} className="mb-2 p-2 bg-white rounded border-start border-primary border-4 shadow-sm">
                                                    <div className="fw-bold text-dark" style={{fontSize: '0.8rem'}}>{c.cursoTitulo}</div>
                                                    <code className="text-primary d-block" style={{fontSize: '0.75rem'}}>{c.valor}</code>
                                                    <span className="text-muted" style={{fontSize: '0.65rem'}}>{new Date(c.fechaCanje).toLocaleDateString()}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="small italic text-muted-custom text-center py-3">Aún no has canjeado códigos.</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <Form onSubmit={handleUpdate} className="text-start animate__animated animate__fadeIn">
                                    <Form.Group className="mb-2">
                                        <Form.Label className="small fw-bold">País</Form.Label>
                                        <Form.Control size="sm" value={formData.pais} onChange={e => setFormData({...formData, pais: e.target.value})} placeholder="Ej: México" />
                                    </Form.Group>
                                    <Form.Group className="mb-2">
                                        <Form.Label className="small fw-bold">Ciudad</Form.Label>
                                        <Form.Control size="sm" value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} placeholder="Ej: Guadalajara" />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold">Fecha de Nacimiento</Form.Label>
                                        <Form.Control size="sm" type="date" value={formData.fechaCumpleaños} onChange={e => setFormData({...formData, fechaCumpleaños: e.target.value})} />
                                    </Form.Group>
                                    <div className="d-flex gap-2">
                                        <Button type="submit" variant="primary" size="sm" className="w-100 fw-bold">Guardar</Button>
                                        <Button variant="light" size="sm" onClick={() => setEditMode(false)}>Cancelar</Button>
                                    </div>
                                </Form>
                            )}
                            {msg.text && <Alert variant={msg.type} className="mt-3 py-2 small fw-bold">{msg.text}</Alert>}
                        </Card>
                    </Col>

                    {/* Columna Derecha: Cursos */}
                    <Col lg={8}>
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <h3 className="fw-bold mb-0">Mi Biblioteca</h3>
                            <div className="badge bg-success shadow-sm px-3 py-2">Mis Cursos</div>
                        </div>
                        <div className="rounded-4 p-2 p-md-4 shadow-inner border" style={{ minHeight: '450px' }}>
                            <CursosDisponiblesFC soloMios={true} />
                        </div>
                    </Col>
                </Row>
            </Container>
            <FooterFC />
        </>
    );
}
