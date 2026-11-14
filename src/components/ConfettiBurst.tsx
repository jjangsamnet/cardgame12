import React from 'react';
import { motion } from 'motion/react';

interface ConfettiBurstProps {
  triggerKey: number;
}

const CONFETTI_COLORS = ['#F59E0B', '#10B981', '#0284C7', '#F43F5E', '#8B5CF6'];

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({ triggerKey }) => {
  if (triggerKey <= 0) return null;

  const pieces = Array.from({ length: 18 }, (_, i) => {
    const angle = (i / 18) * Math.PI * 2;
    const distance = 60 + (i % 3) * 45;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 20;
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    return { id: i, tx, ty, color, rotate: (i * 47) % 360 };
  });

  return (
    <div
      key={triggerKey}
      className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 0.4, rotate: 0 }}
          animate={{ opacity: 0, x: p.tx, y: p.ty, scale: 1.2, rotate: p.rotate }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="absolute w-3.5 h-3.5 rounded-sm"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
};
