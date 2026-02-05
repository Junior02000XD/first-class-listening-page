import { Container, Row, Col } from "react-bootstrap";

export function PresentacionFC({scrollIntoView}) {
  return (
    <Container className="my-5">
      <h4 className="text-center" id="phrase">Libros hechos con la pasión que nos caracteriza y destaca</h4>

      <Row className="justify-content-center align-items-center mt-4">
        {/* Columna izquierda */}
        <Col xs={12} lg={4} className="mb-4 mb-lg-0">
          <h1 id="title">First Class Listening</h1>

          <div className="d-flex gap-2 mt-2">
            <img
              src="https://img.icons8.com/?size=100&id=FCLWo59gBVtY&format=png&color=FAB005"
              alt="Check"
              style={{ width: "20px", height: "20px" }}
            />
            <h6 className="mb-0" id="subtitle">
              Escuche sin limites.
            </h6>
          </div>
        </Col>

        {/* Columna derecha */}
        <Col xs={12} lg={8} className="justify-content-center">
            <p id="description">
                En First Class, nuestra misión es ofrecerte libros de alta calidad
                que no solo eduquen, sino que también inspiren y motiven. Cada página
                está diseñada para brindarte una experiencia de aprendizaje única,
                combinando contenido relevante con un diseño atractivo. Creemos que
                aprender debe ser una aventura emocionante, y nuestros libros
                reflejan esa pasión.
            </p>
            <Row>
                <Col>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <button
                            className="btn btn-primary text-nowrap"
                            onClick={scrollIntoView}
                        >
                            Registrar Código
                        </button>

                        <button className="btn btn-outline-secondary text-nowrap">
                            Ver Audios Disponibles
                        </button>
                    </div>
                </Col>
            </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default PresentacionFC;
