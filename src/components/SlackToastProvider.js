'use client';
import { useState, useEffect } from 'react';

export default function SlackToastProvider() {
  const [lastActivityId, setLastActivityId] = useState(null);
  const [toasts, setToasts] = useState([]);

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
            let newLogs = [];
            if (!lastActivityId) {
              // Initial load - don't show old toasts, just set the baseline
              setLastActivityId(notifyLogs[0].id);
              return;
            } else {
              const lastIdx = notifyLogs.findIndex(l => l.id === lastActivityId);
              if (lastIdx === -1) {
                // Baseline not found in this batch (too many new logs or deleted), fallback to latest 3
                newLogs = notifyLogs.slice(0, 3).reverse();
              } else if (lastIdx > 0) {
                // There are new logs
                newLogs = notifyLogs.slice(0, lastIdx).reverse();
              }
            }

            if (newLogs.length > 0) {
              setToasts(prev => [...prev, ...newLogs]);
              setLastActivityId(notifyLogs[0].id);

              // Set a timeout to remove each log after 8 seconds
              newLogs.forEach(log => {
                setTimeout(() => {
                  setToasts(current => current.filter(t => t.id !== log.id));
                }, 8000);
              });
            }
          }
        }
      } catch (err) {
        console.error('ToastProvider failed to fetch', err);
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 3000);
    return () => clearInterval(interval);
  }, [lastActivityId]);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 9999,
        maxWidth: '350px'
      }}
    >
      {toasts.map(toast => {
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
            key={toast.id}
            style={{
              background: bgColor,
              color: 'white',
              padding: '1.25rem',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
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
      })}
    </div>
  );
}
