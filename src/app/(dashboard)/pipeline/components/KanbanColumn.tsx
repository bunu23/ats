import React from 'react';
import KanbanCard, { PipelineApplication } from './KanbanCard';

interface KanbanColumnProps {
  stage: string;
  applications: PipelineApplication[];
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>, stage: string) => void;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  updateInterviewDate: (id: string, dateStr: string) => void;
  moveApplication: (id: string, stage: string) => void;
}

export default function KanbanColumn({
  stage,
  applications,
  handleDragOver,
  handleDrop,
  handleDragStart,
  updateInterviewDate,
  moveApplication
}: KanbanColumnProps) {
  const stageApps = applications.filter(a => a.stage === stage);

  return (
    <div className="kanban-column" onDragOver={handleDragOver} onDrop={e => handleDrop(e, stage)}>
      <div className="kanban-column-header">
        <span>{stage}</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {stageApps.length}
        </span>
      </div>

      <div className="kanban-cards">
        {stageApps.map(app => (
          <KanbanCard
            key={app.id}
            app={app}
            stage={stage}
            handleDragStart={handleDragStart}
            updateInterviewDate={updateInterviewDate}
            moveApplication={moveApplication}
          />
        ))}
      </div>
    </div>
  );
}
