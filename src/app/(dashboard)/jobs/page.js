'use client';
import { useState, useEffect } from 'react';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    description: '',
    requirements: '',
    salary_range: '',
    custom_stages: ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected']
  });

  const fetchJobs = () => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setJobs(data.data);
          if (selectedJob) {
            setSelectedJob(data.data.find(j => j.id === selectedJob.id));
          }
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateJob = async e => {
    e.preventDefault();
    await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    setShowForm(false);
    fetchJobs();
  };

  const handleToggleStatus = async () => {
    const newStatus = selectedJob.status === 'Open' ? 'Closed' : 'Open';
    await fetch(`/api/jobs/${selectedJob.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        closed_at: newStatus === 'Closed' ? new Date().toISOString() : null
      })
    });
    setSelectedJob({ ...selectedJob, status: newStatus });
    fetchJobs();
  };

  const filteredJobs = jobs.filter(job => {
    if (statusFilter === 'All') return true;
    return job.status === statusFilter;
  });

  if (loading) return <div>Loading jobs...</div>;

  if (selectedJob) {
    return (
      <div>
        <button
          onClick={() => setSelectedJob(null)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back to Jobs
        </button>

        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <div>
              <h1 style={{ margin: '0 0 0.5rem 0' }}>{selectedJob.title}</h1>
              <div style={{ color: 'var(--text-secondary)' }}>
                {selectedJob.department} • {selectedJob.location} • {selectedJob.type}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span
                style={{
                  background:
                    selectedJob.status === 'Open'
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(239, 68, 68, 0.2)',
                  color: selectedJob.status === 'Open' ? 'var(--success)' : '#ef4444',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                {selectedJob.status}
              </span>
              <button
                onClick={handleToggleStatus}
                style={{
                  background: 'transparent',
                  color: selectedJob.status === 'Open' ? '#ef4444' : 'var(--success)',
                  border: `1px solid ${selectedJob.status === 'Open' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.5)'}`,
                  padding: '0.4rem 1rem',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {selectedJob.status === 'Open' ? 'Close Job' : 'Reopen Job'}
              </button>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Description</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{selectedJob.description}</p>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Requirements</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{selectedJob.requirements}</p>
          </div>

          {selectedJob.salary_range && (
            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Salary</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{selectedJob.salary_range}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className="sticky-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <div>
          <h1>Job Postings</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Manage your active job listings and requirements.
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Filter:</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '0.25rem',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)',
                outline: 'none'
              }}
            >
              <option value="All">All Positions</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {showForm ? 'Cancel' : '+ Create New Job'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateJob}
          className="glass-card"
          style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <h3>Create New Job</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Job Title
              </label>
              <input
                placeholder="e.g. Senior Frontend Developer"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.25rem',
                  border: '1px solid #ccc',
                  background: 'white',
                  color: 'black',
                  width: '100%',
                  marginTop: '0.25rem'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Department
              </label>
              <input
                placeholder="e.g. Engineering"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                required
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.25rem',
                  border: '1px solid #ccc',
                  background: 'white',
                  color: 'black',
                  width: '100%',
                  marginTop: '0.25rem'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Location
              </label>
              <input
                placeholder="e.g. Remote, New York"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                required
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.25rem',
                  border: '1px solid #ccc',
                  background: 'white',
                  color: 'black',
                  width: '100%',
                  marginTop: '0.25rem'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Salary Range
              </label>
              <input
                placeholder="e.g. $130,000 - $160,000"
                value={formData.salary_range}
                onChange={e => setFormData({ ...formData, salary_range: e.target.value })}
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.25rem',
                  border: '1px solid #ccc',
                  background: 'white',
                  color: 'black',
                  width: '100%',
                  marginTop: '0.25rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Job Description
            </label>
            <textarea
              placeholder="Describe the role..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              style={{
                padding: '0.75rem',
                borderRadius: '0.25rem',
                border: '1px solid #ccc',
                background: 'white',
                color: 'black',
                width: '100%',
                marginTop: '0.25rem'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Requirements
            </label>
            <textarea
              placeholder="e.g. React, Next.js, 5+ years experience"
              value={formData.requirements}
              onChange={e => setFormData({ ...formData, requirements: e.target.value })}
              required
              rows={2}
              style={{
                padding: '0.75rem',
                borderRadius: '0.25rem',
                border: '1px solid #ccc',
                background: 'white',
                color: 'black',
                width: '100%',
                marginTop: '0.25rem'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              background: 'var(--success)',
              color: 'white',
              padding: '1rem',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            Save Job
          </button>
        </form>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {filteredJobs.map(job => (
          <div
            key={job.id}
            className="glass-card"
            onClick={() => setSelectedJob(job)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'transform 0.2s, background 0.2s'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem' }}>{job.title}</h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {job.department} • {job.location} • {job.type}
                </div>
              </div>
              <span
                style={{
                  background:
                    job.status === 'Open' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: job.status === 'Open' ? 'var(--success)' : '#ef4444',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                {job.status}
              </span>
            </div>

            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                flexGrow: 1,
                marginBottom: '1.5rem',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {job.description}
            </p>

            {job.salary_range && (
              <div
                style={{
                  marginTop: 'auto',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <span>{job.salary_range}</span>
                {job.status === 'Closed' && job.closed_at && (
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Closed {new Date(job.closed_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
        {filteredJobs.length === 0 && (
          <div style={{ color: 'var(--text-secondary)' }}>No jobs found.</div>
        )}
      </div>
    </div>
  );
}
