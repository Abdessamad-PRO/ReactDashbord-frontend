import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaRegClock } from 'react-icons/fa';
import { AiOutlineTeam } from 'react-icons/ai';
import './calendar.css';
import TaskService from '../../services/taskService';

const Calendar = ({ currentUser }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarTasks, setCalendarTasks] = useState([]);

  useEffect(() => {
    TaskService.getTasksForEmployee()
      .then(tasks => { 
        const mapped = tasks.map(task => ({
          id: task.id,
          title: task.name, 
          startDate: task.start_date,
          endDate: task.end_date,
          description: task.description || '',
          status: task.status,
          statusLabel: task.status === 'en_attente' ? 'En attente'
            : task.status === 'en_cours' ? 'En cours'
            : 'Terminé',
          priority: task.status === 'en_retard' ? 'high'
            : task.status === 'terminé' ? 'low'
            : 'medium'
        }));
        setCalendarTasks(mapped);
      })
      .catch(error => console.error('Erreur récupération tâches:', error));
  }, []);

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getMonthData = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevMonthYear, prevMonth + 1, 0).getDate();

    for (let i = 0; i < startingDay; i++) {
      days.push({ day: prevMonthLastDay - startingDay + i + 1, month: prevMonth, year: prevMonthYear, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, month, year, isCurrentMonth: true });
    }

    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push({ day: i, month: nextMonth, year: nextMonthYear, isCurrentMonth: false });
      }
    }

    return days;
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

  const getTasksForDate = (year, month, day) => {
    const date = new Date(formatDateString(year, month, day));
    return calendarTasks.filter(task => {
      const start = new Date(task.startDate);
      const end = new Date(task.endDate);
      return date >= start && date <= end;
    });
  };

  const isToday = (year, month, day) => {
    const today = new Date();
    return year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
  };

  return (
    <div className="calendar-page">
      <div className="page-header">
        <h1>Calendrier des Tâches</h1>
        <p>Visualisez vos tâches à venir et en cours</p>
      </div>

      <div className="calendar-container">
        <div className="calendar-grid">
          <div className="calendar-header">
            <div className="calendar-nav">
              <button onClick={previousMonth} className="calendar-nav-btn"><FaChevronLeft /></button>
              <h2 className="current-month">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
              <button onClick={nextMonth} className="calendar-nav-btn"><FaChevronRight /></button>
            </div>
          </div>
          <div className="days-of-week">
            {daysOfWeek.map(day => <div key={day} className="day-name">{day}</div>)}
          </div>

          <div className="calendar-body">
            {(() => {
              const year = currentMonth.getFullYear();
              const month = currentMonth.getMonth();
              const days = getMonthData(year, month);
              const weeks = [];

              for (let i = 0; i < days.length; i += 7) {
                weeks.push(days.slice(i, i + 7));
              }

              return weeks.map((week, i) => (
                <div key={i} className="calendar-week">
                  {week.map(day => {
                    const dayTasks = getTasksForDate(day.year, day.month, day.day);
                    return (
                      <div
                        key={`${day.day}-${day.month}`}
                        className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday(day.year, day.month, day.day) ? 'today' : ''}`}
                      >
                        <div className="day-number">{day.day}</div>
                        <div className="day-events">
                          {dayTasks.slice(0, 2).map(task => (
                            <div
                              key={task.id}
                              className={`event-pill priority-${task.priority}`}
                              title={`${task.title} - ${task.statusLabel}`}
                            >
                              {task.title.length > 15 ? task.title.substring(0, 15) + '...' : task.title}
                            </div>
                          ))}
                          {dayTasks.length > 2 && (
                            <div className="more-events">+{dayTasks.length - 2} plus</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ));
            })()}
          </div>
        </div>
      </div>

      <div className="calendar-sidebar">
        <h3 className="section-title">Tâches en cours / à venir</h3>
        <div className="events-list">
          {calendarTasks
            .filter(t => ['en_attente', 'en_cours'].includes(t.status))
            .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
            .slice(0, 5)
            .map(task => (
              <div key={task.id} className={`event-card priority-${task.priority}`}>
                <div className="event-title">{task.title}</div>
                <div className="event-dates">
                  <FaRegClock style={{ marginRight: '5px' }} />
                  <span>Du {new Date(task.startDate).toLocaleDateString('fr-FR')} au {new Date(task.endDate).toLocaleDateString('fr-FR')}</span>
                </div>
                <p className="event-description">{task.description.substring(0, 120)}{task.description.length > 120 ? '...' : ''}</p>
                <div className={`project-status status-${task.status}`}>
                  {task.statusLabel}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
