import React from 'react';

export interface PipelineApplication {
  id: string;
  stage: string;
  ai_score?: number | null;
  priority?: string | null;
  candidate_name: string;
  candidate_id: string;
  stage_entered_at: string;
  created_at: string;
  interview_date?: string | null;
  resume_score?: number | null;
  source?: string | null;
  job_id: string;
}

interface KanbanCardProps {
  app: PipelineApplication;
  stage: string;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
  updateInterviewDate: (id: string, dateStr: string) => void;
  moveApplication: (id: string, stage: string) => void;
}

export default function KanbanCard({
  app,
  stage,
  handleDragStart,
  updateInterviewDate,
  moveApplication
}: KanbanCardProps) {
  const isBelowThreshold = app.ai_score !== undefined && app.ai_score !== null && app.ai_score < 60;

  return (
    <div
      className="kanban-card"
      draggable={!isBelowThreshold}
      onDragStart={e => {
        if (!isBelowThreshold) {
          handleDragStart(e, app.id);
        } else {
          e.preventDefault();
        }
      }}
      style={{
        opacity: isBelowThreshold ? 0.6 : 1,
        cursor: isBelowThreshold ? 'not-allowed' : 'grab',
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

      {app.ai_score !== undefined && app.ai_score !== null && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '0.5rem',
            background: 'rgba(0,0,0,0.2)',
            padding: '0.5rem',
            borderRadius: '0.25rem'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            AI Score: <strong style={{ color: 'white' }}>{app.ai_score}/100</strong>
          </div>
          <div
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '0.15rem 0.4rem',
              borderRadius: '0.25rem',
              background:
                app.ai_score > 85
                  ? 'rgba(74, 222, 128, 0.1)'
                  : app.ai_score >= 60
                    ? 'rgba(59, 130, 246, 0.1)'
                    : 'rgba(248, 113, 113, 0.1)',
              color: app.ai_score > 85 ? '#4ade80' : app.ai_score >= 60 ? '#60a5fa' : '#f87171',
              border: `1px solid ${app.ai_score > 85 ? '#4ade8040' : app.ai_score >= 60 ? '#60a5fa40' : '#f8717140'}`
            }}
          >
            {app.ai_score > 85
              ? 'Exceptional Fit'
              : app.ai_score >= 60
                ? 'Good Fit'
                : 'Below Threshold'}
          </div>
        </div>
      )}

      {stage === 'Offer' && (
        <button
          onClick={() => moveApplication(app.id, 'Background Check')}
          style={{
            marginTop: '0.5rem',
            width: '100%',
            padding: '0.5rem',
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}
        >
          Simulate Signature
        </button>
      )}

      {stage === 'Background Check' && (
        <button
          onClick={() => moveApplication(app.id, 'Hired')}
          style={{
            marginTop: '0.5rem',
            width: '100%',
            padding: '0.5rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}
        >
          Verify & Hire
        </button>
      )}
    </div>
  );
}
