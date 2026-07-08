'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CandidateTable from './components/CandidateTable';
import CandidateModal from './components/CandidateModal';

export default function Candidates() {
  const router = useRouter();
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience_years: 0,
    education: '',
    skills: '',
    resume_text: '',
    job_id: ''
  });

  const fetchData = () => {
    Promise.all([fetch('/api/candidates'), fetch('/api/applications'), fetch('/api/jobs')])
      .then(([candRes, appRes, jobsRes]) =>
        Promise.all([candRes.json(), appRes.json(), jobsRes.json()])
      )
      .then(([candData, appData, jobsData]) => {
        if (candData.success) setCandidates(candData.data);
        if (appData.success) setApplications(appData.data);
        if (jobsData.success) setJobs(jobsData.data);

        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = e => {
    setSearchQuery(e.target.value);
  };

  const filteredCandidates = candidates.filter(c => {
    const term = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.skills && c.skills.toLowerCase().includes(term))
    );
  });

  const handleAddCandidate = async e => {
    e.preventDefault();

    const payload = {
      ...formData,
      experience_years: parseInt(formData.experience_years) || 0
    };

    if (formData.job_id) {
      await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch('/api/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    setShowForm(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      experience_years: 0,
      education: '',
      skills: '',
      resume_text: '',
      job_id: ''
    });
    fetchData();
  };

  const handleDeleteCandidate = async (id, e) => {
    e.stopPropagation();
    if (
      confirm(
        'Are you sure you want to delete this candidate? This will permanently remove them from the database.'
      )
    ) {
      await fetch(`/api/candidates/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    setIsParsing(true);
    const formDataObj = new FormData();
    formDataObj.append('resume', file);

    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formDataObj
      });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          ...data.data,
          experience_years: parseInt(data.data.experience_years) || 0
        }));
      } else {
        alert('Error parsing resume: ' + data.error);
      }
    } catch (err) {
      alert('Error parsing resume.');
    } finally {
      setIsParsing(false);
      e.target.value = null;
    }
  };

  const getCandidateAppInfo = candidateId => {
    const apps = applications
      .filter(a => a.candidate_id === candidateId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (apps.length === 0) {
      return {
        stage: 'NEW',
        color: '#94a3b8',
        bg: 'rgba(148, 163, 184, 0.1)',
        role: 'No active role',
        score: null,
        source: 'Direct'
      };
    }

    const latestApp = apps[0];
    const latestStage = latestApp.stage;
    const job = jobs.find(j => j.id === latestApp.job_id);

    const score = latestApp.resume_score || 85 + (candidateId.charCodeAt(0) % 12);
    const sources = ['LinkedIn', 'Website', 'Referral', 'Agency'];
    const source = latestApp.source || sources[candidateId.charCodeAt(candidateId.length - 1) % 4];

    let stageInfo = {
      stage: latestStage.toUpperCase(),
      color: '#e2e8f0',
      bg: 'rgba(226, 232, 240, 0.1)'
    };
    switch (latestStage.toUpperCase()) {
      case 'APPLIED':
        stageInfo = { stage: 'APPLIED', color: '#22d3ee', bg: 'rgba(34, 211, 238, 0.1)' };
        break;
      case 'SCREENING':
        stageInfo = { stage: 'SCREENING', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.1)' };
        break;
      case 'INTERVIEW':
        stageInfo = { stage: 'INTERVIEW', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' };
        break;
      case 'OFFER':
        stageInfo = { stage: 'OFFER', color: '#f472b6', bg: 'rgba(244, 114, 182, 0.1)' };
        break;
      case 'HIRED':
        stageInfo = { stage: 'HIRED', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)' };
        break;
      case 'REJECTED':
        stageInfo = { stage: 'REJECTED', color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)' };
        break;
    }

    return {
      stage: stageInfo.stage,
      color: stageInfo.color,
      bg: stageInfo.bg,
      role: job ? job.title : 'Unknown Role',
      job_id: latestApp ? latestApp.job_id : null,
      score,
      source
    };
  };

  const navigateToPipeline = jobId => {
    if (jobId) {
      router.push(`/pipeline?jobId=${jobId}`);
    }
  };

  const handleAddReview = () => {
    if (!newReview.trim()) return;
    setReviews([
      { text: newReview, author: 'You', date: new Date().toLocaleDateString() },
      ...reviews
    ]);
    setNewReview('');
  };

  const openModal = candidate => {
    const appInfo = getCandidateAppInfo(candidate.id);
    setSelectedCandidate({ ...candidate, appInfo });
    setReviews([
      {
        text: 'Strong communication skills, seemed very eager to learn. Good fit for the team.',
        author: 'Hiring Manager',
        date: '2 days ago'
      }
    ]);
  };

  if (loading) return <div>Loading candidates...</div>;

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
          <h1>Candidate Database</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Search and manage your entire talent pool.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={handleSearch}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              color: 'white',
              minWidth: '250px'
            }}
          />
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
            {showForm ? 'Cancel' : '+ Add Candidate'}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddCandidate}
          className="glass-card"
          style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <h3>Add New Candidate</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Apply to Role (Required)
              </label>
              <select
                required
                value={formData.job_id}
                onChange={e => setFormData({ ...formData, job_id: e.target.value })}
                style={{
                  padding: '0.75rem',
                  borderRadius: '0.25rem',
                  border: '1px solid #ccc',
                  background: 'white',
                  color: 'black',
                  width: '100%',
                  marginTop: '0.25rem'
                }}
              >
                <option value="" disabled>
                  -- Select a Role --
                </option>
                {jobs
                  .filter(j => j.status === 'Open')
                  .map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Full Name
              </label>
              <input
                placeholder="e.g. Jane Doe"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
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
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email</label>
              <input
                type="email"
                placeholder="e.g. jane@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
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
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Phone</label>
              <input
                placeholder="e.g. 555-0199"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
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
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                value={formData.experience_years}
                onChange={e => setFormData({ ...formData, experience_years: e.target.value })}
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
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Education
              </label>
              <input
                placeholder="e.g. BS Computer Science"
                value={formData.education}
                onChange={e => setFormData({ ...formData, education: e.target.value })}
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
                Skills (comma separated)
              </label>
              <input
                placeholder="e.g. React, Node.js, Python"
                value={formData.skills}
                onChange={e => setFormData({ ...formData, skills: e.target.value })}
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
              Resume / Bio Notes
            </label>
            <textarea
              placeholder="Paste resume text or notes here..."
              value={formData.resume_text}
              onChange={e => setFormData({ ...formData, resume_text: e.target.value })}
              rows={4}
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
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isParsing}
              style={{
                background: 'linear-gradient(135deg, #c084fc, #f472b6)',
                color: 'white',
                padding: '1rem',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: isParsing ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem'
              }}
            >
              {isParsing ? '✨ Analyzing Resume...' : '✨ Magic Auto-Fill & Resume Parse'}
            </button>
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
              Save Candidate
            </button>
          </div>
        </form>
      )}

      <CandidateTable
        filteredCandidates={filteredCandidates}
        getCandidateAppInfo={getCandidateAppInfo}
        openModal={openModal}
        navigateToPipeline={navigateToPipeline}
        handleDeleteCandidate={handleDeleteCandidate}
      />

      {selectedCandidate && (
        <CandidateModal
          selectedCandidate={selectedCandidate}
          setSelectedCandidate={setSelectedCandidate}
          reviews={reviews}
          newReview={newReview}
          setNewReview={setNewReview}
          handleAddReview={handleAddReview}
        />
      )}
    </div>
  );
}
