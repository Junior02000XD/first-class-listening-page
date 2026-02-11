import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react"; 
import NavbarFC from "./components/NavbarFC";
import FooterFC from "./components/FooterFC";
import CodeInputFC from "./components/CodeInputFC"; 
import api from "./api/axios"; 
import { Spinner } from "react-bootstrap";
import './CursoItem.css';

export function CursoItem() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [curso, setCurso] = useState(null);
    const [contenidos, setContenidos] = useState([]); // Antes 'audios'
    const [courseToken, setCourseToken] = useState("");
    const [itemActivo, setItemActivo] = useState(null); // Antes 'audioActivo'
    const [loading, setLoading] = useState(true);
    const [tieneAcceso, setTieneAcceso] = useState(false);

    const WORKER_URL = "https://first-class-listening-worker.juliocesarcruzkubber.workers.dev"; 

    const cargarDetalle = useCallback(async () => {
        setLoading(true);
        try {
            // Actualizado a la nueva ruta genérica de contenido
            const res = await api.get(`/contenido-access/curso/${id}`);
            
            setCurso({
                id: res.data.id,
                titulo: res.data.titulo,
                img: res.data.imagenUrl
            });
            setContenidos(res.data.contenidos || []); // Usamos la nueva propiedad 'contenidos'
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
            // Actualizado a la ruta genérica de descarga
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

    if (loading) return <div className="text-center my-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <>
            <NavbarFC />

            {curso && (
                <div className="course-audio-page">
                    <div className="text-center mb-5 course-header-custom">
                        <img src={curso.img} alt={curso.titulo} className="img-fluid course-cover-custom" />
                        <h2 className="mt-3 course-title-custom">{curso.titulo}</h2>
                    </div>

                    <div className="container">
                        {tieneAcceso ? (
                            <div className="row g-4">
                                <div className="col-12 col-md-8">
                                    {itemActivo ? (
                                        <div className="card p-3 audio-player-box h-100 shadow-sm">
                                            <h6 className="mb-3 audio-title fw-bold">
                                                {itemActivo.tipo === 1 ? "🎥 " : "🎧 "} {itemActivo.titulo}
                                            </h6>
                                            
                                            {/* REPRODUCTOR HÍBRIDO */}
                                            <div className="media-wrapper bg-black rounded overflow-hidden mb-3">
                                                {itemActivo.tipo === 1 ? (
                                                    <video
                                                        key={itemActivo.id}
                                                        controls
                                                        controlsList="nodownload"
                                                        // El preload="metadata" ayuda a que el streaming de 1GB sea fluido
                                                        preload="metadata"
                                                        src={`${WORKER_URL}/?id=${itemActivo.id}&token=${encodeURIComponent(courseToken)}`}
                                                        className="w-100"
                                                        autoPlay
                                                    />
                                                ) : (
                                                    <audio
                                                        key={itemActivo.id}
                                                        controls
                                                        src={`${WORKER_URL}/?id=${itemActivo.id}&token=${encodeURIComponent(courseToken)}`}
                                                        className="w-100 mt-2"
                                                        autoPlay
                                                    />
                                                )}
                                            </div>

                                            <button 
                                                className="btn btn-sm audio-download-btn fw-bold w-100" 
                                                onClick={handleDownload}
                                                disabled={(itemActivo.descargasHechas || 0) >= 3}
                                            >
                                                {(itemActivo.descargasHechas || 0) >= 3 ? "Límite alcanzado" : `Descargar ${itemActivo.tipo === 1 ? 'Video' : 'Audio'}`}
                                            </button>
                                            <small className="counter-downloads mt-2 d-block text-center">
                                                Descargas restantes: {Math.max(0, 3 - (itemActivo.descargasHechas || 0))}
                                            </small>
                                        </div>
                                    ) : (
                                        <div className="card p-4 text-center audio-player-box h-100 d-flex align-items-center justify-content-center">
                                            <p className="mb-0 text-audio-alert">Selecciona una lección para comenzar 🎧🎥</p>
                                        </div>
                                    )}
                                </div>

                                <div className="col-12 col-md-4">
                                    <div className="card p-3 audio-list h-100 shadow-sm">
                                        <h5 className="mb-3 audio-item fw-bold">Contenido del curso</h5>
                                        <div className="d-flex flex-column gap-2 audio-buttons">
                                            {contenidos.map((item) => (
                                                <button
                                                    key={item.id}
                                                    className={`btn btn-sm text-start btn-custom d-flex justify-content-between align-items-center ${itemActivo?.id === item.id ? "btn-primary text-white" : "btn-outline-secondary"}`}
                                                    onClick={() => setItemActivo(item)}
                                                >
                                                    <span className="text-truncate" style={{maxWidth: '85%'}}>{item.titulo}</span>
                                                    <span>{item.tipo === 1 ? "🎥" : "🎧"}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <div className="alert alert-warning mb-4 shadow-sm">
                                    No tienes acceso al contenido de este curso. Ingresa tu código para activarlo.
                                </div>
                                <CodeInputFC onSuccess={cargarDetalle} />
                            </div>
                        )}
                    </div>
                </div>
            )}
            <FooterFC />
        </>
    );
}

export default CursoItem;
