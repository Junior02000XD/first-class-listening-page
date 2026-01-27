import { useState } from 'react';
import { CarouselThumbnailsFC } from './CarouselThumbnailsFC';
import { CarouselFC } from './CarouselFC';

export function CarouselContainerFC() {
    const [activeIndex, setActiveIndex] = useState(0);
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
    <>
        <div id="BorderCarousel">
            <CarouselFC activeIndex={activeIndex} setActiveIndex={setActiveIndex} thumbnails={thumbnails} />
        </div>
        <CarouselThumbnailsFC activeIndex={activeIndex} setActiveIndex={setActiveIndex} thumbnails={thumbnails} />
    </>
  );
}
export default CarouselContainerFC;