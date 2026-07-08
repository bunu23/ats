'use client';
import { useState, useEffect } from 'react';

export default function SlackToastProvider() {
  const [lastActivityId, setLastActivityId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch(`/api/activity?t=${Date.now()}`);
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          const notifyLogs = data.data.filter(
            log =>
              log.type === 'slack_notification' ||
              log.type === 'email_sent' ||
              log.type === 'notification'
          );
          if (notifyLogs.length > 0) {
            // Prioritize specific high-visibility logs if multiple exist in the recent batch
            const recentLogs = notifyLogs.slice(0, 3);
            const priorityLog = recentLogs.find(
              l => l.type === 'slack_notification' || l.type === 'email_sent'
            );
            const latest = priorityLog || notifyLogs[0];

            if (lastActivityId && latest.id !== lastActivityId) {
              setToast(latest);
              setTimeout(() => setToast(null), 8000); // 8 seconds display
            }
            if (!lastActivityId || latest.id !== lastActivityId) {
              setLastActivityId(latest.id);
            }
          }
        }
      } catch (err) {
        console.error('ToastProvider failed to fetch', err);
      }
    };

    // Initial fetch to set the baseline ID
    fetchLatest();

    // Poll every 3 seconds
    const interval = setInterval(fetchLatest, 3000);
    return () => clearInterval(interval);
  }, [lastActivityId]);

  if (!toast) return null;

  const isSlack = toast.type === 'slack_notification';
  const isEmail = toast.type === 'email_sent';
  const isAlert = toast.type === 'notification';

  const bgColor = isSlack ? '#4a154b' : isEmail ? '#0284c7' : isAlert ? '#ef4444' : '#0ea5e9';
  const icon = isSlack ? (
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg"
      alt="Slack"
      style={{
        width: '20px',
        height: '20px',
        marginRight: '8px',
        filter: 'brightness(0) invert(1)'
      }}
    />
  ) : isEmail ? (
    <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>✉️</span>
  ) : isAlert ? (
    <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🚨</span>
  ) : (
    <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>🔄</span>
  );

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        background: bgColor,
        color: 'white',
        padding: '1.25rem',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        zIndex: 9999,
        maxWidth: '350px',
        animation: 'slideIn 0.3s ease-out forwards',
        border: '1px solid rgba(255,255,255,0.2)'
      }}
    >
      <div
        style={{
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          marginBottom: '8px',
          fontSize: '1rem'
        }}
      >
        {icon}
        {toast.title}
      </div>
      <div style={{ fontSize: '0.875rem', lineHeight: '1.5', opacity: 0.9 }}>
        {toast.description}
      </div>
    </div>
  );
}
