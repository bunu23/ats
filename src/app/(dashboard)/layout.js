import Link from 'next/link';
import SlackToastProvider from '../../components/SlackToastProvider';

export default function DashboardLayout({ children }) {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div>
          <div className="sidebar-title">ATS Portal</div>
          <nav>
            <Link href="/" className="nav-link">
              Dashboard
            </Link>
            <Link href="/pipeline" className="nav-link">
              Pipeline
            </Link>
            <Link href="/jobs" className="nav-link">
              Jobs
            </Link>
            <Link href="/candidates" className="nav-link">
              Candidates
            </Link>
            <Link href="/activity" className="nav-link">
              Activity & Emails
            </Link>
            <Link href="/automation" className="nav-link">
              Automation Rules
            </Link>
            <Link href="/settings" className="nav-link">
              Email Templates
            </Link>
          </nav>
        </div>

        <div
          style={{
            marginTop: 'auto',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <a
            href="/api/auth/logout"
            style={{
              display: 'block',
              padding: '0.75rem 1rem',
              color: '#f87171',
              textDecoration: 'none',
              borderRadius: '0.5rem',
              fontWeight: 500,
              transition: 'background 0.2s'
            }}
          >
            Sign Out
          </a>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
