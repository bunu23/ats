import React from 'react';

export default function CandidateTable({
  filteredCandidates,
  getCandidateAppInfo,
  openModal,
  navigateToPipeline,
  handleDeleteCandidate
}) {
  return (
    <div
      style={{
        background: '#0f172a',
        borderRadius: '0.5rem',
        border: '1px solid rgba(255,255,255,0.05)',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ background: '#020617', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <tr>
            <th
              style={{
                padding: '1rem 1.5rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              Candidate Details
            </th>
            <th
              style={{
                padding: '1rem 1.5rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              Applied Role
            </th>
            <th
              style={{
                padding: '1rem 1.5rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              Hiring Stage
            </th>
            <th
              style={{
                padding: '1rem 1.5rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              Resume Score
            </th>
            <th
              style={{
                padding: '1rem 1.5rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              Source
            </th>
            <th
              style={{
                padding: '1rem 1.5rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                textAlign: 'right'
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredCandidates.map((candidate, index) => {
            const appInfo = getCandidateAppInfo(candidate.id);
            return (
              <tr
                key={candidate.id}
                style={{
                  cursor: 'pointer',
                  borderBottom:
                    index !== filteredCandidates.length - 1
                      ? '1px solid rgba(255,255,255,0.05)'
                      : 'none',
                  transition: 'background-color 0.2s ease',
                  background: 'transparent'
                }}
                onClick={() => navigateToPipeline && navigateToPipeline(appInfo.job_id)}
                onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: '#fff'
                      }}
                    >
                      {candidate.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                        {candidate.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        {candidate.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ fontWeight: 500, color: '#e2e8f0', fontSize: '0.9rem' }}>
                    {appInfo.role}
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span
                    style={{
                      background: appInfo.bg,
                      color: appInfo.color,
                      border: `1px solid ${appInfo.color}40`,
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {appInfo.stage}
                  </span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  {appInfo.score ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '60px',
                          height: '6px',
                          background: 'rgba(255,255,255,0.1)',
                          borderRadius: '999px',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            width: `${appInfo.score}%`,
                            height: '100%',
                            background:
                              appInfo.score > 80
                                ? '#4ade80'
                                : appInfo.score > 60
                                  ? '#fbbf24'
                                  : '#f87171'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600 }}>
                        {appInfo.score}%
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>N/A</span>
                  )}
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      color: '#cbd5e1'
                    }}
                  >
                    {appInfo.source}
                  </span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      openModal(candidate);
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      transition: 'background 0.2s',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginRight: '0.5rem'
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  >
                    <span>📁</span> Profile
                  </button>

                  <button
                    onClick={e => handleDeleteCandidate(candidate.id, e)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      transition: 'background 0.2s',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)')}
                    onMouseOut={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                  >
                    <span>🗑️</span> Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {filteredCandidates.length === 0 && (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No candidates found matching your criteria.
        </div>
      )}
    </div>
  );
}
