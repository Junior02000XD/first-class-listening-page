import { useEffect, useState, useContext } from "react";
import { Col, Container, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

// Tu URL de R2 Público
const R2_PUBLIC_URL = "https://pub-c366ad600966461483237465e4989b76.r2.dev";

export function CursosDisponiblesFC({ soloMios = false }) {
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCursos = async () => {
            try {
                const response = await api.get("/cursos");
                let data = response.data;

                // Lógica de filtro "Mis Cursos"
                if (soloMios && isAuthenticated && user?.misCursos) {
                    const idsMios = user.misCursos.map(c => c.id);
                    data = data.filter(curso => idsMios.includes(curso.id));
                }

                setCursos(data);
            } catch (error) {
                console.error("Error cargando cursos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCursos();
    }, [soloMios, isAuthenticated, user]);

    if (loading) return <div className="text-center my-5"><Spinner animation="border" /></div>;

    return (
        <Container className="my-5">
            <Row ms={1} md={2} lg={3} className="justify-content-center">
                {cursos.map((curso) => {
                    // Verificamos si el usuario ya es dueño del curso
                    const yaLoTengo = user?.misCursos?.some(mio => mio.id === curso.id);

                    return (
                        <Col key={curso.id} xs={12} className="mb-4 text-center">
                            <img
                                src={curso.imagenUrl.startsWith('http') ? curso.imagenUrl : `${R2_PUBLIC_URL}/${curso.imagenUrl}`}
                                alt={curso.titulo}
                                className="img-fluid rounded mb-2"
                            />
                            <h5 className="text-center course-title">{curso.titulo}</h5>
                            <div className="separator-small"></div>
                            
                            <button 
                                className={`btn ${yaLoTengo ? "btn-success" : "btn-outline-secondary"} mt-2`}
                                onClick={() => navigate(`/Cursos/${curso.id}`)}
                            >
                                {yaLoTengo ? "Entrar al Curso" : "Saber Más"}
                            </button>
                        </Col>
                    );
                })}
            </Row>
            {soloMios && cursos.length === 0 && (
                <p className="text-center text-muted">Aún no has activado ningún curso con tu código.</p>
            )}
        </Container>
    );
}
