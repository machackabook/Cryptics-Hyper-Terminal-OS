import React, { useRef, useEffect, useState } from 'react';
import { Compass, RefreshCw, Sliders, Zap } from 'lucide-react';

export const MatrixKerrHopfModule: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [spinA, setSpinA] = useState(0.85); // Kerr black hole spin parameter (0 to 0.99)
  const [hopfFiberCount, setHopfFiberCount] = useState(16);
  const [torusRadius, setTorusRadius] = useState(60);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#020610';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Draw Kerr Ergosphere Outer Boundary (Oblate Spheroid)
      const rInner = 35;
      const rOuterX = rInner * (1 + Math.sqrt(1 - spinA * spinA * 0.2));
      const rOuterY = rInner * (1 + Math.cos(t * 0.5) * 0.1);

      ctx.save();
      ctx.strokeStyle = 'rgba(255, 71, 126, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rOuterX * 1.4, rOuterY * 1.1, t * 0.05, 0, Math.PI * 2);
      ctx.stroke();

      // Ergosphere interior fill
      const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, rOuterX);
      grad.addColorStop(0, '#000000');
      grad.addColorStop(0.5, 'rgba(20, 5, 20, 0.8)');
      grad.addColorStop(1, 'rgba(66, 245, 255, 0.15)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
      ctx.fill();

      // Hopf Fibration Streamlines (Torus Knots projected to 2D)
      for (let i = 0; i < hopfFiberCount; i++) {
        const u = (i / hopfFiberCount) * Math.PI * 2 + t * 0.4;
        ctx.strokeStyle = `hsl(${(i * 360) / hopfFiberCount + t * 20}, 85%, 65%)`;
        ctx.lineWidth = 1;
        ctx.beginPath();

        for (let theta = 0; theta < Math.PI * 2; theta += 0.1) {
          const R = torusRadius + 20 * Math.sin(theta * 3 + u);
          const px = cx + (R * Math.cos(theta) * Math.cos(u) - R * 0.4 * Math.sin(theta) * Math.sin(u));
          const py = cy + (R * Math.sin(theta) * 0.6 + Math.cos(u) * 15);
          if (theta === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      ctx.restore();

      t += 0.03;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [spinA, hopfFiberCount, torusRadius]);

  return (
    <div className="flex flex-col h-full bg-[#020610] text-xs font-mono overflow-hidden">
      <div className="p-2 border-b border-[#42f5ff]/20 bg-[#040e1c] flex items-center justify-between">
        <span className="font-bold text-[#42f5ff] text-[11px] flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5" /> KERR SINGULARITY &amp; HOPF FIBRATION
        </span>
        <span className="text-[9px] text-[#74ff9b]">RELATIVISTIC GEOMETRY</span>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-black">
        <canvas ref={canvasRef} width={420} height={260} className="w-full h-full object-contain" />
      </div>

      <div className="p-3 border-t border-[#42f5ff]/20 bg-[#040d1a] grid grid-cols-3 gap-3">
        <div>
          <label className="text-[9px] text-[#8aa0b6] block mb-1">KERR SPIN a*: {spinA.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="0.98"
            step="0.02"
            value={spinA}
            onChange={(e) => setSpinA(parseFloat(e.target.value))}
            className="w-full accent-[#42f5ff]"
          />
        </div>
        <div>
          <label className="text-[9px] text-[#8aa0b6] block mb-1">HOPF FIBERS: {hopfFiberCount}</label>
          <input
            type="range"
            min="4"
            max="32"
            value={hopfFiberCount}
            onChange={(e) => setHopfFiberCount(parseInt(e.target.value))}
            className="w-full accent-[#74ff9b]"
          />
        </div>
        <div>
          <label className="text-[9px] text-[#8aa0b6] block mb-1">TORUS SCALE: {torusRadius}</label>
          <input
            type="range"
            min="30"
            max="100"
            value={torusRadius}
            onChange={(e) => setTorusRadius(parseInt(e.target.value))}
            className="w-full accent-[#f5ce70]"
          />
        </div>
      </div>
    </div>
  );
};
