import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaProjectDiagram, FaRegClock } from 'react-icons/fa';
import { AiOutlineTeam } from 'react-icons/ai';
import './calendar.css';
import ProjectService from '../../services/projectService';

const ManagerCalendar = ({ currentUser }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarProjects, setCalendarProjects] = useState([]);

  useEffect(() => {
    ProjectService.getProjectsForManager()
      .then(data => {
        const mappedProjects = data.map(project => {
          const startDate = project.start_date ? project.start_date.substring(0, 10) : '2025-06-01';
          const endDate = project.end_date ? project.end_date.substring(0, 10) : '2025-07-15';

          let priority = 'medium';
          if (project.status === 'En retard') priority = 'high';
          else if (project.status === 'Terminé') priority = 'low';

          return {
            id: project.id,
            title: project.name,
            startDate,
            endDate, 
            type: 'project',
            // status: project.status
            status: project.status=== 'en_attente' ? 'En attente'
            : project.status === 'en_cours' ? 'En cours'
            : 'Terminé',
            priority,
            team: project.team || [],
            description: project.description || 'Aucune description disponible'
          };
        });
        setCalendarProjects(mappedProjects);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des projets :', error);
      });
  }, []);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getMonthData = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const calendarDays = [];

    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevMonthYear, prevMonth + 1, 0).getDate();

    for (let i = 0; i < startingDay; i++) {
      calendarDays.push({
        day: prevMonthLastDay - startingDay + i + 1,
        month: prevMonth,
        year: prevMonthYear,
        isCurrentMonth: false
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({
        day: i,
        month,
        year,
        isCurrentMonth: true
      });
    }

    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;

    const remainingDays = 7 - (calendarDays.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        calendarDays.push({
          day: i,
          month: nextMonth,
          year: nextMonthYear,
          isCurrentMonth: false
        });
      }
    }

    return calendarDays;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatDateString = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getProjectsForDate = (year, month, day) => {
    const dateString = formatDateString(year, month, day);
    return calendarProjects.filter(project => {
      const currentDate = new Date(dateString);
      const startDate = new Date(project.startDate);
      const endDate = new Date(project.endDate);
      return currentDate >= startDate && currentDate <= endDate;
    });
  };

  const isToday = (year, month, day) => {
    const today = new Date();
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    );
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const calendarDays = getMonthData(year, month);

    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    return (
      <div className="calendar-grid">
        <div className="calendar-header">
          <div className="calendar-nav">
            <button onClick={previousMonth} className="calendar-nav-btn"><FaChevronLeft /></button>
            <h2 className="current-month">{monthNames[month]} {year}</h2>
            <button onClick={nextMonth} className="calendar-nav-btn"><FaChevronRight /></button>
          </div>
        </div>
        <div className="days-of-week">
          {daysOfWeek.map(day => (
            <div key={day} className="day-name">{day}</div>
          ))}
        </div>
        <div className="calendar-body">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="calendar-week">
              {week.map((day) => {
                const dateProjects = getProjectsForDate(day.year, day.month, day.day);
                return (
                  <div
                    key={`${day.day}-${day.month}`}
                    className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday(day.year, day.month, day.day) ? 'today' : ''}`}
                  >
                    <div className="day-number">{day.day}</div>
                    <div className="day-events">
                      {dateProjects.slice(0, 2).map(project => (
                        <div
                          key={project.id}
                          className={`event-pill priority-${project.priority}`}
                          title={`${project.title} - ${project.status}`}
                        >
                          <span className="project-icon-mini"><FaProjectDiagram size={10} style={{ marginRight: '4px' }} /></span>
                          {project.title.length > 15 ? project.title.substring(0, 15) + '...' : project.title}
                        </div>
                      ))}
                      {dateProjects.length > 2 && (
                        <div className="more-events">+{dateProjects.length - 2} plus</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUpcomingProjects = () => {
    const currentDate = new Date();
    const activeProjects = calendarProjects
      .filter(project => new Date(project.endDate) >= currentDate)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    return (
      <div className="upcoming-events">
        <h3 className="section-title">Projets en cours</h3>
        <div className="events-list">
          {activeProjects.slice(0, 5).map(project => (
            <div key={project.id} className={`event-card priority-${project.priority}`}>
              <div className="event-title">
                <FaProjectDiagram style={{ marginRight: '8px' }} />
                {project.title}
              </div>
              <div className="event-dates">
                <FaRegClock style={{ marginRight: '5px' }} />
                <span>Du {new Date(project.startDate).toLocaleDateString('fr-FR')} au {new Date(project.endDate).toLocaleDateString('fr-FR')}</span>
              </div>
              <p className="event-description">{project.description.substring(0, 120)}{project.description.length > 120 ? '...' : ''}</p>
              <div className="project-meta">
                <div className="project-team">
                  {/* <AiOutlineTeam style={{ marginRight: '5px' }} />
                  <span>{project.team.length} membres</span>  */}
                </div>
                <div className={`project-status status-${project.status === 'En cours' ? 'inprogress' : project.status === 'En retard' ? 'late' : project.status === 'Terminé' ? 'completed' : 'pending'}`}>
                  {project.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-page">
      <div className="page-header">
        <h1>Calendrier des Projets</h1>
        <p>Visualisez et gérez la timeline de vos projets</p>
      </div>
      <div className="calendar-container">
        {renderCalendar()}
      </div>
      <div className="calendar-sidebar">
        {renderUpcomingProjects()}
      </div>
    </div>
  );
};

export default ManagerCalendar;
