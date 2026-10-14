import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Compass, Zap } from 'lucide-react';
import { useCryptic } from '../../store/crypticContext';

export const GalaxiesSkyboxModule: React.FC = () => {
  const { addLedger } = useCryptic();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [warpActive, setWarpActive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    // Generate 7 Galaxy cluster centers
    const galaxies = [
      { name: 'Andromeda VII', color: '#42f5ff', radius: 45, speed: 0.008, dist: 70 },
      { name: 'Triangulum Relativist', color: '#74ff9b', radius: 38, speed: -0.012, dist: 110 },
      { name: 'Centaurus Sovereign', color: '#f5ce70', radius: 52, speed: 0.006, dist: 145 },
      { name: 'Sombrero Kerr Core', color: '#ff477e', radius: 42, speed: -0.009, dist: 180 },
      { name: 'Whirlpool Sigma-9', color: '#c084fc', radius: 48, speed: 0.011, dist: 215 },
      { name: 'Cartwheel Singularity', color: '#38bdf8', radius: 56, speed: -0.007, dist: 250 },
      { name: 'Messier 87 Event Horizon', color: '#f43f5e', radius: 64, speed: 0.004, dist: 285 },
    ];

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = warpActive ? 'rgba(1, 4, 12, 0.25)' : 'rgba(1, 4, 12, 0.85)';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Draw Orbitals
      galaxies.forEach((g, i) => {
        const curAngle = angle * (warpActive ? 4 : 1) * g.speed * 60 + i;
        const gx = cx + Math.cos(curAngle) * (g.dist * 0.45);
        const gy = cy + Math.sin(curAngle) * (g.dist * 0.28);

        // Orbital line
        ctx.strokeStyle = `${g.color}22`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, g.dist * 0.45, g.dist * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Galaxy Core
        const radGrad = ctx.createRadialGradient(gx, gy, 1, gx, gy, g.radius * 0.4);
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.3, g.color);
        radGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(gx, gy, g.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Spiral particle arms
        ctx.fillStyle = g.color;
        for (let p = 0; p < 18; p++) {
          const armAngle = curAngle * 2 + (p * 0.35);
          const dist = (p / 18) * g.radius * 0.35;
          const px = gx + Math.cos(armAngle) * dist;
          const py = gy + Math.sin(armAngle) * dist;
          ctx.fillRect(px, py, 1.5, 1.5);
        }

        // Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '8px monospace';
        ctx.fillText(g.name, gx + 8, gy + 3);
      });

      angle += 0.01;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [warpActive]);

  const triggerWarp = () => {
    setWarpActive(true);
    addLedger('galaxies.warp.engaged', { boost: '4x relativistic frame-dragging' });
    setTimeout(() => setWarpActive(false), 2400);
  };

  return (
    <div className="flex flex-col h-full bg-[#01040c] text-xs font-mono overflow-hidden">
      <div className="p-2 border-b border-[#42f5ff]/20 bg-[#040e1c] flex items-center justify-between">
        <span className="font-bold text-[#f5ce70] text-[11px] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> 7 GALAXIES SKYBOX &amp; RELATIVISTIC ORBITALS
        </span>
        <button
          onClick={triggerWarp}
          disabled={warpActive}
          className={`px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wider cursor-pointer transition flex items-center gap-1 ${
            warpActive
              ? 'bg-[#42f5ff] text-black shadow-[0_0_15px_#42f5ff] animate-pulse'
              : 'bg-[#f5ce70] text-black hover:bg-[#ffe28a]'
          }`}
        >
          <Zap className="w-3 h-3" /> {warpActive ? 'WARP ENGAGED' : 'BOOST WARP PULSE'}
        </button>
      </div>

      <div className="flex-1 relative bg-black">
        <canvas ref={canvasRef} width={460} height={280} className="w-full h-full object-contain" />
      </div>

      <div className="p-2 bg-[#040c18] border-t border-[#42f5ff]/20 text-[9px] text-[#8aa0b6] flex justify-between">
        <span>Frame Dragging Index: 0.9998 c</span>
        <span className="text-[#74ff9b]">7 Celestial Clusters Synchronized</span>
      </div>
    </div>
  );
};
