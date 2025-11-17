import React from 'react';
import { Gantt } from 'react-gantt-chart';
// The CSS import has been removed as it does not exist in the package.
import './GanttChart.css';

const GanttChart = ({ projects }) => {
  const tasks = projects.map((project, index) => ({
    id: index,
    name: project.name,
    start: new Date(project.startDate), 
    end: new Date(project.endDate),
    progress: project.progress,
  }));

  return (
    <div className="gantt-chart-container">
      <Gantt tasks={tasks} />
    </div>
  );
}; 
 
export default GanttChart;
