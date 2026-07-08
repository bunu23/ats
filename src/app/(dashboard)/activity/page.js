'use client';
import { useState, useEffect } from 'react';

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

  if (loading) return <div>Loading activity...</div>;

  return (
    <div>
      <h1>Activity & AI Email Log</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        History of all automated actions, AI-generated emails, and system events.
      </p>

      <div className="glass-card">
        <div className="activity-list">
          {logs.map(log => {
            const isExpanded = expandedId === log.id;
            let meta = {};
            try {
              meta = JSON.parse(log.metadata || '{}');
            } catch (e) {}

            return (
              <div
                key={log.id}
                className="activity-item"
                style={{
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  padding: '1rem',
                  borderRadius: '0.5rem'
                }}
                onClick={() => setExpandedId(isExpanded ? null : log.id)}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div className="activity-icon" style={{ marginRight: '1rem', flexShrink: 0 }}>
                    {log.type === 'email_sent'
                      ? '✉️'
                      : log.type === 'ai_scoring'
                        ? '🤖'
                        : log.type === 'notification'
                          ? '🔔'
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
                              <strong style={{ color: 'var(--text-secondary)' }}>To:</strong>{' '}
                              {meta.to}
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
                              {meta.score}/100
                            </div>
                            <div>
                              <strong style={{ color: 'var(--text-secondary)' }}>
                                Evaluation Details:
                              </strong>
                              <div
                                style={{
                                  marginTop: '0.5rem',
                                  whiteSpace: 'pre-wrap',
                                  lineHeight: 1.5
                                }}
                              >
                                {meta.evaluation || 'No evaluation provided.'}
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
                              <div
                                style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
                              >
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
                                      {key
                                        .replace(/_/g, ' ')
                                        .replace(/\b\w/g, l => l.toUpperCase())}
                                      :
                                    </span>
                                    <span
                                      style={{
                                        color: 'var(--text-primary)',
                                        wordBreak: 'break-word'
                                      }}
                                    >
                                      {typeof value === 'object'
                                        ? JSON.stringify(value)
                                        : String(value)}
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
          })}
          {logs.length === 0 && <div>No activity logs found.</div>}
        </div>
      </div>
    </div>
  );
}
