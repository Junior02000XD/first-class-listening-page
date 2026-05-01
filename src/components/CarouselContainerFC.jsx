import { useState } from 'react';
import { CarouselThumbnailsFC } from './CarouselThumbnailsFC';
import { CarouselFC } from './CarouselFC';

export function CarouselContainerFC() {
    const [activeIndex, setActiveIndex] = useState(0);
    
    // Si en el futuro agregas más imágenes, solo las pones aquí
    const thumbnails = [
        '/CursosImages/EnglishFirst_1.jpeg',
        '/CursosImages/EnglishFirst_2.jpeg',
        '/CursosImages/EnglishFirst_3.jpeg',
        '/CursosImages/EnglishFirst_4.jpeg',
        '/CursosImages/EnglishFirst_5.jpeg',
        '/CursosImages/EnglishFirst_6.jpeg',
        '/CursosImages/EnglishFirst_7.jpeg'
    ];

  return (
    <div className="carousel-wrapper my-4 animate__animated animate__fadeIn">
        {/* El CSS de #BorderCarousel hace el marco dorado. Aquí le sumamos la sombra y el fondo */}
        <div id="BorderCarousel" className="shadow-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
            <CarouselFC 
                activeIndex={activeIndex} 
                setActiveIndex={setActiveIndex} 
                thumbnails={thumbnails} 
            />
        </div>
        
        {/* Componente de Miniaturas */}
        <CarouselThumbnailsFC 
            activeIndex={activeIndex} 
            setActiveIndex={setActiveIndex} 
            thumbnails={thumbnails} 
        />
    </div>
  );
}

export default CarouselContainerFC;