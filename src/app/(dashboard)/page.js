'use client';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('all');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      // Fetch global stats
      fetch('/api/dashboard')
        .then(res => res.json())
        .then(data => {
          if (data.success) setStats(data.data);
        });

      // Fetch jobs for dropdown
      fetch('/api/jobs')
        .then(res => res.json())
        .then(data => {
          if (data.success) setJobs(data.data);
        });

      // Fetch applications for funnel
      fetch('/api/applications')
        .then(res => res.json())
        .then(data => {
          if (data.success) setApplications(data.data);
          setLoading(false);
        });
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) return <div>Loading dashboard...</div>;

  const activeJob = selectedJobId !== 'all' ? jobs.find(j => j.id === selectedJobId) : null;
  const filteredApps = activeJob
    ? applications.filter(a => a.job_id === activeJob.id)
    : applications;
  const STAGES = activeJob
    ? activeJob.custom_stages || []
    : ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

  // Funnel calculations
  const stageCounts = STAGES.reduce((acc, stage) => {
    acc[stage] = filteredApps.filter(a => a.stage === stage).length;
    return acc;
  }, {});

  const totalFilteredApps = filteredApps.length;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}
      >
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Overview of recruitment operations</p>
        </div>
        <select
          value={selectedJobId}
          onChange={e => setSelectedJobId(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            color: 'white',
            minWidth: '250px'
          }}
        >
          <option value="all" style={{ color: 'black' }}>
            All Jobs (Global Overview)
          </option>
          {jobs.map(job => (
            <option key={job.id} value={job.id} style={{ color: 'black' }}>
              {job.title} ({job.status})
            </option>
          ))}
        </select>
      </div>

      <div className="stats-grid">
        <div className="glass-card">
          <div className="stat-label">Open Jobs</div>
          <div className="stat-value">{stats.openJobs}</div>
        </div>
        <div className="glass-card">
          <div className="stat-label">Total Candidates</div>
          <div className="stat-value">
            {activeJob ? filteredApps.length : stats.totalCandidates}
          </div>
        </div>
        <div className="glass-card">
          <div className="stat-label">Active in Pipeline</div>
          <div className="stat-value">
            {filteredApps.filter(a => a.stage !== 'Hired' && a.stage !== 'Rejected').length}
          </div>
        </div>
        <div className="glass-card">
          <div className="stat-label">Hired</div>
          <div className="stat-value">{filteredApps.filter(a => a.stage === 'Hired').length}</div>
        </div>
      </div>

      <h2 style={{ marginTop: '3rem' }}>
        Pipeline Distribution {activeJob ? `(${activeJob.title})` : '(Default Stages)'}
      </h2>
      <div className="glass-card" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {STAGES.map((stage, index) => {
            const count = stageCounts[stage] || 0;
            const percentage =
              totalFilteredApps === 0 ? 0 : Math.round((count / totalFilteredApps) * 100);

            // Generate a distinct color for each bar
            const colors = [
              '#3b82f6',
              '#8b5cf6',
              '#ec4899',
              '#f43f5e',
              '#f97316',
              '#eab308',
              '#22c55e',
              '#14b8a6'
            ];
            const barColor = colors[index % colors.length];

            return (
              <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '120px',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    textAlign: 'right'
                  }}
                >
                  {stage}
                </div>
                <div
                  style={{
                    flexGrow: 1,
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '9999px',
                    height: '24px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      background: barColor,
                      height: '100%',
                      borderRadius: '9999px',
                      transition: 'width 0.5s ease-in-out'
                    }}
                  />
                </div>
                <div style={{ width: '60px', fontSize: '0.875rem', fontWeight: 600 }}>
                  {count}{' '}
                  <span
                    style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 400 }}
                  >
                    ({percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <h2>Recent Activity (Global)</h2>
      <div className="glass-card">
        <div className="activity-list">
          {stats.recentActivity.slice(0, 5).map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                {activity.type === 'email_sent'
                  ? '✉️'
                  : activity.type === 'ai_scoring'
                    ? '🤖'
                    : '🔄'}
              </div>
              <div className="activity-content">
                <div className="activity-title">{activity.title}</div>
                <div className="activity-desc">
                  {activity.description?.substring(0, 150)}
                  {activity.description?.length > 150 ? '...' : ''}
                </div>
                <div className="activity-meta">
                  {new Date(activity.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          {stats.recentActivity.length === 0 && (
            <div style={{ color: 'var(--text-secondary)' }}>No recent activity.</div>
          )}
        </div>
      </div>
    </div>
  );
}
