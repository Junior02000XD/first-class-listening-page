import './App.css'
import { NavbarFC } from './components/NavbarFC.jsx';
import { CarouselContainerFC } from './components/CarouselContainerFC.jsx';
import { PresentacionFC } from './components/PresentacionFC.jsx';
import { CodeInputFC } from './components/CodeInputFC.jsx';
import { CursosDisponiblesFC } from './components/CursosDisponiblesFC.jsx';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import FooterFC from './components/FooterFC.jsx';

export function App() {
  const codeSectionRef = useRef(null);
  const location = useLocation();

  // Lógica para detectar el QR / Ancla
  useEffect(() => {
    if (location.hash === "#activar" && codeSectionRef.current) {
      setTimeout(() => {
        codeSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500); // Un pequeño delay para esperar a que carguen las imágenes
    }
  }, [location]);

  const scrollToCode = () => {
    codeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <NavbarFC />
      <CarouselContainerFC />
      <PresentacionFC scrollIntoView={scrollToCode} />
      <div className="text-center my-4 separator"></div>
      
      {/* Añadimos un id al div para que el navegador también ayude */}
      <div ref={codeSectionRef} id="activar">
        <CodeInputFC />
      </div>
      
      <div className="text-center my-4 separator"></div>
      <h2 className="mb-4 text-center courses-title">Cursos Disponibles</h2>
      <CursosDisponiblesFC />
      <FooterFC />
    </>
  );
}