'use client';

export default function Face({ mood, isBlinking, glitch, mousePos, isSpeaking, inverted = false }) {
  const eyeOffsetX = mousePos.x * 4;
  const eyeOffsetY = mousePos.y * 3;
  const color = inverted ? '#fff' : '#000';

  return (
    <svg
      viewBox="0 0 120 120"
      className="w-24 h-24 transition-transform duration-100"
      style={{
        transform: glitch ? `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)` : 'none',
        filter: glitch ? 'blur(0.5px)' : 'none'
      }}
    >
      {/* Glitch duplicates */}
      {glitch && (
        <>
          <ellipse cx="62" cy="60" rx="45" ry="48" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
          <ellipse cx="58" cy="60" rx="45" ry="48" fill="none" stroke={color} strokeWidth="1" opacity="0.3" />
        </>
      )}

      {/* Head */}
      <ellipse cx="60" cy="60" rx="45" ry="48" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="60" cy="60" rx="43" ry="46" fill="none" stroke={color} strokeWidth="0.5" opacity="0.3" />

      {/* Eyes */}
      {isBlinking ? (
        <>
          <path d="M 36 52 L 48 52" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <path d="M 72 52 L 84 52" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </>
      ) : mood === 'neutral' ? (
        <>
          <circle cx={42 + eyeOffsetX} cy={52 + eyeOffsetY} r="3" fill={color}>
            <animate attributeName="r" values="3;3.2;3" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={78 + eyeOffsetX} cy={52 + eyeOffsetY} r="3" fill={color}>
            <animate attributeName="r" values="3;3.2;3" dur="2s" repeatCount="indefinite" />
          </circle>
        </>
      ) : mood === 'thinking' ? (
        <>
          <path d="M 36 52 L 48 52" stroke={color} strokeWidth="2" strokeLinecap="round">
            <animate attributeName="opacity" values="1;0.5;1" dur="0.5s" repeatCount="indefinite" />
          </path>
          <path d="M 72 52 L 84 52" stroke={color} strokeWidth="2" strokeLinecap="round">
            <animate attributeName="opacity" values="1;0.5;1" dur="0.5s" repeatCount="indefinite" />
          </path>
        </>
      ) : mood === 'knowing' ? (
        <>
          <circle cx={42 + eyeOffsetX} cy={52 + eyeOffsetY} r="4" fill={color} />
          <circle cx={78 + eyeOffsetX} cy={52 + eyeOffsetY} r="4" fill={color} />
        </>
      ) : mood === 'complete' ? (
        <>
          <circle cx="42" cy="52" r="8" fill="none" stroke={color} strokeWidth="1.5" />
          <circle cx={42 + eyeOffsetX * 1.5} cy={52 + eyeOffsetY * 1.5} r="3" fill={color} />
          <circle cx="78" cy="52" r="8" fill="none" stroke={color} strokeWidth="1.5" />
          <circle cx={78 + eyeOffsetX * 1.5} cy={52 + eyeOffsetY * 1.5} r="3" fill={color} />
        </>
      ) : (
        <>
          <circle cx={42 + eyeOffsetX} cy={52 + eyeOffsetY} r="3" fill={color} />
          <circle cx={78 + eyeOffsetX} cy={52 + eyeOffsetY} r="3" fill={color} />
        </>
      )}

      {/* Mouth */}
      {mood === 'neutral' && (
        <path
          d={isSpeaking ? "M 45 78 Q 60 82 75 78" : "M 45 78 Q 60 78 75 78"}
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {mood === 'thinking' && (
        <>
          <circle cx="50" cy={isSpeaking ? 76 : 78} r="1.5" fill={color} />
          <circle cx="60" cy={isSpeaking ? 80 : 78} r="1.5" fill={color} />
          <circle cx="70" cy={isSpeaking ? 76 : 78} r="1.5" fill={color} />
        </>
      )}

      {mood === 'knowing' && (
        <path
          d={isSpeaking ? "M 42 75 Q 60 92 78 75" : "M 42 75 Q 60 88 78 75"}
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      )}

      {mood === 'complete' && (
        <path
          d={isSpeaking ? "M 40 78 Q 60 84 80 78" : "M 40 78 L 80 78"}
          stroke={color}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
