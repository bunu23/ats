export default function KanbanCard({ app, stage, handleDragStart, updateInterviewDate }) {
  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={e => handleDragStart(e, app.id)}
      style={{
        borderLeft:
          app.priority === 'Urgent'
            ? '4px solid #ef4444'
            : app.priority === 'High'
              ? '4px solid #f59e0b'
              : 'none'
      }}
    >
      <div style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
        {app.candidate_name}
        {app.priority === 'Urgent' && (
          <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>🔥 Urgent</span>
        )}
      </div>
      <div
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          marginBottom: '0.5rem'
        }}
      >
        Added: {new Date(app.stage_entered_at).toLocaleDateString()}
      </div>

      {(stage === 'Phone Screening' || stage === 'Interview') && (
        <div
          style={{
            marginBottom: '0.5rem',
            marginTop: '0.5rem',
            padding: '0.5rem',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '0.25rem'
          }}
        >
          <label
            style={{
              display: 'block',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              marginBottom: '0.25rem'
            }}
          >
            Interview Date
          </label>
          <input
            type="datetime-local"
            value={
              app.interview_date
                ? new Date(
                    new Date(app.interview_date).getTime() - new Date().getTimezoneOffset() * 60000
                  )
                    .toISOString()
                    .slice(0, 16)
                : ''
            }
            onChange={e => updateInterviewDate(app.id, new Date(e.target.value).toISOString())}
            style={{
              width: '100%',
              fontSize: '0.75rem',
              padding: '0.25rem',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              borderRadius: '0.25rem'
            }}
          />
        </div>
      )}

      {app.ai_score && (
        <div
          className="ai-score-badge"
          style={{
            background: app.ai_score >= 8 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)'
          }}
        >
          AI Score: {app.ai_score}/10
        </div>
      )}
    </div>
  );
}
