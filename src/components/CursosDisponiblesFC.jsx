import { Col, Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export function CursosDisponiblesFC() {
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
    const Navigate = useNavigate();
    
  return (
    <Container className="my-5">
        <Row ms={1} md={2} lg={3} className="justify-content-center">
            {cursos.map((curso) => (
                <Col key={curso.id} xs={12} className="mb-4 text-center">
                    <img
                        src={curso.img}
                        alt={curso.titulo}
                        className="img-fluid rounded mb-2"
                    />
                    <h5 className="text-center course-title">{curso.titulo}</h5>
                    <div className="separator-small"></div>
                    <button className="btn btn-outline-secondary mt-2" 
                        onClick={() => Navigate(`/Cursos/${curso.id}`)}>
                        Saber Más
                    </button>
                </Col>
            ))}
        </Row>
    </Container>
    );
}