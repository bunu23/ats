'use client';
import { useState, useEffect } from 'react';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('automated');

  const fetchSettings = () => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSettings(data.data);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  const updateTemplate = (key, field, value) => {
    setSettings(prev => ({
      ...prev,
      email_templates: {
        ...prev.email_templates,
        [key]: {
          ...prev.email_templates[key],
          [field]: value
        }
      }
    }));
  };

  const updateRecruiterSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      recruiter_settings: {
        ...prev.recruiter_settings,
        [key]: value
      }
    }));
  };

  if (loading) return <div>Loading settings...</div>;
  if (!settings) return <div>Failed to load settings.</div>;

  const TEMPLATES = [
    {
      key: 'instant_confirmation',
      title: 'Phase 1: Instant Confirmation',
      desc: 'Sent when candidate applies.',
      vars: '{{candidate_name}}, {{job_title}}'
    },
    {
      key: 'ai_screening_invite',
      title: 'Phase 2: AI Screening Invite',
      desc: 'Sent when moved to AI Screening.',
      vars: '{{candidate_name}}, {{job_title}}'
    },
    {
      key: 'phone_screening_invite',
      title: 'Phase 3: Phone Screening Invite',
      desc: 'Sent when moved to Phone Screening.',
      vars: '{{candidate_name}}, {{calendly_link}}'
    },
    {
      key: 'interview_invite',
      title: 'Phase 4: Interview Invite',
      desc: 'Sent when moved to Interview.',
      vars: '{{candidate_name}}, {{calendly_link}}'
    },
    {
      key: 'candidate_reminder_24h',
      title: 'Candidate 24h Reminder',
      desc: 'Sent 24 hours before interview.',
      vars: '{{candidate_name}}, {{interview_time}}'
    },
    {
      key: 'candidate_reminder_12h',
      title: 'Candidate 12h Reminder',
      desc: 'Sent 12 hours before interview.',
      vars: '{{candidate_name}}, {{interview_time}}'
    },
    {
      key: 'recruiter_reminder_24h',
      title: 'Recruiter 24h Reminder',
      desc: 'Sent to recruiter 24h before interview.',
      vars: '{{candidate_name}}, {{interview_time}}'
    },
    {
      key: 'background_check',
      title: 'Phase 5: Background Check',
      desc: 'Sent when moved to Background Check.',
      vars: '{{candidate_name}}'
    },
    {
      key: 'hired_notice',
      title: 'Phase 7: Hired',
      desc: 'Sent when candidate is moved to Hired.',
      vars: '{{candidate_name}}'
    },
    {
      key: 'onboarding_welcome',
      title: 'Phase 8: Onboarding',
      desc: 'Sent when candidate is moved to Onboarding.',
      vars: '{{candidate_name}}'
    },
    {
      key: 'polite_archive',
      title: 'Standard Rejection',
      desc: 'Sent when manually rejected.',
      vars: '{{candidate_name}}, {{job_title}}',
      isManual: true
    },
    {
      key: 'delayed_rejection',
      title: 'Guardrail: Delayed Rejection',
      desc: 'Sent 48h later if AI score is poor.',
      vars: '{{candidate_name}}, {{job_title}}'
    }
  ];

  const automatedTemplates = TEMPLATES.filter(t => !t.isManual);
  const manualTemplates = TEMPLATES.filter(t => t.isManual);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem'
        }}
      >
        <div>
          <h1>Email Templates</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Customize your recruiter profile and email templates.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: 'var(--success)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
            transition: 'opacity 0.2s'
          }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '2rem',
            borderRadius: '0.5rem',
            background:
              message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: message.type === 'success' ? 'var(--success)' : '#ef4444'
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
          Select Category to Edit:
        </label>
        <select
          value={activeTab}
          onChange={e => setActiveTab(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            fontSize: '1rem',
            appearance: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="automated" style={{ color: 'black' }}>
            Automated Templates
          </option>
          <option value="manual" style={{ color: 'black' }}>
            Manual Templates
          </option>
          <option value="recruiter" style={{ color: 'black' }}>
            Recruiter Profile (Calendly Link)
          </option>
        </select>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Recruiter Settings */}
        {activeTab === 'recruiter' && (
          <section>
            <h2
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: '0.5rem',
                marginBottom: '1.5rem'
              }}
            >
              Recruiter Profile
            </h2>
            <div className="glass-card">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Your Calendly Link (or equivalent)
              </label>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  marginBottom: '1rem'
                }}
              >
                Used in the Phone Screening and Interview templates. Variable: `
                {'{{calendly_link}}'}`
              </p>
              <input
                type="text"
                value={settings.recruiter_settings?.calendly_link || ''}
                onChange={e => updateRecruiterSetting('calendly_link', e.target.value)}
                placeholder="https://calendly.com/your-name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white'
                }}
              />
            </div>
          </section>
        )}

        {/* Automated Templates */}
        {activeTab === 'automated' && (
          <section>
            <h2
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: '0.5rem',
                marginBottom: '1.5rem'
              }}
            >
              Automated Templates
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {automatedTemplates.map(tpl => (
                <div key={tpl.key} className="glass-card">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem'
                    }}
                  >
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0' }}>{tpl.title}</h3>
                      <p
                        style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}
                      >
                        {tpl.desc}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        background: 'rgba(255,255,255,0.1)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem'
                      }}
                    >
                      Variables: {tpl.vars}
                    </span>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.25rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={settings.email_templates[tpl.key]?.subject || ''}
                      onChange={e => updateTemplate(tpl.key, 'subject', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white'
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.25rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Email Body
                    </label>
                    <textarea
                      value={settings.email_templates[tpl.key]?.body || ''}
                      onChange={e => updateTemplate(tpl.key, 'body', e.target.value)}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        resize: 'vertical',
                        lineHeight: 1.5
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Manual Templates */}
        {activeTab === 'manual' && (
          <section>
            <h2
              style={{
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: '0.5rem',
                marginBottom: '1.5rem'
              }}
            >
              Manual Templates
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {manualTemplates.map(tpl => (
                <div key={tpl.key} className="glass-card">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem'
                    }}
                  >
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0' }}>{tpl.title}</h3>
                      <p
                        style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}
                      >
                        {tpl.desc}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        background: 'rgba(255,255,255,0.1)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem'
                      }}
                    >
                      Variables: {tpl.vars}
                    </span>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.25rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={settings.email_templates[tpl.key]?.subject || ''}
                      onChange={e => updateTemplate(tpl.key, 'subject', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white'
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        marginBottom: '0.25rem',
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Email Body
                    </label>
                    <textarea
                      value={settings.email_templates[tpl.key]?.body || ''}
                      onChange={e => updateTemplate(tpl.key, 'body', e.target.value)}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white',
                        resize: 'vertical',
                        lineHeight: 1.5
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </form>
    </div>
  );
}
