import { useEffect, useState } from 'react';
import { getCarouselSlides } from '../api/carouselService';
import './HeroCarousel.css';

const AUTO_ADVANCE_MS = 4500;

export default function HeroCarousel() {
  const [slides, setSlides] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    getCarouselSlides()
      .then(setSlides)
      .catch(() => setSlides([]));
  }, []);

  useEffect(() => {
    if (slides.length === 0) {
      return undefined;
    }
    const intervalId = setInterval(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(intervalId);
  }, [slides]);

  function next() {
    if (slides.length === 0) return;
    setActiveIndex((i) => (i + 1) % slides.length);
  }

  function prev() {
    if (slides.length === 0) return;
    setActiveIndex((i) => (i - 1 + slides.length) % slides.length);
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="hero-carousel">
      <div className="hero-carousel__viewport">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={'hero-carousel__slide' + (i === activeIndex ? ' hero-carousel__slide--active' : '')}
          >
            <img className="hero-carousel__image" src={slide.image} alt={slide.title} />
            <div className="hero-carousel__overlay">
              <span className="hero-carousel__brand">{slide.brand}</span>
              <h2 className="hero-carousel__title">{slide.title}</h2>
              <p className="hero-carousel__subtitle">{slide.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="hero-carousel__arrow hero-carousel__arrow--prev" type="button" onClick={prev} aria-label="Anterior">
        &#10094;
      </button>
      <button className="hero-carousel__arrow hero-carousel__arrow--next" type="button" onClick={next} aria-label="Siguiente">
        &#10095;
      </button>

      <div className="hero-carousel__dots">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            className={'hero-carousel__dot' + (i === activeIndex ? ' hero-carousel__dot--active' : '')}
            type="button"
            onClick={() => setActiveIndex(i)}
            aria-label={`Ir a la imagen ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
