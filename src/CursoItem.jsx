import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import NavbarFC from "./components/NavbarFC";
import FooterFC from "./components/FooterFC";
import api from "./api/axios"; 
import { Spinner } from "react-bootstrap";
import './CursoItem.css';

export function CursoItem() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [curso, setCurso] = useState(null);
    const [audios, setAudios] = useState([]);
    const [courseToken, setCourseToken] = useState("");
    const [audioActivo, setAudioActivo] = useState(null);
    const [downloadsLeft, setDownloadsLeft] = useState(0); // Ahora viene de la API
    const [loading, setLoading] = useState(true);

    const WORKER_URL = "https://first-class-listening-worker.juliocesarcruzkubber.workers.dev"; 

    useEffect(() => {
        const cargarDetalle = async () => {
            try {
                // Endpoint operativo de acceso
                const res = await api.get(`/audio-access/curso/${id}`);
                
                setCurso({
                    id: res.data.id,
                    titulo: res.data.titulo,
                    img: res.data.imagenUrl // Mantenemos el nombre 'img' de tu diseño
                });
                setAudios(res.data.audios || []);
                setCourseToken(res.data.token);
                // Si la API devuelve descargas globales del curso, las seteamos aquí
                setDownloadsLeft(res.data.descargasRestantes ?? 3); 

            } catch (err) {
                console.error("Error cargando curso:", err);
                if (err.response?.status === 403) {
                    alert("Acceso denegado: Debes activar este curso primero.");
                }
                navigate("/Cursos");
            } finally {
                setLoading(false);
            }
        };
        cargarDetalle();
    }, [id, navigate]);

    const handleDownload = async () => {
        if (!audioActivo) return;
        
        try {
            // Lógica real de descarga contra la API de Railway
            const res = await api.get(`/audio-access/download/${audioActivo.id}`);
            const downloadUrl = res.data.downloadUrl;

            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = ""; 
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Actualizamos el contador local
            setDownloadsLeft(prev => prev - 1);
        } catch (err) {
            alert(err.response?.data?.mensaje || "Error al procesar la descarga");
        }
    };

    if (loading) return <div className="text-center my-5"><Spinner animation="border" /></div>;

    return (
        <>
            <NavbarFC />

            {!curso ? (
                navigate("/Cursos")
            ) : (
                <div className="course-audio-page">
                    {/* Header - Diseño Original */}
                    <div className="text-center mb-5 course-header-custom">
                        <img
                            src={curso.img}
                            alt={curso.titulo}
                            className="img-fluid course-cover-custom"
                        />
                        <h2 className="mt-3 course-title-custom">{curso.titulo}</h2>
                    </div>

                    {/* Contenido principal - Diseño Original */}
                    <div className="container">
                        <div className="row g-4">
                            {/* Reproductor */}
                            <div className="col-12 col-md-8">
                                {audioActivo ? (
                                    <div className="card p-3 audio-player-box h-100">
                                        <h6 className="mb-2 audio-title">{audioActivo.titulo}</h6>

                                        <audio
                                            key={audioActivo.id}
                                            controls
                                            src={`${WORKER_URL}/?id=${audioActivo.id}&token=${courseToken}`}
                                            className="audio-player"
                                            autoPlay
                                        />

                                        <button
                                            className="btn btn-sm mt-3 audio-download-btn"
                                            onClick={handleDownload}
                                        >
                                            Descargar audio
                                        </button>
                                        <small className="counter-downloads">
                                            Descargas restantes: {downloadsLeft}
                                        </small>
                                    </div>
                                ) : (
                                    <div className="card p-4 text-center audio-player-box h-100">
                                        <p className="mb-0 text-audio-alert">
                                            Selecciona un audio para comenzar 🎧
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Lista de audios - Diseño Original */}
                            <div className="col-12 col-md-4">
                                <div className="card p-3 audio-list h-100">
                                    <h5 className="mb-3 audio-item">Audios del curso</h5>

                                    <div className="d-flex flex-column gap-2 audio-buttons">
                                        {audios.map((audio) => (
                                            <button
                                                key={audio.id}
                                                className={`btn btn-sm text-start me-3 btn-custom ${
                                                    audioActivo?.id === audio.id
                                                        ? "btn-primary"
                                                        : "btn-outline-secondary"
                                                }`}
                                                onClick={() => setAudioActivo(audio)}
                                            >
                                                {audio.titulo}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <FooterFC />
        </>
    );
}

export default CursoItem;
