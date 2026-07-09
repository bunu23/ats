import './globals.css';

export const metadata = {
  title: 'ATS | AI-Powered Applicant Tracking',
  description: 'A generic, industry-agnostic Applicant Tracking System powered by AI.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
