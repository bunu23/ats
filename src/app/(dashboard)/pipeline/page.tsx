'use client';
import React, { useState, useEffect } from 'react';
import KanbanBoard from './components/KanbanBoard';
import { PipelineApplication } from './components/KanbanCard';

interface Job {
  id: string;
  title: string;
  status: string;
  custom_stages: string[];
}

export default function Pipeline() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [applications, setApplications] = useState<PipelineApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setJobs(data.data);
        }
      });
  }, []);

  useEffect(() => {
    if (!selectedJobId) return;

    const fetchApps = () => {
      fetch('/api/applications')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            if (selectedJobId === 'all') {
              setApplications(data.data);
            } else {
              setApplications(data.data.filter(a => a.job_id === selectedJobId));
            }
          }
          setLoading(false);
        });
    };

    fetchApps(); // Initial fetch
    const interval = setInterval(fetchApps, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [selectedJobId]);

  const moveApplication = async (id: string, newStage: string) => {
    // Optimistic UI update
    setApplications(prev => prev.map(app => (app.id === id ? { ...app, stage: newStage } : app)));

    // API call
    await fetch(`/api/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage })
    });
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData('appId', id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStage: string) => {
    const id = e.dataTransfer.getData('appId');
    const app = applications.find(a => a.id === id);
    if (!app || app.stage === targetStage) return;

    const activeJob = jobs.find(j => j.id === selectedJobId);
    const DEFAULT_STAGES = [
      'Applied',
      'AI Screening',
      'Phone Screening',
      'Interview',
      'Offer',
      'Background Check',
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

  const updateInterviewDate = async (id: string, dateStr: string) => {
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
    'Offer',
    'Background Check',
    'Hired',
    'Onboarding',
    'Rejected'
  ];
  const STAGES =
    activeJob?.custom_stages && activeJob.custom_stages.length > 0
      ? activeJob.custom_stages
      : DEFAULT_STAGES;

  if (loading) return <div>Loading pipeline...</div>;

  return (
    <div>
      <div
        className="sticky-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
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
          <option value="all" style={{ color: 'black' }}>
            All Positions
          </option>
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
        moveApplication={moveApplication}
      />
    </div>
  );
}
