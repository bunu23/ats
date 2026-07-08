import KanbanColumn from './KanbanColumn';

export default function KanbanBoard({
  stages,
  applications,
  handleDragOver,
  handleDrop,
  handleDragStart,
  updateInterviewDate,
  moveApplication
}) {
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
