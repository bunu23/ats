'use client';
import { useState, useEffect } from 'react';

const ActivityItem = ({ log, expandedId, setExpandedId }) => {
  const isExpanded = expandedId === log.id;
  let meta = {};
  try {
    meta = JSON.parse(log.metadata || '{}');
  } catch (e) {}

  const isAlert = log.type === 'slack_notification' || log.type === 'notification';

  return (
    <div
      className="activity-item"
      style={{
        cursor: 'pointer',
        transition: 'background 0.2s',
        padding: '1rem',
        borderRadius: '0.5rem',
        borderLeft: isAlert ? '4px solid #ef4444' : 'none',
        background: isAlert ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
        marginBottom: '0.5rem'
      }}
      onClick={() => setExpandedId(isExpanded ? null : log.id)}
      onMouseEnter={e => {
        if (!isAlert) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
      }}
      onMouseLeave={e => {
        if (!isAlert) e.currentTarget.style.background = 'transparent';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        <div className="activity-icon" style={{ marginRight: '1rem', flexShrink: 0 }}>
          {log.type === 'email_sent'
            ? '✉️'
            : log.type === 'ai_scoring'
              ? '🤖'
              : log.type === 'slack_notification'
                ? '💬'
                : log.type === 'notification'
                  ? '🚨'
                  : '🔄'}
        </div>
        <div className="activity-content" style={{ flexGrow: 1 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.25rem'
            }}
          >
            <div className="activity-title" style={{ fontWeight: 600 }}>
              {log.title}
            </div>
            <div
              className="activity-meta"
              style={{
                marginTop: 0,
                fontSize: '0.875rem',
                color: 'var(--text-secondary)'
              }}
            >
              {new Date(log.created_at).toLocaleString()}
              <span style={{ marginLeft: '1rem', fontSize: '0.75rem', opacity: 0.5 }}>
                {isExpanded ? '▲ Hide' : '▼ Details'}
              </span>
            </div>
          </div>

          <div
            className="activity-desc"
            style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}
          >
            {log.description}
          </div>

          {isExpanded && (
            <div
              style={{
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                animation: 'fadeIn 0.2s ease-in-out'
              }}
            >
              {log.type === 'email_sent' && (
                <div
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    padding: '1.25rem',
                    borderRadius: '0.5rem',
                    borderLeft: '4px solid var(--accent-primary)',
                    fontSize: '0.875rem'
                  }}
                >
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>To:</strong> {meta.to}
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Subject:</strong>{' '}
                    {meta.subject}
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Body:</strong>
                    <div
                      style={{
                        marginTop: '0.5rem',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.5
                      }}
                    >
                      {meta.body || 'No content provided.'}
                    </div>
                  </div>
                </div>
              )}

              {log.type === 'ai_scoring' && (
                <div
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    padding: '1.25rem',
                    borderRadius: '0.5rem',
                    borderLeft: '4px solid #a855f7',
                    fontSize: '0.875rem'
                  }}
                >
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>AI Score:</strong>{' '}
                    {meta.score?.overallScore || meta.score}/10
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Evaluation Details:</strong>
                    <div
                      style={{
                        marginTop: '0.5rem',
                        whiteSpace: 'pre-wrap',
                        lineHeight: 1.5
                      }}
                    >
                      {meta.score?.recommendation || meta.evaluation || 'No evaluation provided.'}
                    </div>
                  </div>
                </div>
              )}

              {log.type !== 'email_sent' &&
                log.type !== 'ai_scoring' &&
                Object.keys(meta).length > 0 && (
                  <div
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      padding: '1.25rem',
                      borderRadius: '0.5rem',
                      borderLeft: '4px solid var(--text-secondary)',
                      fontSize: '0.875rem'
                    }}
                  >
                    <strong
                      style={{
                        color: 'var(--text-secondary)',
                        display: 'block',
                        marginBottom: '0.5rem'
                      }}
                    >
                      Event Details:
                    </strong>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {Object.entries(meta).map(([key, value]) => (
                        <div
                          key={key}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.5rem'
                          }}
                        >
                          <span
                            style={{
                              color: 'var(--text-secondary)',
                              fontWeight: 600,
                              minWidth: '100px'
                            }}
                          >
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                          </span>
                          <span
                            style={{
                              color: 'var(--text-primary)',
                              wordBreak: 'break-word'
                            }}
                          >
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Accordion = ({ title, items, expandedId, setExpandedId, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          background: 'rgba(255,255,255,0.02)',
          border: 'none',
          color: 'white',
          fontSize: '1.1rem',
          fontWeight: '600',
          cursor: 'pointer',
          borderBottom: isOpen ? '1px solid rgba(255,255,255,0.1)' : 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {title}
          <span
            style={{
              background: 'var(--accent-primary)',
              color: 'white',
              fontSize: '0.75rem',
              padding: '0.1rem 0.5rem',
              borderRadius: '9999px',
              marginLeft: '0.5rem'
            }}
          >
            {items.length}
          </span>
        </div>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div style={{ padding: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
          {items.length === 0 ? (
            <div style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              No items in this category.
            </div>
          ) : (
            items.map(log => (
              <ActivityItem
                key={log.id}
                log={log}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default function Activity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetch('/api/activity')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLogs(data.data);
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading Mission Control...</div>;

  const automatedActions = logs.filter(
    l => l.type === 'ai_scoring' || l.type === 'delayed_rejection'
  );
  const emailLogs = logs.filter(l => l.type === 'email_sent');
  const systemEvents = logs.filter(l => l.type === 'stage_change' || l.type === 'new_application');
  const priorityAlerts = logs.filter(
    l =>
      l.type === 'slack_notification' ||
      l.type === 'notification' ||
      (l.metadata && (l.metadata.includes('Urgent') || l.metadata.includes('High')))
  );

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Mission Control</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Centralized hub for all background activities, AI operations, and critical alerts.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2rem',
          alignItems: 'start'
        }}
      >
        <style jsx>{`
          @media (min-width: 1024px) {
            div[style*='display: grid'] {
              grid-template-columns: 2fr 1fr !important;
            }
          }
        `}</style>

        {/* Left Column: Dropdowns */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Accordion
            title="Automated Actions"
            items={automatedActions}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            defaultOpen={true}
          />
          <Accordion
            title="AI-Generated Emails"
            items={emailLogs}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
          />
          <Accordion
            title="System Events"
            items={systemEvents}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
          />
        </div>

        {/* Right Column: High Priority Alerts */}
        <div
          className="glass-card"
          style={{
            border: '1px solid rgba(239, 68, 68, 0.5)',
            background: 'rgba(15, 23, 42, 0.8)'
          }}
        >
          <h3
            style={{
              color: '#ef4444',
              marginTop: 0,
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1.25rem'
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#ef4444',
                animation: 'pulse 2s infinite'
              }}
            ></span>
            High Priority Alerts
          </h3>

          <div style={{ maxHeight: '800px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {priorityAlerts.length === 0 ? (
              <div
                style={{
                  padding: '2rem 1rem',
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                  border: '1px dashed rgba(255,255,255,0.1)',
                  borderRadius: '0.5rem'
                }}
              >
                All clear! No pending alerts.
              </div>
            ) : (
              priorityAlerts.map(log => (
                <ActivityItem
                  key={log.id}
                  log={log}
                  expandedId={expandedId}
                  setExpandedId={setExpandedId}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
