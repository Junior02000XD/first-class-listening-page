import './App.css'
import { NavbarFC } from './components/NavbarFC.jsx';
import { CarouselContainerFC } from './components/CarouselContainerFC.jsx';
import { PresentacionFC } from './components/PresentacionFC.jsx';
import { CodeInputFC } from './components/CodeInputFC.jsx';
import { CursosDisponiblesFC } from './components/CursosDisponiblesFC.jsx';
import { useRef } from 'react';
import FooterFC from './components/FooterFC.jsx';

export function App() {
  const codeSectionRef = useRef(null);

  const scrollToCode = () => {
    codeSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <>
      <NavbarFC />
      <CarouselContainerFC />
      <PresentacionFC scrollIntoView={scrollToCode} />
      <div className="text-center my-4 separator"></div>
      <div ref={codeSectionRef}>
        <CodeInputFC />
      </div>
      <div className="text-center my-4 separator"></div>
      <h2 className="mb-4 text-center courses-title">Cursos Disponibles</h2>
      <CursosDisponiblesFC />
      <FooterFC />
    </>
  )
}

export default App
