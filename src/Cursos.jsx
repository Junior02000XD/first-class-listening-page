import { CursosDisponiblesFC } from './components/CursosDisponiblesFC.jsx';
import FooterFC from './components/FooterFC.jsx';
import { NavbarFC } from './components/NavbarFC.jsx';
import './Cursos.css';

export const Cursos = () => {
    return (
        <div>
            <NavbarFC />
            <div className="separator-small-left"></div>
            <h1>Cursos</h1>
            <CursosDisponiblesFC/>
            <FooterFC />
        </div>
    );
};

export default Cursos;