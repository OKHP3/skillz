import React from 'react';
import { useTheme, type ThemeMode } from '../../contexts/ThemeContext';

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

const OPTIONS: { value: ThemeMode; label: string; Icon: () => React.ReactElement }[] = [
  { value: 'light', label: 'Light mode', Icon: SunIcon },
  { value: 'system', label: 'System preference', Icon: MonitorIcon },
  { value: 'dark', label: 'Dark mode', Icon: MoonIcon },
];

export default function ThemeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <div
      role="group"
      aria-label="Color theme"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-dark)',
        borderRadius: '3px',
        padding: '2px',
        flexShrink: 0,
      }}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            onClick={() => setMode(value)}
            aria-label={label}
            aria-pressed={active}
            title={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '26px',
              height: '22px',
              borderRadius: '2px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background var(--transition), color var(--transition)',
              background: active ? 'var(--color-copper)' : 'transparent',
              color: active ? 'var(--color-bg)' : 'var(--color-text-muted-dark)',
            }}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}
