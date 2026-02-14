import { useState, useEffect } from "react";
import { Form, Button, Row, Col, Card, ListGroup, Spinner } from "react-bootstrap";
import api from "../api/axios";

export function AdminPanelFC() {
    const [cursos, setCursos] = useState([]);
    const [loadingCursos, setLoadingCursos] = useState(true);
    const [subiendo, setSubiendo] = useState(false); // Nuevo: para feedback de subida pesada
    
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
             // Llamada al nuevo endpoint dedicado para administración
            const res = await api.get(`/cursos/${cursoId}/contenidos-admin`);
            
            // La API ya debería devolverlos ordenados, pero aseguramos por si acaso
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
            await api.delete(`/contenidos/${id}`); // Ruta actualizada
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
        setSubiendo(true); // Bloqueamos UI para subida de archivos grandes
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

                // Axios usará el timeout: 0 que configuramos para el video de 1GB
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

    return (
                <Row>
            {/* SECCIÓN CURSOS */}
            <Col md={6}>
                <Card className="p-3 mb-4 shadow-sm border-0 admin-card">
                    <h5 className="fw-bold mb-3">{editandoCurso ? "Editar Curso" : "Nuevo Curso"}</h5>
                    <Form onSubmit={handleSubmitCurso}>
                        <Form.Control 
                            className="mb-2" 
                            placeholder="Título del curso" 
                            value={cursoDto.titulo}
                            onChange={e => setCursoDto({...cursoDto, titulo: e.target.value})} 
                            required
                        />
                        <Form.Control 
                            className="mb-2" 
                            placeholder="URL Imagen (R2)" 
                            value={cursoDto.imagenUrl}
                            onChange={e => setCursoDto({...cursoDto, imagenUrl: e.target.value})} 
                            required
                        />
                        <div className="d-flex gap-2">
                            <Button type="submit" variant={editandoCurso ? "warning" : "dark"} className="w-100">
                                {editandoCurso ? "Actualizar" : "Crear Curso"}
                            </Button>
                            {editandoCurso && <Button variant="secondary" onClick={() => {setEditandoCurso(null); setCursoDto({titulo:"", imagenUrl:""})}}>Cancelar</Button>}
                        </div>
                    </Form>
                    <hr />
                    <h6 className="fw-bold">Listado de Cursos</h6>
                    {loadingCursos ? <Spinner animation="border" size="sm" /> : (
                        <div className="border-container-custom shadow-sm mb-3">
                            <ListGroup 
                                variant="flush" 
                                style={{ maxHeight: '300px', overflowY: 'auto' }} 
                                className="custom-audio-list"
                            >
                                {cursos.map(c => (
                                    <ListGroup.Item key={c.id} className="d-flex justify-content-between align-items-center px-3 list-item-custom">
                                        <span className="small fw-bold">{c.titulo}</span>
                                        <div>
                                            <Button variant="link" size="sm" className="text-decoration-none" onClick={() => {setEditandoCurso(c.id); setCursoDto({titulo: c.titulo, imagenUrl: c.imagenUrl})}}>Editar</Button>
                                            <Button variant="link" size="sm" className="text-danger text-decoration-none" onClick={() => eliminarCurso(c.id)}>Eliminar</Button>
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
                <Card className="p-3 shadow-sm border-0 admin-card">
                    <h5 className="fw-bold mb-3">{editandoContenido ? "Editar Contenido" : "Gestión Multimedia"}</h5>
                    <Form onSubmit={handleSubmitContenido}>
                        <Form.Group className="mb-2">
                            <Form.Label className="small fw-bold">1. Seleccionar Curso</Form.Label>
                            <Form.Select 
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
                                {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label className="small fw-bold">2. Datos de la Lección</Form.Label>
                            <Form.Control 
                                className="mb-2" 
                                placeholder="Título (ej: Video Intro o Lesson 1)" 
                                value={contenidoData.titulo}
                                onChange={e => setContenidoData({...contenidoData, titulo: e.target.value})} 
                                required
                                disabled={subiendo}
                            />
                            <Row>
                                <Col xs={4}>
                                    <Form.Control 
                                        type="number" 
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
                                            // Aceptamos MP3 y MP4 (Video)
                                            accept="audio/mpeg, video/mp4" 
                                            onChange={e => setContenidoData({...contenidoData, archivo: e.target.files[0]})} 
                                            required
                                            disabled={subiendo}
                                        />
                                    ) : (
                                        <div className="alert alert-info py-1 px-2 small mb-0">
                                            Archivo bloqueado en edición.
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </Form.Group>
                        
                        <div className="d-flex gap-2">
                            <Button type="submit" variant={editandoContenido ? "warning" : "primary"} className="w-100 mt-2" disabled={!contenidoData.cursoId || subiendo}>
                                {subiendo ? (
                                    <><Spinner size="sm" className="me-2"/> Subiendo archivo pesado... No cierres la pestaña</>
                                ) : (
                                    editandoContenido ? "Guardar Cambios" : "Subir a R2 (Audio/Video)"
                                )}
                            </Button>
                            {editandoContenido && !subiendo && (
                                <Button variant="secondary" className="mt-2" onClick={cancelarEdicionContenido}>X</Button>
                            )}
                        </div>
                    </Form>

                    {contenidoData.cursoId && (
                        <div className="mt-4 animate__animated animate__fadeIn">
                            <h6 className="fw-bold small mb-2">Lecciones en este curso:</h6>
                            <div className="border-container-custom shadow-sm">
                                <ListGroup variant="flush" className="small custom-audio-list" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                    {contenidosCurso.length === 0 ? (
                                        <div className="p-4 text-center"><p className="text-muted-custom mb-0 italic">No hay contenido aún.</p></div>
                                    ) : (
                                        contenidosCurso.map(a => (
                                            <ListGroup.Item key={a.id} className="d-flex justify-content-between align-items-center px-3 list-item-custom">
                                                <div className="d-flex align-items-center overflow-hidden">
                                                    <span className="text-muted-custom me-2" style={{fontSize: '0.7rem', minWidth: '45px'}}>
                                                        {/* Detecta el tipo tanto por Enum (número) como por String */}
                                                        {(a.tipo === 1 || a.tipo === "Video") ? "🎥" : "🎧"} № {a.orden}
                                                    </span>
                                                    <span className="fw-medium text-truncate">{a.titulo}</span>
                                                </div>
                                                <div className="d-flex gap-2 ms-2">
                                                    <Button variant="link" size="sm" className="p-0 text-decoration-none" disabled={subiendo} onClick={() => prepararEdicionContenido(a)}>Editar</Button>
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
    );
}
