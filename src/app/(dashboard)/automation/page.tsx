'use client';
import { useState, useEffect } from 'react';

export default function Automation() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/automation')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRules(data.data);
        }
        setLoading(false);
      });
  }, []);

  const toggleRule = async (id, currentStatus) => {
    const newStatus = !currentStatus;

    // Optimistic update
    setRules(prev => prev.map(rule => (rule.id === id ? { ...rule, enabled: newStatus } : rule)));

    // API call
    await fetch(`/api/automation/\${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: newStatus })
    });
  };

  if (loading) return <div>Loading rules...</div>;

  return (
    <div>
      <div className="sticky-header">
        <h1 style={{ marginBottom: '0.5rem' }}>Automation Rules</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Configure how the ATS automates your recruitment workflows using AI and event triggers.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {rules.map(rule => (
          <div
            key={rule.id}
            className="glass-card"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                {rule.name}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>{rule.description}</div>
              <div
                style={{ marginTop: '0.5rem', fontSize: '0.75rem', display: 'flex', gap: '1rem' }}
              >
                <span style={{ color: 'var(--accent-primary)' }}>Trigger: {rule.trigger_type}</span>
                <span style={{ color: 'var(--success)' }}>Action: {rule.action_type}</span>
              </div>
            </div>

            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={rule.enabled}
                onChange={() => toggleRule(rule.id, rule.enabled)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        ))}
        {rules.length === 0 && <div>No automation rules found. Run seed script first.</div>}
      </div>
    </div>
  );
}
