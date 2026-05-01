import { useState, useEffect } from "react";
import { Form, Button, Row, Col, Card, ListGroup, Spinner, Badge } from "react-bootstrap";
import api from "../api/axios";

export function AdminPanelFC() {
    const [cursos, setCursos] = useState([]);
    const [loadingCursos, setLoadingCursos] = useState(true);
    const [subiendo, setSubiendo] = useState(false); 
    
    // Estados para Cursos
    const [cursoDto, setCursoDto] = useState({ titulo: "", imagenUrl: "" });
    const [editandoCurso, setEditandoCurso] = useState(null);

    // Estados para Contenidos (Antes Audios)
    const [contenidoData, setContenidoData] = useState({ cursoId: "", titulo: "", archivo: null, orden: 0 });
    const [contenidosCurso, setContenidosCurso] = useState([]); 
    const [editandoContenido, setEditandoContenido] = useState(null);

    useEffect(() => {
        cargarCursos();
    }, []);

    const cargarCursos = async () => {
        try {
            const res = await api.get("/cursos");
            setCursos(res.data);
        } catch (err) {
            console.error("Error al cargar cursos", err);
        } finally {
            setLoadingCursos(false);
        }
    };

    const cargarContenidosDelCurso = async (cursoId) => {
        if (!cursoId) return;
        try {
            const res = await api.get(`/cursos/${cursoId}/contenidos-admin`);
            const datos = Array.isArray(res.data) ? res.data : [];
            setContenidosCurso(datos.sort((a, b) => a.orden - b.orden));
        } catch (err) {
            console.error("Error al cargar contenidos del curso", err);
            setContenidosCurso([]);
        }
    };

    // --- LÓGICA DE CURSOS ---
    const handleSubmitCurso = async (e) => {
        e.preventDefault();
        try {
            if (editandoCurso) {
                await api.put(`/cursos/${editandoCurso}`, cursoDto);
                alert("Curso actualizado");
            } else {
                await api.post("/cursos", cursoDto);
                alert("Curso creado");
            }
            setCursoDto({ titulo: "", imagenUrl: "" });
            setEditandoCurso(null);
            cargarCursos();
        } catch { alert("Error en la operación de curso"); }
    };

    const eliminarCurso = async (id) => {
        if (!window.confirm("¿Eliminar este curso y todos sus contenidos (Audios/Videos)?")) return;
        try {
            await api.delete(`/cursos/${id}`);
            cargarCursos();
        } catch { alert("No se pudo eliminar el curso"); }
    };

    // --- LÓGICA DE CONTENIDOS ---
    const eliminarContenido = async (id) => {
        if (!window.confirm("¿Eliminar este contenido permanentemente?")) return;
        try {
            await api.delete(`/contenidos/${id}`);
            cargarContenidosDelCurso(contenidoData.cursoId);
        } catch { alert("Error al eliminar contenido"); }
    };

    const prepararEdicionContenido = (item) => {
        setEditandoContenido(item.id);
        setContenidoData({
            ...contenidoData,
            titulo: item.titulo,
            orden: item.orden || item.id,
            archivo: null 
        });
    };

    const cancelarEdicionContenido = () => {
        setEditandoContenido(null);
        setContenidoData({ ...contenidoData, titulo: "", orden: 0, archivo: null });
    };

    const handleSubmitContenido = async (e) => {
        e.preventDefault();
        setSubiendo(true); 
        try {
            if (editandoContenido) {
                await api.put(`/contenidos/${editandoContenido}`, {
                    titulo: contenidoData.titulo,
                    orden: parseInt(contenidoData.orden)
                });
                alert("Contenido actualizado con éxito");
            } else {
                const formData = new FormData();
                formData.append("titulo", contenidoData.titulo);
                formData.append("cursoId", contenidoData.cursoId);
                formData.append("archivo", contenidoData.archivo);
                formData.append("orden", contenidoData.orden);

                await api.post("/contenidos", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                alert("Contenido multimedia subido con éxito");
            }
            cancelarEdicionContenido();
            cargarContenidosDelCurso(contenidoData.cursoId);
        } catch (err) {
            alert(err.response?.data?.mensaje || "Error en la operación multimedia");
        } finally {
            setSubiendo(false);
        }
    };

    // --- ESTILOS COMPARTIDOS ---
    const cardStyle = {
        backgroundColor: 'rgba(0, 0, 0, 0.25)', 
        backdropFilter: 'blur(12px)', 
        color: '#FFFFFF',
        borderRadius: '16px'
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
        <div className="py-4">
            <h2 className="mb-4 fw-bold text-center" style={{ color: '#DEB831', fontFamily: '"Baloo 2", sans-serif' }}>
                Panel de Administración
            </h2>
            <Row className="g-4">
                {/* SECCIÓN CURSOS */}
                <Col md={6}>
                    <Card className="p-4 shadow-lg border-0 h-100" style={cardStyle}>
                        <h5 className="fw-bold mb-4" style={{ color: '#DEB831' }}>
                            {editandoCurso ? "Editar Curso" : "Nuevo Curso"}
                        </h5>
                        <Form onSubmit={handleSubmitCurso}>
                            <Form.Control 
                                className="mb-3 py-2 shadow-sm" 
                                style={inputStyle}
                                placeholder="Título del curso" 
                                value={cursoDto.titulo}
                                onChange={e => setCursoDto({...cursoDto, titulo: e.target.value})} 
                                required
                            />
                            <Form.Control 
                                className="mb-3 py-2 shadow-sm" 
                                style={inputStyle}
                                placeholder="URL Imagen (R2)" 
                                value={cursoDto.imagenUrl}
                                onChange={e => setCursoDto({...cursoDto, imagenUrl: e.target.value})} 
                                required
                            />
                            <div className="d-flex gap-2">
                                <Button type="submit" className="w-100 py-2 shadow-sm" style={editandoCurso ? { backgroundColor: '#FFC107', color: '#000', border: 'none', fontWeight: 'bold' } : btnPrimaryStyle}>
                                    {editandoCurso ? "Actualizar Curso" : "Crear Curso"}
                                </Button>
                                {editandoCurso && (
                                    <Button variant="outline-light" className="py-2" onClick={() => {setEditandoCurso(null); setCursoDto({titulo:"", imagenUrl:""})}}>
                                        Cancelar
                                    </Button>
                                )}
                            </div>
                        </Form>

                        <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} className="my-4" />
                        
                        <h6 className="fw-bold mb-3" style={{ color: 'rgba(255,255,255,0.8)' }}>Listado de Cursos</h6>
                        {loadingCursos ? <div className="text-center"><Spinner animation="border" style={{ color: '#DEB831' }} /></div> : (
                            <div className="rounded overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}>
                                <ListGroup variant="flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {cursos.map(c => (
                                        <ListGroup.Item key={c.id} className="d-flex justify-content-between align-items-center px-3 py-3 border-bottom border-dark bg-transparent text-white">
                                            <div className="d-flex align-items-center">
                                                <Badge className="me-3 px-2 py-1 shadow-sm" style={{ backgroundColor: '#2E1572', border: '1px solid #DEB831', color: '#DEB831' }}>
                                                    ID: {c.id}
                                                </Badge>
                                                <span className="fw-medium">{c.titulo}</span>
                                            </div>
                                            <div>
                                                <Button variant="link" size="sm" style={{ color: '#DEB831' }} className="text-decoration-none fw-bold" onClick={() => {setEditandoCurso(c.id); setCursoDto({titulo: c.titulo, imagenUrl: c.imagenUrl})}}>Editar</Button>
                                                <Button variant="link" size="sm" className="text-danger text-decoration-none fw-bold" onClick={() => eliminarCurso(c.id)}>Eliminar</Button>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            </div>
                        )}
                    </Card>
                </Col>

                {/* SECCIÓN CONTENIDOS (AUDIOS Y VIDEOS) */}
                <Col md={6}>
                    <Card className="p-4 shadow-lg border-0 h-100" style={cardStyle}>
                        <h5 className="fw-bold mb-4" style={{ color: '#DEB831' }}>
                            {editandoContenido ? "Editar Contenido" : "Gestión Multimedia"}
                        </h5>
                        <Form onSubmit={handleSubmitContenido}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>1. Seleccionar Curso</Form.Label>
                                <Form.Select 
                                    className="py-2 shadow-sm"
                                    style={inputStyle}
                                    value={contenidoData.cursoId} 
                                    disabled={editandoContenido || subiendo} 
                                    onChange={e => {
                                        const id = e.target.value;
                                        setContenidoData({...contenidoData, cursoId: id});
                                        cargarContenidosDelCurso(id);
                                    }}
                                    required
                                >
                                    <option value="">Seleccione un curso...</option>
                                    {cursos.map(c => <option key={c.id} value={c.id}>[ID: {c.id}] - {c.titulo}</option>)}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>2. Datos de la Lección</Form.Label>
                                <Form.Control 
                                    className="mb-3 py-2 shadow-sm" 
                                    style={inputStyle}
                                    placeholder="Título (ej: Video Intro o Lesson 1)" 
                                    value={contenidoData.titulo}
                                    onChange={e => setContenidoData({...contenidoData, titulo: e.target.value})} 
                                    required
                                    disabled={subiendo}
                                />
                                <Row className="g-2">
                                    <Col xs={4}>
                                        <Form.Control 
                                            type="number" 
                                            className="py-2 shadow-sm"
                                            style={inputStyle}
                                            placeholder="Orden" 
                                            value={contenidoData.orden}
                                            onChange={e => setContenidoData({...contenidoData, orden: e.target.value})} 
                                            required
                                            disabled={subiendo}
                                        />
                                    </Col>
                                    <Col xs={8}>
                                        {!editandoContenido ? (
                                            <Form.Control 
                                                type="file" 
                                                className="py-2 shadow-sm"
                                                style={{ ...inputStyle, cursor: 'pointer' }}
                                                accept="audio/mpeg, video/mp4" 
                                                onChange={e => setContenidoData({...contenidoData, archivo: e.target.files[0]})} 
                                                required
                                                disabled={subiendo}
                                            />
                                        ) : (
                                            <div className="alert border-0 py-2 px-3 small mb-0 h-100 d-flex align-items-center" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' }}>
                                                🔒 Archivo bloqueado en edición.
                                            </div>
                                        )}
                                    </Col>
                                </Row>
                            </Form.Group>
                            
                            <div className="d-flex gap-2">
                                <Button type="submit" className="w-100 py-2 shadow-sm" style={editandoContenido ? { backgroundColor: '#FFC107', color: '#000', border: 'none', fontWeight: 'bold' } : btnPrimaryStyle} disabled={!contenidoData.cursoId || subiendo}>
                                    {subiendo ? (
                                        <><Spinner size="sm" className="me-2"/> Subiendo archivo... No cierres</>
                                    ) : (
                                        editandoContenido ? "Guardar Cambios" : "Subir a R2 (Audio/Video)"
                                    )}
                                </Button>
                                {editandoContenido && !subiendo && (
                                    <Button variant="outline-light" className="py-2 px-3" onClick={cancelarEdicionContenido}>✕</Button>
                                )}
                            </div>
                        </Form>

                        {contenidoData.cursoId && (
                            <div className="mt-4 animate__animated animate__fadeIn">
                                <h6 className="fw-bold mb-3" style={{ color: 'rgba(255,255,255,0.8)' }}>Lecciones en este curso:</h6>
                                <div className="rounded overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}>
                                    <ListGroup variant="flush" className="small" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                        {contenidosCurso.length === 0 ? (
                                            <div className="p-4 text-center"><p className="mb-0" style={{ color: 'rgba(255,255,255,0.5)' }}>No hay contenido aún.</p></div>
                                        ) : (
                                            contenidosCurso.map(a => (
                                                <ListGroup.Item key={a.id} className="d-flex justify-content-between align-items-center px-3 py-3 border-bottom border-dark bg-transparent text-white">
                                                    <div className="d-flex align-items-center overflow-hidden pe-2">
                                                        <span className="me-3" style={{ fontSize: '0.85rem', color: '#DEB831', minWidth: '45px' }}>
                                                            {(a.tipo === 1 || a.tipo === "Video") ? "🎥" : "🎧"} № {a.orden}
                                                        </span>
                                                        <span className="fw-medium text-truncate">{a.titulo}</span>
                                                    </div>
                                                    <div className="d-flex gap-2 flex-shrink-0">
                                                        <Button variant="link" size="sm" className="p-0 text-decoration-none fw-bold" style={{ color: '#DEB831' }} disabled={subiendo} onClick={() => prepararEdicionContenido(a)}>Editar</Button>
                                                        <Button variant="link" size="sm" className="text-danger text-decoration-none p-0 fw-bold" disabled={subiendo} onClick={() => eliminarContenido(a.id)}>Eliminar</Button>
                                                    </div>
                                                </ListGroup.Item>
                                            ))
                                        )}
                                    </ListGroup>
                                </div>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
}