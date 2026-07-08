import React from 'react';

export default function CandidateModal({
  selectedCandidate,
  setSelectedCandidate,
  reviews,
  newReview,
  setNewReview,
  handleAddReview
}) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          height: '85vh',
          background: '#020617',
          borderRadius: '1rem',
          border: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ margin: 0, color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>
              {selectedCandidate.name}
            </h2>
            {selectedCandidate.appInfo.score && (
              <span
                style={{
                  background:
                    selectedCandidate.appInfo.score > 85
                      ? 'rgba(74, 222, 128, 0.1)'
                      : selectedCandidate.appInfo.score >= 60
                        ? 'rgba(59, 130, 246, 0.1)'
                        : 'rgba(248, 113, 113, 0.1)',
                  color:
                    selectedCandidate.appInfo.score > 85
                      ? '#4ade80'
                      : selectedCandidate.appInfo.score >= 60
                        ? '#60a5fa'
                        : '#f87171',
                  border: `1px solid ${selectedCandidate.appInfo.score > 85 ? '#4ade8040' : selectedCandidate.appInfo.score >= 60 ? '#60a5fa40' : '#f8717140'}`,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                {selectedCandidate.appInfo.score}% -{' '}
                {selectedCandidate.appInfo.score > 85
                  ? 'Exceptional Fit'
                  : selectedCandidate.appInfo.score >= 60
                    ? 'Good Fit'
                    : 'Below Threshold'}
              </span>
            )}
          </div>
          <button
            onClick={() => setSelectedCandidate(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%'
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            ✕
          </button>
        </div>

        {/* Split Pane Content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Column: Sidebar */}
          <div
            style={{
              width: '320px',
              padding: '2rem',
              borderRight: '1px solid #1e293b',
              background: '#0f172a',
              overflowY: 'auto'
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '2rem'
              }}
            >
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at top left, #22d3ee, #3b82f6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: 'white',
                  boxShadow: '0 0 20px rgba(34, 211, 238, 0.4)'
                }}
              >
                {selectedCandidate.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .substring(0, 2)}
              </div>
              <div
                style={{
                  marginTop: '1rem',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  color: '#cbd5e1'
                }}
              >
                Source: {selectedCandidate.appInfo.source}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.25rem'
                  }}
                >
                  Email
                </div>
                <a
                  href={`mailto:${selectedCandidate.email}`}
                  style={{ color: '#38bdf8', textDecoration: 'none', fontSize: '0.875rem' }}
                >
                  {selectedCandidate.email}
                </a>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.25rem'
                  }}
                >
                  Phone
                </div>
                <div style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>
                  {selectedCandidate.phone || 'N/A'}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.25rem'
                  }}
                >
                  Job Req
                </div>
                <div style={{ color: '#22d3ee', fontWeight: 600, fontSize: '0.875rem' }}>
                  {selectedCandidate.appInfo.role}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.5rem'
                  }}
                >
                  Status
                </div>
                <span
                  style={{
                    background: selectedCandidate.appInfo.bg,
                    color: selectedCandidate.appInfo.color,
                    border: `1px solid ${selectedCandidate.appInfo.color}40`,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em'
                  }}
                >
                  {selectedCandidate.appInfo.stage}
                </span>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.25rem'
                  }}
                >
                  Resume Link
                </div>
                <a
                  href="#"
                  style={{
                    color: '#38bdf8',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  📄 View Resume Document
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Timeline & Interactivity */}
          <div
            style={{
              flex: 1,
              padding: '2rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem'
            }}
          >
            {/* Audit Log / Stage History */}
            <div
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid #1e293b',
                borderRadius: '0.75rem',
                padding: '1.5rem'
              }}
            >
              <h3 style={{ margin: '0 0 1.5rem 0', color: 'white', fontSize: '1.1rem' }}>
                Audit Log & Stage History
              </h3>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '11px',
                    top: '10px',
                    bottom: '10px',
                    width: '2px',
                    background: '#1e293b',
                    zIndex: 0
                  }}
                ></div>

                <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#020617',
                      border: '2px solid #22d3ee',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#22d3ee'
                      }}
                    ></div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>
                        → {selectedCandidate.appInfo.stage}
                      </span>
                      <span
                        style={{
                          background: 'rgba(56, 189, 248, 0.1)',
                          color: '#38bdf8',
                          fontSize: '0.65rem',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '999px',
                          fontWeight: 600
                        }}
                      >
                        AI AGENT
                      </span>
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Just now</span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      Automated rule execution moved candidate to {selectedCandidate.appInfo.stage}.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#020617',
                      border: '2px solid #3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#3b82f6'
                      }}
                    ></div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>
                        → APPLIED
                      </span>
                      <span
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: '#fff',
                          fontSize: '0.65rem',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '999px',
                          fontWeight: 600
                        }}
                      >
                        SYSTEM
                      </span>
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Yesterday</span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      Application received and parsed successfully.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interviewer Reviews Hub */}
            <div
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid #1e293b',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                flex: 1
              }}
            >
              <h3 style={{ margin: '0 0 1.5rem 0', color: 'white', fontSize: '1.1rem' }}>
                Interviewer Reviews Hub
              </h3>

              <div style={{ marginBottom: '2rem' }}>
                <textarea
                  value={newReview}
                  onChange={e => setNewReview(e.target.value)}
                  placeholder="Leave internal notes or review feedback..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '0.5rem',
                    color: '#e2e8f0',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                    marginBottom: '1rem',
                    outline: 'none'
                  }}
                  onFocus={e => (e.target.style.borderColor = '#38bdf8')}
                  onBlur={e => (e.target.style.borderColor = '#1e293b')}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleAddReview}
                    style={{
                      background: 'linear-gradient(to right, #22d3ee, #3b82f6)',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1.5rem',
                      borderRadius: '0.5rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)'
                    }}
                  >
                    Submit Review
                  </button>
                </div>
              </div>

              <div>
                {reviews.length === 0 ? (
                  <div
                    style={{
                      color: '#64748b',
                      fontSize: '0.9rem',
                      fontStyle: 'italic',
                      textAlign: 'center',
                      padding: '2rem 0'
                    }}
                  >
                    No interview reviews logged yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reviews.map((rev, i) => (
                      <div
                        key={i}
                        style={{
                          background: '#0f172a',
                          border: '1px solid #1e293b',
                          padding: '1rem',
                          borderRadius: '0.5rem'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem'
                          }}
                        >
                          <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem' }}>
                            {rev.author}
                          </span>
                          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{rev.date}</span>
                        </div>
                        <div style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5 }}>
                          {rev.text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
