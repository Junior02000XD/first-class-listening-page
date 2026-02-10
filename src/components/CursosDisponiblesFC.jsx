import { useEffect, useState, useContext } from "react";
import { Col, Container, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

// ACTUALIZADO: URL de tu nuevo bucket 'first-class-content'
const R2_PUBLIC_URL = "https://pub-c366ad600966461483237465e4989b76.r2.dev";

export function CursosDisponiblesFC({ soloMios = false }) {
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useContext(AuthContext); 
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDatos = async () => {
            try {
                // 1. Cargamos el catálogo completo (Endpoint Público)
                const resCatalogo = await api.get("/cursos");
                let catalogoTotal = resCatalogo.data;

                let idsMisCursos = [];

                // 2. Si está logueado, consultamos sus accesos a CONTENIDOS (Ruta actualizada)
                if (isAuthenticated) {
                    try {
                        const resMios = await api.get("/contenido-access/mis-cursos");
                        // Guardamos solo los IDs para hacer el "match" fácilmente
                        idsMisCursos = resMios.data.map(c => c.id || c.Id);
                    } catch (errMios) {
                        console.error("Error obteniendo cursos del usuario:", errMios);
                    }
                }

                // 3. Inyectamos la propiedad 'yaLoTengo' en cada curso del catálogo
                const dataProcesada = catalogoTotal.map(curso => {
                    const cursoId = curso.id || curso.Id; 
                    return {
                        ...curso,
                        id: cursoId, 
                        yaLoTengo: idsMisCursos.includes(cursoId)
                    };
                });

                // 4. Si la prop es 'soloMios', filtramos el resultado final
                if (soloMios) {
                    setCursos(dataProcesada.filter(c => c.yaLoTengo));
                } else {
                    setCursos(dataProcesada);
                }

            } catch (error) {
                console.error("Error cargando cursos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDatos();
    }, [soloMios, isAuthenticated]);

    if (loading) return <div className="text-center my-5"><Spinner animation="border" /></div>;

    return (
        <Container className="my-5">
            <Row ms={1} md={2} lg={3} className="justify-content-center">
                {cursos.map((curso) => {
                    return (
                        <Col key={curso.id} xs={12} className="mb-4 text-center">
                            <img
                                key={`img-${curso.id}`} 
                                src={curso.imagenUrl.startsWith('http') ? curso.imagenUrl : `${R2_PUBLIC_URL}/${curso.imagenUrl}`}
                                alt={curso.titulo}
                                className="img-fluid rounded mb-2"
                                crossOrigin="anonymous"
                                loading="lazy" 
                            />

                            <h5 className="text-center course-title">{curso.titulo}</h5>
                            <div className="separator-small"></div>
                            
                            <button 
                                className={`btn ${curso.yaLoTengo ? "btn-success" : "btn-outline-secondary"} mt-2`}
                                onClick={() => navigate(`/Cursos/${curso.id}`)}
                            >
                                {curso.yaLoTengo ? "Entrar" : "Desbloquear"}
                            </button>
                        </Col>
                    );
                })}
            </Row>
            {soloMios && cursos.length === 0 && (
                <p className="text-center">Aún no has activado ningún Track de Audios con tu código.</p>
            )}
        </Container>
    );
}
