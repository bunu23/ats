'use client';
import { useState, useEffect } from 'react';
import KanbanBoard from '../../../components/pipeline/KanbanBoard';

export default function Pipeline() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setJobs(data.data);
          setSelectedJobId(data.data[0].id);
        }
      });
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;
    fetch('/api/applications')
      .then(res => res.json())
      .then(data => {
        setLoading(true);
        if (data.success) {
          setApplications(data.data.filter(a => a.job_id === selectedJobId));
        }
        setLoading(false);
      });
  }, [selectedJobId]);

  const moveApplication = async (id, newStage) => {
    // Optimistic UI update
    setApplications(prev => prev.map(app => (app.id === id ? { ...app, stage: newStage } : app)));

    // API call
    await fetch(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage })
    });
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('appId', id);
  };

  const handleDragOver = e => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStage) => {
    const id = e.dataTransfer.getData('appId');
    const app = applications.find(a => a.id === id);
    if (!app || app.stage === targetStage) return;

    const activeJob = jobs.find(j => j.id === selectedJobId);
    const DEFAULT_STAGES = [
      'Applied',
      'AI Screening',
      'Phone Screening',
      'Interview',
      'Background Check',
      'Offer',
      'Hired',
      'Onboarding',
      'Rejected'
    ];
    const stages = activeJob?.custom_stages?.length > 0 ? activeJob.custom_stages : DEFAULT_STAGES;

    const currentIndex = stages.indexOf(app.stage);
    const targetIndex = stages.indexOf(targetStage);

    // Allow moving to "Rejected" from anywhere
    if (targetStage === 'Rejected') {
      moveApplication(id, targetStage);
      return;
    }

    // Block backwards movement
    if (targetIndex < currentIndex) {
      alert('Candidates cannot be moved backwards in the pipeline.');
      return;
    }

    moveApplication(id, targetStage);
  };

  const updateInterviewDate = async (id, dateStr) => {
    // Optimistic UI update
    setApplications(prev =>
      prev.map(app => (app.id === id ? { ...app, interview_date: dateStr } : app))
    );

    // API call
    await fetch(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interview_date: dateStr })
    });
  };

  const activeJob = jobs.find(j => j.id === selectedJobId);
  const DEFAULT_STAGES = [
    'Applied',
    'AI Screening',
    'Phone Screening',
    'Interview',
    'Background Check',
    'Offer',
    'Hired',
    'Onboarding',
    'Rejected'
  ];
  const STAGES =
    activeJob?.custom_stages && activeJob.custom_stages.length > 0
      ? activeJob.custom_stages
      : DEFAULT_STAGES;

  if (!activeJob) return <div>Loading pipeline...</div>;

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
          <h1>Pipeline</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Drag and drop candidates between stages. Set interview dates to trigger automated
            reminders.
          </p>
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
          {jobs.map(job => (
            <option key={job.id} value={job.id} style={{ color: 'black' }}>
              {job.title} ({job.status})
            </option>
          ))}
        </select>
      </div>

      <KanbanBoard
        stages={STAGES}
        applications={applications}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        handleDragStart={handleDragStart}
        updateInterviewDate={updateInterviewDate}
      />
    </div>
  );
}
