'use client';

const DEPT_COLORS = [
  '#5B9A65', '#4A9FD9', '#E8A830', '#D95B5B', '#9B6BB5',
  '#4ABDA8', '#8B6B4A', '#E07D5A', '#6B8E5A', '#7A8BA8',
];

// Two orbital rings of particles
const INNER_PARTICLES = 6;
const OUTER_PARTICLES = 8;

export default function BrainLoader() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="relative h-[160px] w-[160px]">
        {/* Expanding neural pulse rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="neural-ring absolute h-16 w-16 rounded-full border border-leaf/30" />
          <span className="neural-ring animation-delay-700 absolute h-16 w-16 rounded-full border border-leaf/20" />
          <span className="neural-ring animation-delay-1400 absolute h-16 w-16 rounded-full border border-leaf/10" />
        </div>

        {/* Inner orbital ring */}
        <div className="orbit-ring absolute inset-0">
          {Array.from({ length: INNER_PARTICLES }).map((_, i) => {
            const angle = (360 / INNER_PARTICLES) * i;
            const color = DEPT_COLORS[i % DEPT_COLORS.length];
            return (
              <span
                key={`inner-${i}`}
                className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 6px ${color}80`,
                  transform: `rotate(${angle}deg) translateX(48px) rotate(-${angle}deg)`,
                  opacity: 0.8,
                }}
              />
            );
          })}
        </div>

        {/* Outer orbital ring (reverse direction, slower) */}
        <div className="orbit-ring-reverse absolute inset-0">
          {Array.from({ length: OUTER_PARTICLES }).map((_, i) => {
            const angle = (360 / OUTER_PARTICLES) * i;
            const color = DEPT_COLORS[(i + 3) % DEPT_COLORS.length];
            return (
              <span
                key={`outer-${i}`}
                className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 4px ${color}60`,
                  transform: `rotate(${angle}deg) translateX(72px) rotate(-${angle}deg)`,
                  opacity: 0.5,
                }}
              />
            );
          })}
        </div>

        {/* Logo with breathing animation */}
        <div className="brain-breathe absolute inset-0 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Braintree"
            className="h-16 w-16 drop-shadow-md"
            style={{
              filter: 'drop-shadow(0 0 12px rgba(91, 154, 101, 0.3))',
            }}
          />
        </div>
      </div>

      {/* Loading text with fade pulse */}
      <p className="loading-text text-[13px] font-medium tracking-wide text-text-muted">
        Loading file...
      </p>

      <style jsx>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes orbit-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes neural-expand {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(5);
            opacity: 0;
          }
        }

        @keyframes text-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        .brain-breathe {
          animation: breathe 2.4s ease-in-out infinite;
        }

        .orbit-ring {
          animation: orbit 8s linear infinite;
        }

        .orbit-ring-reverse {
          animation: orbit-reverse 12s linear infinite;
        }

        .neural-ring {
          animation: neural-expand 2.1s ease-out infinite;
        }

        .animation-delay-700 {
          animation-delay: 0.7s;
        }

        .animation-delay-1400 {
          animation-delay: 1.4s;
        }

        .loading-text {
          animation: text-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
