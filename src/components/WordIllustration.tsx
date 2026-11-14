import React from 'react';

interface WordIllustrationProps {
  wordId: string;
  className?: string;
}

export const WordIllustration: React.FC<WordIllustrationProps> = ({
  wordId,
  className = 'w-full h-full',
}) => {
  switch (wordId) {
    case 'apple':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="사과 그림">
          <path d="M60 28 C60 18, 68 13, 73 15" stroke="#78350F" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M63 23 C73 12, 90 16, 86 28 C78 31, 66 28, 63 23 Z" fill="#22C55E" stroke="#15803D" strokeWidth="2.5" />
          <path
            d="M60 32 C42 26, 22 40, 24 67 C26 92, 43 106, 56 104 C59 103.5, 61 103.5, 64 104 C77 106, 94 92, 96 67 C98 40, 78 26, 60 32 Z"
            fill="#EF4444"
            stroke="#B91C1C"
            strokeWidth="3"
          />
          <ellipse cx="42" cy="52" rx="7" ry="13" transform="rotate(-22 42 52)" fill="#FCA5A5" opacity="0.65" />
          <circle cx="46" cy="40" r="3" fill="#FFFFFF" opacity="0.8" />
        </svg>
      );

    case 'banana':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="바나나 그림">
          <path
            d="M28 84 C44 96, 84 82, 94 34 C96 27, 92 22, 87 24 C83 45, 64 70, 34 73 C24 74, 21 80, 28 84 Z"
            fill="#FACC15"
            stroke="#CA8A04"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M36 93 C58 103, 96 84, 100 40 C100 35, 96 31, 93 34 C86 64, 64 82, 38 84 C31 85, 30 90, 36 93 Z"
            fill="#FDE047"
            stroke="#CA8A04"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M88 23 L94 18" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
          <circle cx="27" cy="80" r="3" fill="#78350F" />
        </svg>
      );

    case 'grape':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="포도 그림">
          <path d="M60 15 L60 32" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
          <path d="M60 22 C74 14, 88 22, 82 32 C72 34, 62 30, 60 22 Z" fill="#22C55E" stroke="#15803D" strokeWidth="2.5" />
          {[
            [42, 42], [60, 40], [78, 42],
            [36, 58], [52, 56], [68, 56], [84, 58],
            [44, 73], [60, 72], [76, 73],
            [52, 88], [68, 88],
            [60, 101],
          ].map(([cx, cy], idx) => (
            <g key={idx}>
              <circle cx={cx} cy={cy} r="11" fill="#9333EA" stroke="#6B21A8" strokeWidth="2.5" />
              <circle cx={cx - 3} cy={cy - 3} r="2.8" fill="#E9D5FF" opacity="0.85" />
            </g>
          ))}
        </svg>
      );

    case 'strawberry':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="딸기 그림">
          <path
            d="M60 102 C38 96, 26 68, 30 46 C33 34, 46 30, 60 30 C74 30, 87 34, 90 46 C94 68, 82 96, 60 102 Z"
            fill="#F43F5E"
            stroke="#BE123C"
            strokeWidth="3"
          />
          <path
            d="M38 34 L48 22 L60 31 L72 22 L82 34 L69 38 L60 44 L51 38 Z"
            fill="#22C55E"
            stroke="#15803D"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M60 25 L60 16" stroke="#15803D" strokeWidth="4" strokeLinecap="round" />
          {[
            [45, 50], [60, 48], [75, 50],
            [40, 64], [53, 63], [67, 63], [80, 64],
            [48, 78], [60, 76], [72, 78],
            [60, 90],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="1.8" ry="3" fill="#FEF08A" />
          ))}
        </svg>
      );

    case 'watermelon':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="수박 그림">
          <path d="M16 44 A44 44 0 0 0 104 44 Z" fill="#16A34A" stroke="#14532D" strokeWidth="3" />
          <path d="M22 44 A38 38 0 0 0 98 44 Z" fill="#DCFCE7" />
          <path d="M26 44 A34 34 0 0 0 94 44 Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
          {[
            [42, 54], [54, 62], [66, 62], [78, 54], [60, 52],
          ].map(([x, y], i) => (
            <ellipse key={i} cx={x} cy={y} rx="2.2" ry="3.8" fill="#1E293B" />
          ))}
        </svg>
      );

    case 'tangerine':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="귤 그림">
          <circle cx="60" cy="65" r="35" fill="#F97316" stroke="#C2410C" strokeWidth="3" />
          <ellipse cx="46" cy="52" rx="7" ry="10" transform="rotate(-25 46 52)" fill="#FDBA74" opacity="0.65" />
          <path d="M60 30 C64 20, 78 18, 82 26 C74 32, 65 32, 60 30 Z" fill="#22C55E" stroke="#15803D" strokeWidth="2.5" />
          <circle cx="60" cy="31" r="4" fill="#15803D" />
          <circle cx="72" cy="74" r="1.5" fill="#C2410C" />
          <circle cx="78" cy="64" r="1.5" fill="#C2410C" />
          <circle cx="66" cy="82" r="1.5" fill="#C2410C" />
        </svg>
      );

    case 'puppy':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="강아지 그림">
          <ellipse cx="28" cy="58" rx="13" ry="24" transform="rotate(14 28 58)" fill="#B45309" stroke="#78350F" strokeWidth="3" />
          <ellipse cx="92" cy="58" rx="13" ry="24" transform="rotate(-14 92 58)" fill="#B45309" stroke="#78350F" strokeWidth="3" />
          <circle cx="60" cy="60" r="32" fill="#F59E0B" stroke="#78350F" strokeWidth="3" />
          <ellipse cx="60" cy="70" rx="18" ry="14" fill="#FEF3C7" />
          <circle cx="47" cy="54" r="4.5" fill="#1E293B" />
          <circle cx="73" cy="54" r="4.5" fill="#1E293B" />
          <circle cx="48.5" cy="52.5" r="1.5" fill="#FFFFFF" />
          <circle cx="74.5" cy="52.5" r="1.5" fill="#FFFFFF" />
          <ellipse cx="60" cy="66" rx="6" ry="4.5" fill="#1E293B" />
          <path d="M53 74 Q60 81 67 74" stroke="#78350F" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M56 76 Q60 87 64 76 Z" fill="#FB7185" />
          <circle cx="38" cy="65" r="5" fill="#FDA4AF" opacity="0.7" />
          <circle cx="82" cy="65" r="5" fill="#FDA4AF" opacity="0.7" />
        </svg>
      );

    case 'cat':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="고양이 그림">
          <polygon points="28,48 34,18 54,36" fill="#FB923C" stroke="#9A3412" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="92,48 86,18 66,36" fill="#FB923C" stroke="#9A3412" strokeWidth="3" strokeLinejoin="round" />
          <polygon points="33,44 37,25 49,37" fill="#FECDD3" />
          <polygon points="87,44 83,25 71,37" fill="#FECDD3" />
          <circle cx="60" cy="64" r="32" fill="#FDBA74" stroke="#9A3412" strokeWidth="3" />
          <path d="M60 32 L60 44 M52 34 L54 43 M68 34 L66 43" stroke="#C2410C" strokeWidth="3" strokeLinecap="round" />
          <circle cx="47" cy="60" r="4.5" fill="#1E293B" />
          <circle cx="73" cy="60" r="4.5" fill="#1E293B" />
          <circle cx="48.5" cy="58.5" r="1.5" fill="#FFFFFF" />
          <circle cx="74.5" cy="58.5" r="1.5" fill="#FFFFFF" />
          <polygon points="56,68 64,68 60,73" fill="#FB7185" />
          <path d="M52 76 Q60 81 60 73 Q60 81 68 76" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M22 66 L40 68 M22 74 L40 73 M98 66 L80 68 M98 74 L80 73" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'rabbit':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="토끼 그림">
          <ellipse cx="44" cy="34" rx="10" ry="26" transform="rotate(-8 44 34)" fill="#FFFFFF" stroke="#64748B" strokeWidth="3" />
          <ellipse cx="76" cy="34" rx="10" ry="26" transform="rotate(8 76 34)" fill="#FFFFFF" stroke="#64748B" strokeWidth="3" />
          <ellipse cx="44" cy="35" rx="5" ry="18" transform="rotate(-8 44 35)" fill="#FBCFE8" />
          <ellipse cx="76" cy="35" rx="5" ry="18" transform="rotate(8 76 35)" fill="#FBCFE8" />
          <circle cx="60" cy="72" r="30" fill="#FFFFFF" stroke="#64748B" strokeWidth="3" />
          <circle cx="48" cy="68" r="4" fill="#1E293B" />
          <circle cx="72" cy="68" r="4" fill="#1E293B" />
          <ellipse cx="60" cy="76" rx="4" ry="3" fill="#F472B6" />
          <path d="M54 83 Q60 87 66 83" stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <circle cx="39" cy="76" r="5" fill="#FBCFE8" />
          <circle cx="81" cy="76" r="5" fill="#FBCFE8" />
        </svg>
      );

    case 'chick':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="병아리 그림">
          <path d="M48 92 L44 104 M44 104 L38 106 M44 104 L48 107" stroke="#EA580C" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M72 92 L76 104 M76 104 L72 107 M76 104 L82 106" stroke="#EA580C" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="26" cy="66" rx="10" ry="14" transform="rotate(24 26 66)" fill="#FACC15" stroke="#CA8A04" strokeWidth="3" />
          <ellipse cx="94" cy="66" rx="10" ry="14" transform="rotate(-24 94 66)" fill="#FACC15" stroke="#CA8A04" strokeWidth="3" />
          <circle cx="60" cy="62" r="32" fill="#FDE047" stroke="#CA8A04" strokeWidth="3" />
          <path d="M56 30 Q60 18 65 28 Q70 20 69 31" stroke="#CA8A04" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="47" cy="57" r="4.5" fill="#1E293B" />
          <circle cx="73" cy="57" r="4.5" fill="#1E293B" />
          <polygon points="54,64 66,64 60,72" fill="#F97316" stroke="#C2410C" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="38" cy="66" r="5" fill="#FCA5A5" opacity="0.7" />
          <circle cx="82" cy="66" r="5" fill="#FCA5A5" opacity="0.7" />
        </svg>
      );

    case 'lion':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="사자 그림">
          <circle cx="60" cy="62" r="40" fill="#B45309" stroke="#78350F" strokeWidth="3" strokeDasharray="14 6" />
          <circle cx="60" cy="62" r="36" fill="#D97706" />
          <circle cx="36" cy="36" r="9" fill="#FBBF24" stroke="#78350F" strokeWidth="2.5" />
          <circle cx="84" cy="36" r="9" fill="#FBBF24" stroke="#78350F" strokeWidth="2.5" />
          <circle cx="60" cy="64" r="25" fill="#FCD34D" stroke="#92400E" strokeWidth="2.5" />
          <circle cx="50" cy="59" r="3.8" fill="#1E293B" />
          <circle cx="70" cy="59" r="3.8" fill="#1E293B" />
          <polygon points="55,66 65,66 60,72" fill="#78350F" />
          <path d="M52 76 Q60 82 68 76" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'elephant':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="코끼리 그림">
          <ellipse cx="25" cy="58" rx="18" ry="26" fill="#93C5FD" stroke="#2563EB" strokeWidth="3" />
          <ellipse cx="95" cy="58" rx="18" ry="26" fill="#93C5FD" stroke="#2563EB" strokeWidth="3" />
          <ellipse cx="26" cy="58" rx="10" ry="16" fill="#FBCFE8" />
          <ellipse cx="94" cy="58" rx="10" ry="16" fill="#FBCFE8" />
          <circle cx="60" cy="56" r="27" fill="#60A5FA" stroke="#2563EB" strokeWidth="3" />
          <path d="M54 66 Q54 96 72 95 Q78 94 76 87" stroke="#2563EB" strokeWidth="13" strokeLinecap="round" fill="none" />
          <path d="M54 66 Q54 96 72 95 Q78 94 76 87" stroke="#60A5FA" strokeWidth="8" strokeLinecap="round" fill="none" />
          <circle cx="48" cy="50" r="4" fill="#1E293B" />
          <circle cx="72" cy="50" r="4" fill="#1E293B" />
        </svg>
      );

    case 'sun':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="해 그림">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="60"
              y1="14"
              x2="60"
              y2="25"
              stroke="#F59E0B"
              strokeWidth="6"
              strokeLinecap="round"
              transform={`rotate(${deg} 60 60)`}
            />
          ))}
          <circle cx="60" cy="60" r="28" fill="#FACC15" stroke="#EA580C" strokeWidth="3" />
          <circle cx="50" cy="56" r="3.5" fill="#78350F" />
          <circle cx="70" cy="56" r="3.5" fill="#78350F" />
          <path d="M51 67 Q60 75 69 67" stroke="#78350F" strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="43" cy="63" r="4" fill="#FB7185" opacity="0.6" />
          <circle cx="77" cy="63" r="4" fill="#FB7185" opacity="0.6" />
        </svg>
      );

    case 'moon':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="달 그림">
          <rect x="14" y="14" width="92" height="92" rx="22" fill="#1E293B" />
          <path
            d="M72 28 C52 32, 42 52, 48 70 C54 88, 74 94, 88 84 C68 94, 42 84, 36 62 C30 40, 48 22, 72 28 Z"
            fill="#FDE047"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="84" cy="36" r="3" fill="#FEF08A" />
          <circle cx="92" cy="52" r="2" fill="#FEF08A" />
        </svg>
      );

    case 'star':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="별 그림">
          <polygon
            points="60,16 72,43 102,46 79,66 86,96 60,80 34,96 41,66 18,46 48,43"
            fill="#FACC15"
            stroke="#D97706"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <circle cx="51" cy="56" r="3.5" fill="#78350F" />
          <circle cx="69" cy="56" r="3.5" fill="#78350F" />
          <path d="M53 66 Q60 72 67 66" stroke="#78350F" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'cloud':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="구름 그림">
          <path
            d="M34 84 H86 C97 84 104 75 104 65 C104 55 96 47 86 47 C84 33 72 24 58 24 C43 24 31 35 30 49 C21 51 16 59 16 68 C16 77 24 84 34 84 Z"
            fill="#FFFFFF"
            stroke="#38BDF8"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <circle cx="48" cy="60" r="3.5" fill="#0F172A" />
          <circle cx="72" cy="60" r="3.5" fill="#0F172A" />
          <path d="M54 68 Q60 73 66 68" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'tree':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="나무 그림">
          <rect x="51" y="68" width="18" height="36" rx="4" fill="#92400E" stroke="#78350F" strokeWidth="3" />
          <circle cx="42" cy="52" r="22" fill="#22C55E" stroke="#15803D" strokeWidth="3" />
          <circle cx="78" cy="52" r="22" fill="#22C55E" stroke="#15803D" strokeWidth="3" />
          <circle cx="60" cy="36" r="24" fill="#4ADE80" stroke="#15803D" strokeWidth="3" />
          <circle cx="44" cy="48" r="18" fill="#4ADE80" />
          <circle cx="76" cy="48" r="18" fill="#4ADE80" />
          <circle cx="52" cy="38" r="4" fill="#EF4444" />
          <circle cx="72" cy="50" r="4" fill="#EF4444" />
        </svg>
      );

    case 'flower':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="꽃 그림">
          <path d="M60 58 L60 104" stroke="#16A34A" strokeWidth="6" strokeLinecap="round" />
          <path d="M60 85 C74 75, 86 80, 82 90 C72 92, 64 89, 60 85 Z" fill="#22C55E" stroke="#15803D" strokeWidth="2.5" />
          <path d="M60 82 C46 72, 34 77, 38 87 C48 89, 56 86, 60 82 Z" fill="#22C55E" stroke="#15803D" strokeWidth="2.5" />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <ellipse
              key={deg}
              cx="60"
              cy="28"
              rx="12"
              ry="17"
              fill="#FB7185"
              stroke="#E11D48"
              strokeWidth="2.5"
              transform={`rotate(${deg} 60 48)`}
            />
          ))}
          <circle cx="60" cy="48" r="14" fill="#FACC15" stroke="#D97706" strokeWidth="3" />
          <circle cx="55" cy="46" r="2.2" fill="#78350F" />
          <circle cx="65" cy="46" r="2.2" fill="#78350F" />
          <path d="M55 52 Q60 56 65 52" stroke="#78350F" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'car':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="자동차 그림">
          <path d="M30 56 L42 36 H78 L90 56 Z" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="3" strokeLinejoin="round" />
          <path d="M45 40 H75 L82 54 H38 Z" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth="2" />
          <rect x="16" y="54" width="88" height="28" rx="10" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="3" />
          <rect x="94" y="61" width="10" height="8" rx="3" fill="#FEF08A" />
          <circle cx="36" cy="84" r="12" fill="#334155" stroke="#0F172A" strokeWidth="3" />
          <circle cx="36" cy="84" r="5" fill="#CBD5E1" />
          <circle cx="84" cy="84" r="12" fill="#334155" stroke="#0F172A" strokeWidth="3" />
          <circle cx="84" cy="84" r="5" fill="#CBD5E1" />
        </svg>
      );

    case 'bus':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="버스 그림">
          <rect x="14" y="32" width="92" height="52" rx="10" fill="#FACC15" stroke="#B45309" strokeWidth="3" />
          <rect x="22" y="42" width="18" height="18" rx="3" fill="#E0F2FE" stroke="#B45309" strokeWidth="2" />
          <rect x="46" y="42" width="18" height="18" rx="3" fill="#E0F2FE" stroke="#B45309" strokeWidth="2" />
          <rect x="70" y="42" width="26" height="18" rx="3" fill="#E0F2FE" stroke="#B45309" strokeWidth="2" />
          <rect x="14" y="67" width="92" height="7" fill="#EA580C" />
          <circle cx="34" cy="86" r="11" fill="#334155" stroke="#0F172A" strokeWidth="3" />
          <circle cx="34" cy="86" r="4.5" fill="#CBD5E1" />
          <circle cx="86" cy="86" r="11" fill="#334155" stroke="#0F172A" strokeWidth="3" />
          <circle cx="86" cy="86" r="4.5" fill="#CBD5E1" />
        </svg>
      );

    case 'airplane':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="비행기 그림">
          <path d="M48 56 L28 24 L42 24 L68 52 Z" fill="#93C5FD" stroke="#1D4ED8" strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M48 64 L32 94 L46 94 L68 68 Z" fill="#93C5FD" stroke="#1D4ED8" strokeWidth="2.8" strokeLinejoin="round" />
          <path d="M16 58 L26 42 L34 44 L28 58 Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2.5" strokeLinejoin="round" />
          <path
            d="M16 60 C16 53, 30 50, 74 50 C94 50, 106 55, 106 60 C106 65, 94 70, 74 70 C30 70, 16 67, 16 60 Z"
            fill="#FFFFFF"
            stroke="#1D4ED8"
            strokeWidth="3"
          />
          <circle cx="48" cy="60" r="3.5" fill="#38BDF8" />
          <circle cx="60" cy="60" r="3.5" fill="#38BDF8" />
          <circle cx="72" cy="60" r="3.5" fill="#38BDF8" />
          <path d="M84 54 H96 C100 56 100 60 96 62 H84 Z" fill="#38BDF8" />
        </svg>
      );

    case 'train':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="기차 그림">
          <line x1="12" y1="92" x2="108" y2="92" stroke="#64748B" strokeWidth="4" strokeLinecap="round" />
          <rect x="26" y="34" width="68" height="46" rx="8" fill="#10B981" stroke="#047857" strokeWidth="3" />
          <rect x="34" y="20" width="12" height="14" rx="2" fill="#334155" />
          <circle cx="38" cy="14" r="5" fill="#CBD5E1" />
          <circle cx="48" cy="11" r="4" fill="#E2E8F0" />
          <rect x="66" y="42" width="20" height="16" rx="3" fill="#E0F2FE" stroke="#047857" strokeWidth="2" />
          <rect x="34" y="44" width="22" height="14" rx="3" fill="#FEF08A" />
          <circle cx="40" cy="82" r="9" fill="#334155" stroke="#0F172A" strokeWidth="3" />
          <circle cx="62" cy="82" r="9" fill="#334155" stroke="#0F172A" strokeWidth="3" />
          <circle cx="84" cy="82" r="9" fill="#334155" stroke="#0F172A" strokeWidth="3" />
        </svg>
      );

    case 'ship':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="배 그림">
          <path d="M18 68 H102 L90 92 H30 Z" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="3" strokeLinejoin="round" />
          <rect x="38" y="48" width="44" height="20" rx="4" fill="#FFFFFF" stroke="#1D4ED8" strokeWidth="3" />
          <rect x="52" y="30" width="14" height="18" rx="2" fill="#EF4444" stroke="#B91C1C" strokeWidth="2.5" />
          <circle cx="49" cy="58" r="4" fill="#93C5FD" />
          <circle cx="62" cy="58" r="4" fill="#93C5FD" />
          <circle cx="75" cy="58" r="4" fill="#93C5FD" />
          <path d="M14 96 Q30 90 46 96 T78 96 T106 96" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" fill="none" />
        </svg>
      );

    case 'bicycle':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="자전거 그림">
          <circle cx="32" cy="76" r="18" fill="none" stroke="#334155" strokeWidth="5" />
          <circle cx="88" cy="76" r="18" fill="none" stroke="#334155" strokeWidth="5" />
          <circle cx="32" cy="76" r="4" fill="#F97316" />
          <circle cx="88" cy="76" r="4" fill="#F97316" />
          <path d="M32 76 L54 46 H78 L88 76 M54 46 L58 76 H32 M78 46 L58 76" stroke="#EF4444" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M46 42 H60" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" />
          <path d="M74 36 H86 L82 46" stroke="#1E293B" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );

    case 'pencil':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="연필 그림">
          <g transform="rotate(-38 60 60)">
            <rect x="46" y="24" width="28" height="14" rx="4" fill="#FB7185" stroke="#BE123C" strokeWidth="3" />
            <rect x="46" y="36" width="28" height="8" fill="#CBD5E1" stroke="#475569" strokeWidth="2.5" />
            <rect x="46" y="44" width="28" height="44" fill="#FACC15" stroke="#B45309" strokeWidth="3" />
            <line x1="55" y1="44" x2="55" y2="88" stroke="#D97706" strokeWidth="2.5" />
            <line x1="65" y1="44" x2="65" y2="88" stroke="#D97706" strokeWidth="2.5" />
            <polygon points="46,88 74,88 60,108" fill="#FDE68A" stroke="#B45309" strokeWidth="3" strokeLinejoin="round" />
            <polygon points="56,101 64,101 60,108" fill="#1E293B" />
          </g>
        </svg>
      );

    case 'eraser':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="지우개 그림">
          <g transform="rotate(-20 60 60)">
            <rect x="24" y="42" width="72" height="38" rx="7" fill="#FFFFFF" stroke="#334155" strokeWidth="3.5" />
            <rect x="42" y="42" width="54" height="38" rx="6" fill="#38BDF8" stroke="#0369A1" strokeWidth="3" />
            <rect x="50" y="52" width="38" height="18" rx="3" fill="#E0F2FE" />
          </g>
        </svg>
      );

    case 'bag':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="가방 그림">
          <path d="M46 30 C46 18, 74 18, 74 30" stroke="#BE123C" strokeWidth="6" strokeLinecap="round" fill="none" />
          <rect x="28" y="30" width="64" height="68" rx="16" fill="#FB7185" stroke="#BE123C" strokeWidth="3.5" />
          <path d="M28 48 C28 36, 92 36, 92 48 L88 60 H32 Z" fill="#F43F5E" stroke="#BE123C" strokeWidth="3" />
          <rect x="38" y="66" width="44" height="22" rx="6" fill="#FFE4E6" stroke="#BE123C" strokeWidth="2.5" />
          <circle cx="60" cy="56" r="5" fill="#FACC15" stroke="#B45309" strokeWidth="2" />
        </svg>
      );

    case 'book':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="책 그림">
          <path d="M20 30 Q40 24 60 34 Q80 24 100 30 V88 Q80 80 60 90 Q40 80 20 88 Z" fill="#FFFFFF" stroke="#047857" strokeWidth="3.5" strokeLinejoin="round" />
          <line x1="60" y1="34" x2="60" y2="90" stroke="#047857" strokeWidth="3" />
          <line x1="28" y1="46" x2="50" y2="48" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
          <line x1="28" y1="58" x2="50" y2="60" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
          <line x1="28" y1="70" x2="46" y2="71" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
          <circle cx="80" cy="56" r="10" fill="#FACC15" stroke="#D97706" strokeWidth="2.5" />
        </svg>
      );

    case 'clock':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="시계 그림">
          <circle cx="30" cy="30" r="12" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
          <circle cx="90" cy="30" r="12" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
          <circle cx="60" cy="64" r="36" fill="#6366F1" stroke="#3730A3" strokeWidth="3.5" />
          <circle cx="60" cy="64" r="28" fill="#FFFFFF" stroke="#C7D2FE" strokeWidth="2" />
          <line x1="60" y1="64" x2="60" y2="44" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
          <line x1="60" y1="64" x2="76" y2="64" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="60" cy="64" r="4" fill="#1E293B" />
        </svg>
      );

    case 'umbrella':
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="우산 그림">
          <line x1="60" y1="18" x2="60" y2="92" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
          <path d="M60 92 C60 102, 74 102, 74 92" stroke="#78350F" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M18 60 C18 32, 102 32, 102 60 Q88 52 74 60 Q60 52 46 60 Q32 52 18 60 Z" fill="#A855F7" stroke="#6B21A8" strokeWidth="3" strokeLinejoin="round" />
          <path d="M46 60 C46 40, 54 34, 60 34 C66 34, 74 40, 74 60" fill="#F472B6" stroke="#6B21A8" strokeWidth="2.5" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 120 120" className={className} aria-label="낱말 그림">
          <circle cx="60" cy="60" r="36" fill="#E2E8F0" />
        </svg>
      );
  }
};
