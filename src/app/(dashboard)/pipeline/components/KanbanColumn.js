import KanbanCard from './KanbanCard';

export default function KanbanColumn({
  stage,
  applications,
  handleDragOver,
  handleDrop,
  handleDragStart,
  updateInterviewDate
}) {
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
          />
        ))}
      </div>
    </div>
  );
}
