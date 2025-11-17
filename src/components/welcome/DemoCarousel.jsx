import React, { useState, useEffect } from 'react';
import '../../welcome.css';
import { RiDashboardFill } from "react-icons/ri";
import { FaChartGantt } from "react-icons/fa6";
import { GoProject } from "react-icons/go";
import { FaTasks } from "react-icons/fa";
import { SlCalender } from "react-icons/sl";
import { FaHome } from "react-icons/fa";

const DemoCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      id: 6,
      title: 'Page d\'accueil',
      image: '/assets/demo-screenshots/home-page.png',
      icon: <FaHome />
    },
    {
      id: 1,
      title: 'Tableau de bord',
      image: '/assets/demo-screenshots/dashboard-page.png',
      icon: <RiDashboardFill />
    },
    {
      id: 2,
      title: 'Diagramme de Gantt',
      image: '/assets/demo-screenshots/gantt-page.png',
      icon: <FaChartGantt />
    },
    {
      id: 3,
      title: 'Gestion des projets',
      image: '/assets/demo-screenshots/project-page.png',
      icon: <GoProject />
    },
    {
      id: 4,
      title: 'Gestion des tâches',
      image: '/assets/demo-screenshots/taches-page.png',
      icon: <FaTasks />
    },
    {
      id: 5,
      title: 'Calendrier',
      image: '/assets/demo-screenshots/calendar-page.png',
      icon: <SlCalender />
    },
    
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="demo-carousel">
      <div className="carousel-container">
        <div 
          className="carousel-track"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="carousel-slide">
              <div className="slide-content">
                <div className="slide-header">
                  <div className="slide-icon">{slide.icon}</div>
                  <h3>{slide.title}</h3>
                </div>
                <div className="slide-image">
                  <img 
                    src={slide.image} 
                    alt={slide.title} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg width=\'800\' height=\'400\' viewBox=\'0 0 800 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'%23f0f2f5\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' font-family=\'Arial\' font-size=\'24\' text-anchor=\'middle\' alignment-baseline=\'middle\' fill=\'%23666\'%3E{slide.title}%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="carousel-dots">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`dot ${currentSlide === index ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Aller au slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default DemoCarousel;