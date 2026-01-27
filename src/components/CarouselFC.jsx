import Carousel from 'react-bootstrap/Carousel';

export function CarouselFC({activeIndex, setActiveIndex, thumbnails}) {
  return (
    <Carousel activeIndex={activeIndex} onSelect={setActiveIndex}>
      {
        thumbnails.map((src, index) => (
          <Carousel.Item key={index} interval={2000}>
            <img
              className="d-block w-100"
              src={src}
              alt={`Slide ${index + 1}`}
            />
          </Carousel.Item>
        ))
      }
    </Carousel>
  );
}

export default CarouselFC;
