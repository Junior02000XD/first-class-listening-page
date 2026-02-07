import './Panel.css';
import { useContext } from "react";
import { Container, Tabs, Tab } from "react-bootstrap";
import { AuthContext } from "./context/AuthContext";
import { AdminPanelFC } from "./components/AdminPanelFC";
import { RootPanelFC } from "./components/RootPanelFC";
import NavbarFC from "./components/NavbarFC";
import FooterFC from "./components/FooterFC";

export function Panel() {
    const { user } = useContext(AuthContext);

    return (
        <>
            <NavbarFC />
            <Container className="my-5" style={{ minHeight: "70vh" }}>
                <h2 className="fw-bold mb-4">Panel de Gestión</h2>
                <Tabs defaultActiveKey="admin" id="panel-tabs" className="mb-4">
                    {/* El Admin siempre ve la gestión de cursos */}
                    <Tab eventKey="admin" title="Gestión de Cursos (Admin)">
                        <AdminPanelFC />
                    </Tab>

                    {/* Solo el Root ve la pestaña de códigos */}
                    {user?.rol === 2 && (
                        <Tab eventKey="root" title="Generador de Códigos (Root)">
                            <RootPanelFC />
                        </Tab>
                    )}
                </Tabs>
            </Container>
            <FooterFC />
        </>
    );
}
