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
    const [audios, setAudios] = useState([]);
    const [courseToken, setCourseToken] = useState("");
    const [audioActivo, setAudioActivo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tieneAcceso, setTieneAcceso] = useState(false);

    const WORKER_URL = "https://first-class-listening-worker.juliocesarcruzkubber.workers.dev"; 

    // Función para cargar datos (se reutiliza al canjear código)
    const cargarDetalle = useCallback(async () => {
        setLoading(true);
        try {
            // Intentamos acceso privado
            const res = await api.get(`/audio-access/curso/${id}`);
            
            setCurso({
                id: res.data.id,
                titulo: res.data.titulo,
                img: res.data.imagenUrl
            });
            setAudios(res.data.audios || []);
            setCourseToken(res.data.token);
            setTieneAcceso(true); 

        } catch (err) {
            // Si no hay acceso, intentamos cargar solo la info pública
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
        if (!audioActivo) return;
        try {
            // 1. Petición POST para registrar y obtener URL firmada
            const res = await api.post(`/audio-access/audio/${audioActivo.id}/descargar`);
            const downloadUrl = res.data.url;

            // 2. Disparamos la descarga
            window.location.href = downloadUrl;

            // 3. Actualizamos el estado local de los audios para reflejar la descarga hecha
            const actualizarDescargas = (lista) => 
                lista.map(a => a.id === audioActivo.id ? { ...a, descargasHechas: (a.descargasHechas || 0) + 1 } : a);

            const nuevaLista = actualizarDescargas(audios);
            setAudios(nuevaLista);
            
            // 4. Actualizamos el audio activo para que el contador en pantalla cambie
            setAudioActivo(actualizarDescargas([audioActivo])[0]);

        } catch (err) {
            alert(err.response?.data?.mensaje || "Límite de descargas alcanzado.");
        }
    };

    if (loading) return <div className="text-center my-5"><Spinner animation="border" variant="primary" /></div>;

    return (
        <>
            <NavbarFC />

            {!curso ? null : (
                <div className="course-audio-page">
                    <div className="text-center mb-5 course-header-custom">
                        <img
                            src={curso.img}
                            alt={curso.titulo}
                            className="img-fluid course-cover-custom"
                        />
                        <h2 className="mt-3 course-title-custom">{curso.titulo}</h2>
                    </div>

                    <div className="container">
                        {tieneAcceso ? (
                            <div className="row g-4">
                                <div className="col-12 col-md-8">
                                    {audioActivo ? (
                                        <div className="card p-3 audio-player-box h-100 shadow-sm">
                                            <h6 className="mb-2 audio-title fw-bold">{audioActivo.titulo}</h6>
                                            <audio
                                                key={audioActivo.id}
                                                controls
                                                src={`${WORKER_URL}/?id=${audioActivo.id}&token=${courseToken}`}
                                                className="audio-player w-100"
                                                autoPlay
                                            />
                                            <button 
                                                className="btn btn-sm mt-3 audio-download-btn fw-bold" 
                                                onClick={handleDownload}
                                                // Si las descargas hechas son 3 o más, se deshabilita
                                                disabled={ (audioActivo.descargasHechas || 0) >= 3 }
                                            >
                                                {(audioActivo.descargasHechas || 0) >= 3 ? "Límite alcanzado" : "Descargar audio"}
                                            </button>
                                            <small className="counter-downloads mt-2 d-block">
                                                Descargas restantes: {Math.max(0, 3 - (audioActivo.descargasHechas || 0))}
                                            </small>
                                        </div>
                                    ) : (
                                        <div className="card p-4 text-center audio-player-box h-100">
                                            <p className="mb-0 text-audio-alert">Selecciona un audio para comenzar 🎧</p>
                                        </div>
                                    )}
                                </div>

                                <div className="col-12 col-md-4">
                                    <div className="card p-3 audio-list h-100 shadow-sm">
                                        <h5 className="mb-3 audio-item fw-bold">Audios del curso</h5>
                                        <div className="d-flex flex-column gap-2 audio-buttons">
                                            {audios.map((audio) => (
                                                <button
                                                    key={audio.id}
                                                    className={`btn btn-sm text-start btn-custom ${audioActivo?.id === audio.id ? "btn-primary" : "btn-outline-secondary"}`}
                                                    onClick={() => setAudioActivo(audio)}
                                                >
                                                    {audio.titulo}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <div className="alert alert-warning mb-4 shadow-sm">
                                    No tienes acceso a los audios de este curso. Ingresa tu código para activarlo.
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
