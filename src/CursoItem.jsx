import { Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import NavbarFC from "./components/NavbarFC";
import FooterFC from "./components/FooterFC";
import { useState } from "react";
import './CursoItem.css';

export function CursoItem(){
    const cursos = [
        { id: 1, titulo: "First Class 1", img: "/CursosImages/EnglishFirst_1.jpeg"},
        { id: 2, titulo: "First Class 2", img: "/CursosImages/EnglishFirst_2.jpeg"},
        { id: 3, titulo: "First Class 3", img: "/CursosImages/EnglishFirst_3.jpeg"},
        { id: 4, titulo: "First Class 4", img: "/CursosImages/EnglishFirst_4.jpeg"},
        { id: 5, titulo: "First Class 5", img: "/CursosImages/EnglishFirst_5.jpeg"},
        { id: 6, titulo: "First Class 6", img: "/CursosImages/EnglishFirst_6.jpeg"},
        { id: 7, titulo: "First Class 7", img: "/CursosImages/EnglishFirst_7.jpeg"},
        { id: 8, titulo: "First Class Kids 1", img: "/CursosImages/EnglishFirstKids_1.jpeg"},
        { id: 9, titulo: "First Class Kids 2", img: "/CursosImages/EnglishFirstKids_2.jpeg"},
        { id: 10, titulo: "First Class Kids 3", img: "/CursosImages/EnglishFirstKids_3.jpeg"},
        { id: 11, titulo: "First Class Kids 4", img: "/CursosImages/EnglishFirstKids_4.jpeg"},
        { id: 12, titulo: "First Class Kids 5", img: "/CursosImages/EnglishFirstKids_5.jpeg"},
        { id: 13, titulo: "First Class Kids 6", img: "/CursosImages/EnglishFirstKids_6.jpeg"},
        { id: 14, titulo: "First Class Kids 7", img: "/CursosImages/EnglishFirstKids_7.jpeg"},
    ];

    const audios = [
        { id: 1, titulo: "Audio 1", archivo: "/audios/01_Pista_1.mp3"},
        { id: 2, titulo: "Audio 2", archivo: "/audios/02_Pista_2.mp3"},
        { id: 3, titulo: "Audio 3", archivo: "/audios/03_Pista_3.mp3"},
        { id: 4, titulo: "Audio 4", archivo: "/audios/04_Pista_4.mp3"},
        { id: 5, titulo: "Audio 5", archivo: "/audios/05_Pista_5.mp3"},
        { id: 6, titulo: "Audio 6", archivo: "/audios/06_Pista_6.mp3"},
        { id: 7, titulo: "Audio 7", archivo: "/audios/07_Pista_7.mp3"},
        { id: 8, titulo: "Audio 8", archivo: "/audios/08_Pista_8.mp3"},
        { id: 9, titulo: "Audio 9", archivo: "/audios/09_Pista_9.mp3"},
        { id: 10, titulo: "Audio 10", archivo: "/audios/10_Pista_10.mp3"},
    ];

    const [audioActivo, setAudioActivo] = useState(null);
    const [downloadsLeft, setDownloadsLeft] = useState(3);
    const { id } = useParams();
    const curso = cursos.find((curso) => curso.id === parseInt(id))
    const navigate = useNavigate();

    const handleDownload = () => {
        if (downloadsLeft <= 0) {
            alert("Has alcanzado el límite de descargas");
            return;
        }

        const link = document.createElement("a");
        link.href = audioActivo.archivo;
        link.download = audioActivo.archivo.split("/").pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setDownloadsLeft(prev => prev - 1);
    }

    return (
        <>
            <NavbarFC />

            {!curso ? (
            navigate("/Cursos")
            ) : (
            <div className="course-audio-page">
                {/* Header */}
                <div className="text-center mb-5 course-header-custom">
                <img
                    src={curso.img}
                    alt={curso.titulo}
                    className="img-fluid course-cover-custom"
                />
                <h2 className="mt-3 course-title-custom">{curso.titulo}</h2>
                </div>

                {/* Contenido principal */}
                <div className="container">
                <div className="row g-4">
                    {/* Reproductor */}
                    <div className="col-12 col-md-8">
                    {audioActivo ? (
                        <div className="card p-3 audio-player-box h-100">
                        <h6 className="mb-2 audio-title">{audioActivo.titulo}</h6>

                        <audio
                            controls
                            src={audioActivo.archivo}
                            className="audio-player"
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

                    {/* Lista de audios */}
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