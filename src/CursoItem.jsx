import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react"; 
import NavbarFC from "./components/NavbarFC";
import FooterFC from "./components/FooterFC";
import CodeInputFC from "./components/CodeInputFC"; 
import api from "./api/axios"; 
import { Spinner, Container, Row, Col, Card, Button } from "react-bootstrap";
import './CursoItem.css';

export function CursoItem() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [curso, setCurso] = useState(null);
    const [contenidos, setContenidos] = useState([]);
    const [courseToken, setCourseToken] = useState("");
    const [itemActivo, setItemActivo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tieneAcceso, setTieneAcceso] = useState(false);

    const WORKER_URL = "https://first-class-listening-worker.juliocesarcruzkubber.workers.dev"; 

    const cargarDetalle = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/contenido-access/curso/${id}`);
            
            setCurso({
                id: res.data.id,
                titulo: res.data.titulo,
                img: res.data.imagenUrl
            });
            setContenidos(res.data.contenidos || []); 
            setCourseToken(res.data.token);
            setTieneAcceso(true); 

        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                try {
                    const resPublico = await api.get(`/cursos/${id}`);
                    setCurso({
                        id: resPublico.data.id,
                        titulo: resPublico.data.titulo,
                        img: resPublico.data.imagenUrl
                    });
                    setTieneAcceso(false);
                } catch {
                    navigate("/Cursos");
                }
            } else {
                navigate("/Cursos");
            }
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        cargarDetalle();
    }, [cargarDetalle]);

    const handleDownload = async () => {
        if (!itemActivo) return;
        try {
            const res = await api.post(`/contenido-access/descargar/${itemActivo.id}`);
            window.location.href = res.data.url;

            const actualizarDescargas = (lista) => 
                lista.map(a => a.id === itemActivo.id ? { ...a, descargasHechas: (a.descargasHechas || 0) + 1 } : a);

            setContenidos(actualizarDescargas(contenidos));
            setItemActivo(actualizarDescargas([itemActivo])[0]);

        } catch (err) {
            alert(err.response?.data?.mensaje || "Límite de descargas alcanzado.");
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

    const btnActiveStyle = {
        backgroundColor: '#DEB831',
        color: '#2E1572',
        border: 'none',
        fontWeight: 'bold',
        transition: 'all 0.3s ease'
    };

    const btnInactiveStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        color: '#FFFFFF',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: 'all 0.3s ease'
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <Spinner animation="border" style={{ color: '#DEB831' }} />
        </div>
    );

    return (
        <>
            <NavbarFC />

            {curso && (
                <div className="course-audio-page pb-5 animate__animated animate__fadeIn" style={{ minHeight: '85vh' }}>
                    
                    {/* ENCABEZADO DEL CURSO */}
                    <div className="text-center py-5 mb-4" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}>
                        <Container>
                            <img 
                                src={curso.img} 
                                alt={curso.titulo} 
                                className="img-fluid shadow-lg rounded-3 mb-4" 
                                style={{ maxHeight: '250px', objectFit: 'cover', border: '3px solid #DEB831' }} 
                            />
                            <h1 className="fw-bold" style={{ color: '#DEB831', fontFamily: '"Baloo 2", sans-serif' }}>
                                {curso.titulo}
                            </h1>
                        </Container>
                    </div>

                    <Container>
                        {tieneAcceso ? (
                            <Row className="g-4">
                                {/* REPRODUCTOR PRINCIPAL */}
                                <Col xs={12} md={8}>
                                    {itemActivo ? (
                                        <Card className="p-4 h-100 shadow-lg" style={glassCardStyle}>
                                            <h4 className="mb-4 fw-bold" style={{ color: '#DEB831' }}>
                                                {itemActivo.tipo === 1 ? "🎥 " : "🎧 "} {itemActivo.titulo}
                                            </h4>
                                            
                                            <div className="media-wrapper rounded overflow-hidden mb-4 shadow-sm" style={{ backgroundColor: '#000' }}>
                                                {itemActivo.tipo === 1 ? (
                                                    <video
                                                        key={itemActivo.id}
                                                        controls
                                                        controlsList="nodownload"
                                                        crossOrigin="anonymous"
                                                        preload="metadata"
                                                        src={`${WORKER_URL}/?id=${itemActivo.id}&token=${encodeURIComponent(courseToken)}`}
                                                        className="w-100"
                                                        autoPlay
                                                        style={{ outline: 'none' }}
                                                    />
                                                ) : (
                                                    <audio
                                                        key={itemActivo.id}
                                                        controls
                                                        src={`${WORKER_URL}/?id=${itemActivo.id}&token=${encodeURIComponent(courseToken)}`}
                                                        className="w-100"
                                                        autoPlay
                                                        style={{ outline: 'none' }}
                                                    />
                                                )}
                                            </div>

                                            <div className="mt-auto pt-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
                                                <Button 
                                                    className="w-100 py-2 shadow-sm" 
                                                    style={btnActiveStyle}
                                                    onClick={handleDownload}
                                                    disabled={(itemActivo.descargasHechas || 0) >= 3}
                                                >
                                                    {(itemActivo.descargasHechas || 0) >= 3 
                                                        ? "🚫 Límite de descargas alcanzado" 
                                                        : `⬇️ Descargar ${itemActivo.tipo === 1 ? 'Video' : 'Audio'}`}
                                                </Button>
                                                <small className="d-block text-center mt-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                                    Descargas restantes: <strong>{Math.max(0, 3 - (itemActivo.descargasHechas || 0))}</strong>
                                                </small>
                                            </div>
                                        </Card>
                                    ) : (
                                        <Card className="p-5 text-center h-100 d-flex align-items-center justify-content-center shadow-lg" style={glassCardStyle}>
                                            <div className="opacity-75">
                                                <h1 className="display-4 mb-3" style={{ color: '#DEB831' }}>🎬</h1>
                                                <h4 style={{ color: 'rgba(255,255,255,0.9)' }}>Selecciona una lección para comenzar</h4>
                                                <p style={{ color: 'rgba(255,255,255,0.6)' }}>El contenido aparecerá aquí.</p>
                                            </div>
                                        </Card>
                                    )}
                                </Col>

                                {/* LISTA DE CONTENIDO */}
                                <Col xs={12} md={4}>
                                    <Card className="p-4 h-100 shadow-lg" style={glassCardStyle}>
                                        <h5 className="mb-4 fw-bold border-bottom pb-2" style={{ color: '#DEB831', borderColor: 'rgba(222,184,49,0.3) !important' }}>
                                            Contenido del curso
                                        </h5>
                                        <div className="d-flex flex-column gap-2" style={{ overflowY: 'auto', maxHeight: '500px', paddingRight: '5px' }}>
                                            {contenidos.map((item) => (
                                                <Button
                                                    key={item.id}
                                                    className="d-flex justify-content-between align-items-center text-start px-3 py-3 shadow-sm"
                                                    style={itemActivo?.id === item.id ? btnActiveStyle : btnInactiveStyle}
                                                    onClick={() => setItemActivo(item)}
                                                >
                                                    <span className="text-truncate fw-medium" style={{ maxWidth: '85%' }}>
                                                        {item.titulo}
                                                    </span>
                                                    <span style={{ opacity: itemActivo?.id === item.id ? 1 : 0.7 }}>
                                                        {item.tipo === 1 ? "🎥" : "🎧"}
                                                    </span>
                                                </Button>
                                            ))}
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        ) : (
                            // ESTADO: SIN ACCESO
                            <Row className="justify-content-center mt-4">
                                <Col md={10} lg={8}>
                                    <Card className="p-4 p-md-5 text-center shadow-lg border-0" style={glassCardStyle}>
                                        <div className="mb-2">
                                            <h1 style={{ fontSize: '4rem' }}>🔒</h1>
                                            <h3 className="fw-bold mt-3" style={{ color: '#DEB831' }}>Acceso Restringido</h3>
                                            <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                                                Para ver y descargar el contenido de este curso, necesitas validarlo con un código de acceso.
                                            </p>
                                        </div>
                                        
                                        {/* ¡Adiós bg-light! Ahora se integra limpio con el fondo de cristal */}
                                        <div className="mt-2">
                                            <CodeInputFC onSuccess={cargarDetalle} />
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        )}
                    </Container>
                </div>
            )}
            <FooterFC />
        </>
    );
}

export default CursoItem;