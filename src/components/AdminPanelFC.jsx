import { useState, useEffect } from "react";
import { Form, Button, Row, Col, Card, ListGroup, Spinner } from "react-bootstrap";
import api from "../api/axios";

export function AdminPanelFC() {
    const [cursos, setCursos] = useState([]);
    const [loadingCursos, setLoadingCursos] = useState(true);
    
    // Estados para Cursos
    const [cursoDto, setCursoDto] = useState({ titulo: "", imagenUrl: "" });
    const [editandoCurso, setEditandoCurso] = useState(null); // ID del curso en edición

    // Estados para Audios
    const [audioData, setAudioData] = useState({ cursoId: "", titulo: "", archivo: null, orden: 0 });
    const [audiosCurso, setAudiosCurso] = useState([]); // Audios del curso seleccionado

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

    const cargarAudiosDelCurso = async (cursoId) => {
        if (!cursoId) return;
        try {
            // Usamos el endpoint que ya tienes para ver detalle de curso (que trae audios)
            const res = await api.get(`/audio-access/curso/${cursoId}`);
            setAudiosCurso(res.data.audios || []);
        } catch {
            setAudiosCurso([]);
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
        if (!window.confirm("¿Eliminar este curso y todos sus audios?")) return;
        try {
            await api.delete(`/cursos/${id}`);
            cargarCursos();
        } catch { alert("No se pudo eliminar"); }
    };

    // --- LÓGICA DE AUDIOS ---
    const subirAudio = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("titulo", audioData.titulo);
        formData.append("cursoId", audioData.cursoId);
        formData.append("archivo", audioData.archivo);
        formData.append("orden", audioData.orden);

        try {
            await api.post("/audios", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert("Audio subido con éxito");
            cargarAudiosDelCurso(audioData.cursoId);
        } catch { alert("Error al subir audio"); }
    };

    const eliminarAudio = async (id) => {
        if (!window.confirm("¿Eliminar este audio?")) return;
        try {
            await api.delete(`/audios/${id}`);
            cargarAudiosDelCurso(audioData.cursoId);
        } catch { alert("Error al eliminar audio"); }
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

            {/* SECCIÓN AUDIOS */}
            <Col md={6}>
                <Card className="p-3 shadow-sm border-0 admin-card">
                    <h5 className="fw-bold mb-3">Gestión de Audios</h5>
                    <Form onSubmit={subirAudio}>
                        <Form.Group className="mb-2">
                            <Form.Label className="small fw-bold">1. Seleccionar Curso</Form.Label>
                            <Form.Select 
                                value={audioData.cursoId} 
                                onChange={e => {
                                    setAudioData({...audioData, cursoId: e.target.value});
                                    cargarAudiosDelCurso(e.target.value);
                                }}
                                required
                            >
                                <option value="">Seleccione un curso...</option>
                                {cursos.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-2">
                            <Form.Label className="small fw-bold">2. Datos del Audio</Form.Label>
                            <Form.Control 
                                className="mb-2" 
                                placeholder="Título del Audio (ej: Lesson 1)" 
                                onChange={e => setAudioData({...audioData, titulo: e.target.value})} 
                                required
                            />
                            <Row>
                                <Col>
                                    <Form.Control 
                                        type="number" 
                                        placeholder="Orden" 
                                        onChange={e => setAudioData({...audioData, orden: e.target.value})} 
                                        required
                                    />
                                </Col>
                                <Col>
                                    <Form.Control 
                                        type="file" 
                                        accept="audio/mpeg" 
                                        onChange={e => setAudioData({...audioData, archivo: e.target.files[0]})} 
                                        required
                                    />
                                </Col>
                            </Row>
                        </Form.Group>
                        <Button type="submit" variant="primary" className="w-100 mt-2" disabled={!audioData.cursoId}>
                            Subir MP3 a R2 Privado
                        </Button>
                    </Form>

                    {audioData.cursoId && (
                        <div className="mt-4 animate__animated animate__fadeIn"> {/* Añadí una pequeña animación si usas animate.css */}
                            <h6 className="fw-bold small mb-2 text-primary">Audios en este curso:</h6>
                            
                            {/* CONTENEDOR CON BORDE */}
                            <div className="border-container-custom shadow-sm">
                                <ListGroup 
                                    variant="flush" 
                                    className="small custom-audio-list"
                                    style={{ maxHeight: '250px', overflowY: 'auto' }}
                                >
                                    {audiosCurso.length === 0 ? (
                                        <div className="p-4 text-center">
                                            <p className="text-muted-custom mb-0 italic">No hay audios aún para este curso.</p>
                                        </div>
                                    ) : (
                                        audiosCurso.map(a => (
                                            <ListGroup.Item key={a.id} className="d-flex justify-content-between align-items-center px-3 list-item-custom">
                                                <div className="d-flex align-items-center">
                                                    <span className="text-muted-custom me-2" style={{fontSize: '0.7rem'}}>#{a.id}</span>
                                                    <span className="fw-medium">{a.titulo}</span>
                                                </div>
                                                <Button 
                                                    variant="link" 
                                                    size="sm" 
                                                    className="text-danger text-decoration-none p-0 fw-bold" 
                                                    onClick={() => eliminarAudio(a.id)}
                                                >
                                                    Eliminar
                                                </Button>
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
