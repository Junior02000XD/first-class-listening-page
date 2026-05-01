import Carousel from 'react-bootstrap/Carousel';

export function CarouselFC({ activeIndex, setActiveIndex, thumbnails }) {
  return (
    <Carousel 
      activeIndex={activeIndex} 
      onSelect={setActiveIndex}
      fade={true} // Transición elegante de desvanecimiento
      indicators={false} // Ocultamos los puntos por defecto porque usamos tus miniaturas
      className="rounded overflow-hidden"
    >
      {
        thumbnails.map((src, index) => (
          // 4000ms da tiempo suficiente para apreciar la imagen
          <Carousel.Item key={index} interval={4000}>
            <img
              className="d-block w-100"
              src={src}
              alt={`Slide de First Class Institute ${index + 1}`}
              style={{ 
                objectFit: 'cover', // Evita que la imagen se deforme
                maxHeight: '550px', // Limita el alto en pantallas ultrawide
                borderRadius: '6px' // Pequeño redondeo interno para encajar perfecto en el BorderCarousel
              }}
            />
          </Carousel.Item>
        ))
      }
    </Carousel>
  );
}

export default CarouselFC;