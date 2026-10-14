import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Compass, Zap, RotateCcw, Palette } from 'lucide-react';
import { useCryptic } from '../../store/crypticContext';

export const GalaxiesSkyboxModule: React.FC = () => {
  const { addLedger } = useCryptic();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [warpActive, setWarpActive] = useState(false);
  const [inverted, setInverted] = useState(false);
  const [colorShift, setColorShift] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const baseGalaxies = [
      { name: 'Andromeda VII', hue: 185, radius: 45, speed: 0.008, dist: 70 },
      { name: 'Triangulum Relativist', hue: 140, radius: 38, speed: -0.012, dist: 110 },
      { name: 'Centaurus Sovereign', hue: 45, radius: 52, speed: 0.006, dist: 145 },
      { name: 'Sombrero Kerr Core', hue: 340, radius: 42, speed: -0.009, dist: 180 },
      { name: 'Whirlpool Sigma-9', hue: 270, radius: 48, speed: 0.011, dist: 215 },
      { name: 'Cartwheel Singularity', hue: 200, radius: 56, speed: -0.007, dist: 250 },
      { name: 'Messier 87 Event Horizon', hue: 15, radius: 64, speed: 0.004, dist: 285 },
    ];

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = warpActive ? 'rgba(1, 4, 12, 0.25)' : 'rgba(1, 4, 12, 0.85)';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      baseGalaxies.forEach((g, i) => {
        const direction = inverted ? -1 : 1;
        const curAngle = angle * (warpActive ? 4 : 1) * g.speed * 60 * direction + i;
        const gx = cx + Math.cos(curAngle) * (g.dist * 0.45);
        const gy = cy + Math.sin(curAngle) * (g.dist * 0.28);
        const gColor = `hsl(${(g.hue + colorShift) % 360}, 90%, 65%)`;

        // Orbital line
        ctx.strokeStyle = `hsl(${(g.hue + colorShift) % 360}, 90%, 65%, 0.15)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, g.dist * 0.45, g.dist * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Galaxy Core
        const radGrad = ctx.createRadialGradient(gx, gy, 1, gx, gy, g.radius * 0.4);
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.3, gColor);
        radGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(gx, gy, g.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Spiral particle arms
        ctx.fillStyle = gColor;
        for (let p = 0; p < 18; p++) {
          const armAngle = curAngle * 2 + (p * 0.35);
          const dist = (p / 18) * g.radius * 0.35;
          const px = gx + Math.cos(armAngle) * dist;
          const py = gy + Math.sin(armAngle) * dist;
          ctx.fillRect(px, py, 1.5, 1.5);
        }

        // Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.font = '8px monospace';
        ctx.fillText(g.name, gx + 8, gy + 3);
      });

      angle += 0.01;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [warpActive, inverted, colorShift]);

  const triggerWarp = () => {
    setWarpActive(true);
    addLedger('galaxies.warp.engaged', { boost: '4x relativistic frame-dragging' });
    setTimeout(() => setWarpActive(false), 2400);
  };

  return (
    <div className="flex flex-col h-full bg-[#01040c] text-xs font-mono overflow-hidden">
      <div className="p-2 border-b border-[#42f5ff]/20 bg-[#040e1c] flex items-center justify-between flex-wrap gap-1.5">
        <span className="font-bold text-[#f5ce70] text-[11px] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> 7 GALAXIES SKYBOX &amp; RELATIVISTIC ORBITALS
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setColorShift(prev => (prev + 60) % 360)}
            title="Cycle celestial spectral colors"
            className="px-2 py-0.5 rounded text-[8px] bg-[#061426] border border-[#42f5ff]/30 text-[#42f5ff] hover:bg-[#42f5ff]/20 cursor-pointer flex items-center gap-1 transition"
          >
            <Palette className="w-2.5 h-2.5" /> SPECTRUM
          </button>
          <button
            onClick={() => setInverted(prev => !prev)}
            title="Invert orbital trajectory"
            className="px-2 py-0.5 rounded text-[8px] bg-[#061426] border border-[#74ff9b]/30 text-[#74ff9b] hover:bg-[#74ff9b]/20 cursor-pointer flex items-center gap-1 transition"
          >
            <RotateCcw className="w-2.5 h-2.5" /> {inverted ? 'REV' : 'FWD'}
          </button>
          <button
            onClick={triggerWarp}
            disabled={warpActive}
            className={`px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wider cursor-pointer transition flex items-center gap-1 ${
              warpActive
                ? 'bg-[#42f5ff] text-black shadow-[0_0_15px_#42f5ff] animate-pulse'
                : 'bg-[#f5ce70] text-black hover:bg-[#ffe28a]'
            }`}
          >
            <Zap className="w-3 h-3" /> {warpActive ? 'WARP ENGAGED' : 'BOOST WARP'}
          </button>
        </div>
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
