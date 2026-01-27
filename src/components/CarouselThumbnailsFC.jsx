import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Container } from 'react-bootstrap';

export function CarouselThumbnailsFC({activeIndex, setActiveIndex, thumbnails}) {

  return (
    <Row direction="horizontal" className="justify-content-center mx-4" gap={0}>
      {thumbnails.map((src, index) => (
        <Col key={index} xs="auto" className="p-1">
          <img
            key={index}
            src={src}
            alt={`Thumbnail ${index + 1}`}
            onClick={() => setActiveIndex(index)}
            className={`thumbnail ${index === activeIndex ? 'active' : ''}`}
          />
        </Col>
      ))}
    </Row>
  );
}
export default CarouselThumbnailsFC;