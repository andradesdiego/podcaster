import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', marginTop: '10vh' }}>
      <h1>Page Not Found</h1>
      <div style={{ marginTop: '2rem' }}>
        <Link
          to="/"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
