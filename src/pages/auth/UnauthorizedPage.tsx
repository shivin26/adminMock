import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button/Button';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        padding: '1.5rem',
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '2.5rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--accent-danger-light)',
            color: 'var(--accent-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <ShieldAlert size={36} />
        </div>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--text-primary)' }}>
          403 Access Denied
        </h2>
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-muted)',
            marginTop: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          You do not have the required enterprise administrator permissions to access this page.
        </p>
        <Button leftIcon={<ArrowLeft size={16} />} onClick={() => navigate('/dashboard/overview')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};
