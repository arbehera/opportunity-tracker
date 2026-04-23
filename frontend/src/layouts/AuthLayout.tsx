import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0000 0%, #1c0000 25%, #3d0000 55%, #b00000 82%, #e30613 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Central radial glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(227,6,19,0.18) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Decorative concentric rings */}
      {[260, 460, 660, 860].map((size, i) => (
        <div key={size} style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: '50%',
          border: `1px solid rgba(255,255,255,${0.05 - i * 0.01})`,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }} />
      ))}

      {/* Bottom-left accent glow */}
      <div style={{
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(227,6,19,0.12) 0%, transparent 70%)',
        bottom: -150,
        left: -100,
        pointerEvents: 'none',
      }} />

      {/* Top-right accent glow */}
      <div style={{
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(227,6,19,0.08) 0%, transparent 70%)',
        top: -100,
        right: -80,
        pointerEvents: 'none',
      }} />

      {/* Login card */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: 440,
          background: '#ffffff',
          borderRadius: 20,
          padding: '52px 48px 44px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Pioneer logo + app name */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <img
            src="/Pioneer-logo.png"
            alt="Pioneer"
            style={{ height: 76, objectFit: 'contain' }}
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = 'none';
            }}
          />
          <div style={{ marginTop: 10, fontSize: 18, fontWeight: 700, letterSpacing: '0.5px', color: '#1a1a1a' }}>
            OEM Pulse
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
