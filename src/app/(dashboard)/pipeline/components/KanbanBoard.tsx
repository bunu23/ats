import React from 'react';
import KanbanColumn from './KanbanColumn';
import { PipelineApplication } from './KanbanCard';

interface KanbanBoardProps {
  stages: string[];
  applications: PipelineApplication[];
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, stage: string) => void;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  updateInterviewDate: (id: string, dateStr: string) => void;
  moveApplication: (id: string, stage: string) => void;
}

export default function KanbanBoard({
  stages,
  applications,
  handleDragOver,
  handleDrop,
  handleDragStart,
  updateInterviewDate,
  moveApplication
}: KanbanBoardProps) {
  return (
    <div className="kanban-board">
      {stages.map(stage => (
        <KanbanColumn
          key={stage}
          stage={stage}
          applications={applications}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          handleDragStart={handleDragStart}
          updateInterviewDate={updateInterviewDate}
          moveApplication={moveApplication}
        />
      ))}
    </div>
  );
}
