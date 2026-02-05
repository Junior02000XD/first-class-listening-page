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
    const [downloadsLeft, setDownloadsLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [tieneAcceso, setTieneAcceso] = useState(false);

    const WORKER_URL = "https://first-class-listening-worker.juliocesarcruzkubber.workers.dev"; 

    // 1. Envolvemos la carga en useCallback para poder re-ejecutarla tras un canje exitoso
    const cargarDetalle = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/audio-access/curso/${id}`);
            
            setCurso({
                id: res.data.id,
                titulo: res.data.titulo,
                img: res.data.imagenUrl
            });
            setAudios(res.data.audios || []);
            setCourseToken(res.data.token);
            setDownloadsLeft(res.data.descargasRestantes ?? 3);
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
        if (!audioActivo) return;
        
        try {
            // 1. CAMBIO: Usar api.post y la ruta exacta de tu controlador
            // 2. Ruta corregida: /audio-access/audio/{id}/descargar
            const res = await api.post(`/audio-access/audio/${audioActivo.id}/descargar`);
            
            // 3. CAMBIO: Tu API devuelve { url: "..." } según tu código de C#
            const downloadUrl = res.data.url;

            if (!downloadUrl) throw new Error("No se recibió la URL de descarga");

            // Crear el link temporal para disparar la descarga
            const link = document.createElement("a");
            link.href = downloadUrl;
            
            // Sugerir nombre de archivo (opcional)
            link.setAttribute("download", `${audioActivo.titulo}.mp3`);
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // 4. Actualizamos el contador localmente
            setDownloadsLeft(prev => Math.max(0, prev - 1));

        } catch (err) {
            // Si el error es 403, es que llegó al límite de 3 descargas
            const mensaje = err.response?.data?.mensaje || "Error al procesar la descarga";
            alert(mensaje);
        }
    };

    if (loading) return <div className="text-center my-5"><Spinner animation="border" /></div>;

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
                                        <div className="card p-3 audio-player-box h-100">
                                            <h6 className="mb-2 audio-title">{audioActivo.titulo}</h6>
                                            <audio
                                                key={audioActivo.id}
                                                controls
                                                src={`${WORKER_URL}/?id=${audioActivo.id}&token=${courseToken}`}
                                                className="audio-player"
                                                autoPlay
                                            />
                                            <button className="btn btn-sm mt-3 audio-download-btn" onClick={handleDownload}>
                                                Descargar audio
                                            </button>
                                            <small className="counter-downloads">
                                                Descargas restantes: {downloadsLeft}
                                            </small>
                                        </div>
                                    ) : (
                                        <div className="card p-4 text-center audio-player-box h-100">
                                            <p className="mb-0 text-audio-alert">Selecciona un audio para comenzar 🎧</p>
                                        </div>
                                    )}
                                </div>

                                <div className="col-12 col-md-4">
                                    <div className="card p-3 audio-list h-100">
                                        <h5 className="mb-3 audio-item">Audios del curso</h5>
                                        <div className="d-flex flex-column gap-2 audio-buttons">
                                            {audios.map((audio) => (
                                                <button
                                                    key={audio.id}
                                                    className={`btn btn-sm text-start me-3 btn-custom ${audioActivo?.id === audio.id ? "btn-primary" : "btn-outline-secondary"}`}
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
                                <div className="alert alert-warning mb-4">No tienes acceso a los audios de este curso.</div>
                                {/* 2. Pasamos la función de recarga como Prop para que al canjear se desbloquee todo */}
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
