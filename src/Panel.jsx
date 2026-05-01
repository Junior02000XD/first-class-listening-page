import './Panel.css'; // ¡Aquí pondremos la magia visual de las pestañas!
import { useContext } from "react";
import { Container, Tabs, Tab } from "react-bootstrap";
import { AuthContext } from "./context/AuthContext.jsx";
import { AdminPanelFC } from "./components/AdminPanelFC.jsx";
import { RootPanelFC } from "./components/RootPanelFC.jsx";
import NavbarFC from "./components/NavbarFC.jsx";
import FooterFC from "./components/FooterFC.jsx";

export function Panel() {
    const { user } = useContext(AuthContext);

    return (
        <>
            <NavbarFC />
            <Container className="my-5 animate__animated animate__fadeIn" style={{ minHeight: "85vh" }}>
                
                {/* Encabezado del Panel */}
                <div className="text-center mb-5">
                    <h2 className="fw-bold mb-2" style={{ color: '#DEB831', fontFamily: '"Baloo 2", sans-serif', fontSize: '2.5rem' }}>
                        Panel de Gestión
                    </h2>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Administración central de la plataforma First Class Institute
                    </p>
                </div>

                {/* Contenedor de las pestañas */}
                <div className="custom-tabs-wrapper">
                    <Tabs 
                        defaultActiveKey="admin" 
                        id="panel-tabs" 
                        className="mb-4 custom-tabs border-0"
                        justify // Esto hace que las pestañas se distribuyan equitativamente en todo el ancho
                    >
                        {/* El Admin siempre ve la gestión de cursos */}
                        <Tab eventKey="admin" title="📚 Gestión de Cursos">
                            <div className="animate__animated animate__fadeIn">
                                <AdminPanelFC />
                            </div>
                        </Tab>

                        {/* Solo el Root ve la pestaña de códigos */}
                        {user?.rol === 2 && (
                            <Tab eventKey="root" title="⚡ Generador de Códigos">
                                <div className="animate__animated animate__fadeIn">
                                    <RootPanelFC />
                                </div>
                            </Tab>
                        )}
                    </Tabs>
                </div>

            </Container>
            <FooterFC />
        </>
    );
}

export default Panel;