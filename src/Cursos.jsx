import { CursosDisponiblesFC } from './components/CursosDisponiblesFC.jsx';
import FooterFC from './components/FooterFC.jsx';
import { NavbarFC } from './components/NavbarFC.jsx';
import { Container } from 'react-bootstrap';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext.jsx';
import './Cursos.css';

export const Cursos = () => {
    const { isAuthenticated } = useContext(AuthContext);

    return (
        <div>
            <NavbarFC />
            <Container>
                <div className="separator-small-left mt-4"></div>
                
                {isAuthenticated && (
                    <>
                        <h1 className="mt-2">Mis Cursos</h1>
                        {/* ACTIVAMOS EL FILTRO AQUÍ */}
                        <CursosDisponiblesFC soloMios={true} />
                        <hr />
                    </>
                )}

                <h1 className="mt-4">Catálogo Completo</h1>
                {/* SIN FILTRO: Muestra todos */}
                <CursosDisponiblesFC soloMios={false} />
            </Container>
            <FooterFC />
        </div>
    );
};


export default Cursos;