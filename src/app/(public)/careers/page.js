'use client';
import { useState, useEffect } from 'react';

export default function Careers() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience_years: '',
    education: '',
    skills: '',
    resume_text: ''
  });

  const fetchJobs = () => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Only show Open jobs on the careers page
          setJobs(data.data.filter(j => j.status === 'Open'));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApplyClick = job => {
    setSelectedJob(job);
    setSuccess(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      experience_years: '',
      education: '',
      skills: '',
      resume_text: ''
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          job_id: selectedJob.id,
          experience_years: parseInt(formData.experience_years) || 0
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        alert('Failed to submit application: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Network error submitting application.');
    }

    setIsSubmitting(false);
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
      const result = await res.json();

      if (result.success) {
        setFormData(result.data);
      } else {
        alert('Failed to parse resume: ' + result.error);
      }
    } catch (err) {
      alert('Error parsing resume.');
    }

    setIsParsing(false);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#020617',
          color: 'white'
        }}
      >
        Loading open positions...
      </div>
    );
  }

  return (
    <div
      style={{ minHeight: '100vh', background: '#020617', color: 'white', padding: '4rem 2rem' }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              background: 'rgba(34, 211, 238, 0.1)',
              color: '#22d3ee',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: 600,
              marginBottom: '1rem',
              border: '1px solid rgba(34, 211, 238, 0.2)'
            }}
          >
            We&apos;re Hiring
          </div>
          <h1
            style={{
              fontSize: '3.5rem',
              fontWeight: 800,
              margin: '0 0 1rem 0',
              background: 'linear-gradient(to right, #fff, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Join Our Team
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
            Build the future with us. We&apos;re looking for passionate individuals to join our
            fast-growing, innovative team.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {jobs.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem',
                background: '#0f172a',
                borderRadius: '1rem',
                border: '1px solid #1e293b'
              }}
            >
              <h3 style={{ color: '#e2e8f0', margin: 0 }}>No open positions right now.</h3>
              <p style={{ color: '#64748b' }}>Please check back later!</p>
            </div>
          ) : (
            jobs.map(job => (
              <div
                key={job.id}
                style={{
                  background: '#0f172a',
                  borderRadius: '1rem',
                  padding: '2rem',
                  border: '1px solid #1e293b',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.5)';
                  e.currentTarget.style.borderColor = '#334155';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = '#1e293b';
                }}
              >
                <div>
                  <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#f8fafc' }}>
                    {job.title}
                  </h2>
                  <div
                    style={{ display: 'flex', gap: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      🏢 {job.department}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      📍 {job.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      ⏱️ {job.type}
                    </span>
                    {job.salary_range && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        💰 {job.salary_range}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleApplyClick(job)}
                  style={{
                    background: 'linear-gradient(to right, #22d3ee, #3b82f6)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 2rem',
                    borderRadius: '9999px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseOver={e => (e.currentTarget.style.opacity = 0.9)}
                  onMouseOut={e => (e.currentTarget.style.opacity = 1)}
                >
                  Apply Now
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Application Modal */}
      {selectedJob && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(2, 6, 23, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '600px',
              background: '#0f172a',
              height: '100%',
              borderLeft: '1px solid #1e293b',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            <div
              style={{
                padding: '2rem',
                borderBottom: '1px solid #1e293b',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: '#38bdf8',
                    fontWeight: 600,
                    marginBottom: '0.25rem'
                  }}
                >
                  Applying for
                </div>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#f8fafc' }}>
                  {selectedJob.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
              {success ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      background: 'rgba(74, 222, 128, 0.1)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 2rem auto'
                    }}
                  >
                    <span style={{ fontSize: '3rem' }}>🎉</span>
                  </div>
                  <h2 style={{ color: '#f8fafc', marginBottom: '1rem' }}>Application Submitted!</h2>
                  <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>
                    Thank you for applying to the <strong>{selectedJob.title}</strong> role. Our
                    team (and AI engine) will review your application shortly. Keep an eye on your
                    inbox!
                  </p>
                  <button
                    onClick={() => setSelectedJob(null)}
                    style={{
                      marginTop: '2rem',
                      background: '#1e293b',
                      color: 'white',
                      border: '1px solid #334155',
                      padding: '0.75rem 2rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Back to Jobs
                  </button>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      marginBottom: '2rem',
                      padding: '1.5rem',
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px dashed #38bdf8',
                      borderRadius: '0.5rem',
                      textAlign: 'center'
                    }}
                  >
                    <h3 style={{ color: '#38bdf8', marginTop: 0, marginBottom: '0.5rem' }}>
                      ✨ Magic Auto-Fill
                    </h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1rem' }}>
                      Upload your resume and our AI will instantly populate your application.
                    </p>

                    {isParsing ? (
                      <div style={{ color: '#38bdf8', fontWeight: 600 }}>
                        🤖 AI is extracting your profile...
                      </div>
                    ) : (
                      <label
                        style={{
                          cursor: 'pointer',
                          display: 'inline-block',
                          background: '#38bdf8',
                          color: '#0f172a',
                          fontWeight: 600,
                          padding: '0.5rem 1.5rem',
                          borderRadius: '9999px',
                          transition: 'opacity 0.2s'
                        }}
                      >
                        Upload Resume (PDF/DOC)
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          style={{ display: 'none' }}
                          onChange={handleFileUpload}
                        />
                      </label>
                    )}
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            color: '#cbd5e1',
                            marginBottom: '0.5rem',
                            fontWeight: 500
                          }}
                        >
                          Full Name *
                        </label>
                        <input
                          required
                          type="text"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            background: '#020617',
                            border: '1px solid #1e293b',
                            borderRadius: '0.5rem',
                            color: 'white',
                            outline: 'none'
                          }}
                          onFocus={e => (e.target.style.borderColor = '#38bdf8')}
                          onBlur={e => (e.target.style.borderColor = '#1e293b')}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            color: '#cbd5e1',
                            marginBottom: '0.5rem',
                            fontWeight: 500
                          }}
                        >
                          Email Address *
                        </label>
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            background: '#020617',
                            border: '1px solid #1e293b',
                            borderRadius: '0.5rem',
                            color: 'white',
                            outline: 'none'
                          }}
                          onFocus={e => (e.target.style.borderColor = '#38bdf8')}
                          onBlur={e => (e.target.style.borderColor = '#1e293b')}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            color: '#cbd5e1',
                            marginBottom: '0.5rem',
                            fontWeight: 500
                          }}
                        >
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            background: '#020617',
                            border: '1px solid #1e293b',
                            borderRadius: '0.5rem',
                            color: 'white',
                            outline: 'none'
                          }}
                          onFocus={e => (e.target.style.borderColor = '#38bdf8')}
                          onBlur={e => (e.target.style.borderColor = '#1e293b')}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: '0.875rem',
                            color: '#cbd5e1',
                            marginBottom: '0.5rem',
                            fontWeight: 500
                          }}
                        >
                          Years of Experience *
                        </label>
                        <input
                          required
                          type="number"
                          min="0"
                          value={formData.experience_years}
                          onChange={e =>
                            setFormData({ ...formData, experience_years: e.target.value })
                          }
                          style={{
                            width: '100%',
                            padding: '0.75rem 1rem',
                            background: '#020617',
                            border: '1px solid #1e293b',
                            borderRadius: '0.5rem',
                            color: 'white',
                            outline: 'none'
                          }}
                          onFocus={e => (e.target.style.borderColor = '#38bdf8')}
                          onBlur={e => (e.target.style.borderColor = '#1e293b')}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          color: '#cbd5e1',
                          marginBottom: '0.5rem',
                          fontWeight: 500
                        }}
                      >
                        Education
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. BS Computer Science"
                        value={formData.education}
                        onChange={e => setFormData({ ...formData, education: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: '#020617',
                          border: '1px solid #1e293b',
                          borderRadius: '0.5rem',
                          color: 'white',
                          outline: 'none'
                        }}
                        onFocus={e => (e.target.style.borderColor = '#38bdf8')}
                        onBlur={e => (e.target.style.borderColor = '#1e293b')}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          color: '#cbd5e1',
                          marginBottom: '0.5rem',
                          fontWeight: 500
                        }}
                      >
                        Key Skills (Comma Separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. React, Node, Python"
                        value={formData.skills}
                        onChange={e => setFormData({ ...formData, skills: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: '#020617',
                          border: '1px solid #1e293b',
                          borderRadius: '0.5rem',
                          color: 'white',
                          outline: 'none'
                        }}
                        onFocus={e => (e.target.style.borderColor = '#38bdf8')}
                        onBlur={e => (e.target.style.borderColor = '#1e293b')}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.875rem',
                          color: '#cbd5e1',
                          marginBottom: '0.5rem',
                          fontWeight: 500
                        }}
                      >
                        Resume / Cover Letter *
                      </label>
                      <textarea
                        required
                        placeholder="Paste your resume text here..."
                        rows={8}
                        value={formData.resume_text}
                        onChange={e => setFormData({ ...formData, resume_text: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '1rem',
                          background: '#020617',
                          border: '1px solid #1e293b',
                          borderRadius: '0.5rem',
                          color: 'white',
                          outline: 'none',
                          resize: 'vertical'
                        }}
                        onFocus={e => (e.target.style.borderColor = '#38bdf8')}
                        onBlur={e => (e.target.style.borderColor = '#1e293b')}
                      />
                    </div>

                    <div
                      style={{
                        marginTop: '1rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid #1e293b',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '1rem'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedJob(null)}
                        style={{
                          background: 'transparent',
                          color: '#94a3b8',
                          border: '1px solid #1e293b',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '0.5rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                          background: 'linear-gradient(to right, #22d3ee, #3b82f6)',
                          color: 'white',
                          border: 'none',
                          padding: '0.75rem 2rem',
                          borderRadius: '0.5rem',
                          fontWeight: 600,
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          opacity: isSubmitting ? 0.7 : 1
                        }}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `
        }}
      />
    </div>
  );
}
