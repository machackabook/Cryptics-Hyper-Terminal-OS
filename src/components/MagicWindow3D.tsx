import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useCryptic } from '../store/crypticContext';

interface MagicWindow3DProps {
  interactive?: boolean;
}

export type FlowPreset = 'spacetime' | 'atmospheric' | 'lemniscate';

export const MagicWindow3D: React.FC<MagicWindow3DProps> = ({ interactive = true }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const { oscillatorActive } = useCryptic();
  const [flowPreset, setFlowPreset] = useState<FlowPreset>('spacetime');
  const [flowSpeed, setFlowSpeed] = useState<number>(1.0);
  const [showControls, setShowControls] = useState<boolean>(false);

  // Store refs so animation loop can read dynamic settings without recreation
  const settingsRef = useRef({
    flowPreset,
    flowSpeed,
    oscillatorActive,
  });

  useEffect(() => {
    settingsRef.current = {
      flowPreset,
      flowSpeed,
      oscillatorActive,
    };
  }, [flowPreset, flowSpeed, oscillatorActive]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02050b, 0.0012);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 3000);
    camera.position.set(0, 40, 520);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // =========================================================================
    // 3D VECTOR FLOW FIELD PARTICLES (Forever Length Runtime Visual)
    // =========================================================================
    const PARTICLE_COUNT = 3200;
    const bounds = { x: 750, y: 550, z: 650 };

    const flowGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const lifetimes = new Float32Array(PARTICLE_COUNT);
    const maxLifetimes = new Float32Array(PARTICLE_COUNT);

    const cCyan = new THREE.Color(0x42f5ff);
    const cGreen = new THREE.Color(0x74ff9b);
    const cGold = new THREE.Color(0xf5ce70);
    const cPurple = new THREE.Color(0xa855f7);
    const cBlue = new THREE.Color(0x3b82f6);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * bounds.x * 2;
      positions[i3 + 1] = (Math.random() - 0.5) * bounds.y * 2;
      positions[i3 + 2] = (Math.random() - 0.5) * bounds.z * 2;

      velocities[i3] = 0;
      velocities[i3 + 1] = 0;
      velocities[i3 + 2] = 0;

      lifetimes[i] = Math.random() * 200;
      maxLifetimes[i] = 150 + Math.random() * 250;

      const pick = i % 4;
      const col =
        pick === 0 ? cCyan : pick === 1 ? cGreen : pick === 2 ? cGold : cPurple;
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
    }

    flowGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    flowGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const flowMaterial = new THREE.PointsMaterial({
      size: 2.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const flowPoints = new THREE.Points(flowGeom, flowMaterial);
    scene.add(flowPoints);

    // =========================================================================
    // FLOW STREAMLINES / FILAMENTS
    // =========================================================================
    const FILAMENT_COUNT = 48;
    const FILAMENT_POINTS = 32;
    const filamentGeom = new THREE.BufferGeometry();
    const filamentPositions = new Float32Array(FILAMENT_COUNT * FILAMENT_POINTS * 3);
    const filamentColors = new Float32Array(FILAMENT_COUNT * FILAMENT_POINTS * 3);

    for (let f = 0; f < FILAMENT_COUNT; f++) {
      const col = f % 2 === 0 ? cCyan.clone().lerp(cGreen, 0.4) : cPurple.clone().lerp(cGold, 0.3);
      for (let p = 0; p < FILAMENT_POINTS; p++) {
        const idx = (f * FILAMENT_POINTS + p) * 3;
        filamentColors[idx] = col.r;
        filamentColors[idx + 1] = col.g;
        filamentColors[idx + 2] = col.b;
      }
    }

    filamentGeom.setAttribute('position', new THREE.BufferAttribute(filamentPositions, 3));
    filamentGeom.setAttribute('color', new THREE.BufferAttribute(filamentColors, 3));

    const filamentMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    });

    const filamentLines = new THREE.LineSegments(filamentGeom, filamentMaterial);
    scene.add(filamentLines);

    // =========================================================================
    // RELATIVISTIC KERR & BERNOULLI LEMNISCATE GUIDES
    // =========================================================================
    const orbitalGroup = new THREE.Group();
    const ringRadii = [140, 220, 310, 420];
    ringRadii.forEach((r, idx) => {
      const ringGeom = new THREE.RingGeometry(r, r + 1.2, 96);
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx % 2 === 0 ? 0x42f5ff : 0x74ff9b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.16,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI * 0.38 + idx * 0.12;
      ring.rotation.y = idx * 0.25;
      orbitalGroup.add(ring);
    });
    scene.add(orbitalGroup);

    // =========================================================================
    // INTERACTION & FLUID VORTEX ADVECTION
    // =========================================================================
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 40;
    let mouseVelocityX = 0;
    let mouseVelocityY = 0;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const nx = (e.clientX - width / 2) / (width / 2);
      const ny = (e.clientY - height / 2) / (height / 2);
      mouseX = nx;
      mouseY = ny;

      mouseVelocityX = (nx - prevMouseX) * 12;
      mouseVelocityY = (ny - prevMouseY) * 12;
      prevMouseX = nx;
      prevMouseY = ny;

      targetCameraX = nx * 140;
      targetCameraY = -ny * 90 + 40;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // =========================================================================
    // FOREVER-LENGTH VECTOR FIELD FLOW SIMULATION LOOP
    // =========================================================================
    let animId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      animId = requestAnimationFrame(animate);

      // Clamp delta time to avoid large jumps when tab is in background
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const { flowPreset: activePreset, flowSpeed: activeSpeed, oscillatorActive: is963 } =
        settingsRef.current;

      // Safe time wrapping to guarantee infinite runtime without floating-point precision loss
      const t = ((currentTime * 0.0006 * activeSpeed) % 86400);

      // Audio resonance frequency multiplier
      const audioPulse = is963 ? Math.sin(currentTime * 0.00963) * 0.4 + 1.2 : 1.0;

      // Update vector flow field for particles
      const posAttr = flowGeom.attributes.position as THREE.BufferAttribute;
      const posArr = posAttr.array as Float32Array;
      const colAttr = flowGeom.attributes.color as THREE.BufferAttribute;
      const colArr = colAttr.array as Float32Array;

      // Fluid swirl center based on mouse
      const vortexX = mouseX * 240;
      const vortexY = -mouseY * 180;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        let px = posArr[i3];
        let py = posArr[i3 + 1];
        let pz = posArr[i3 + 2];

        lifetimes[i] += delta * 60;

        // 3D Vector field computation based on selected flow preset
        let vx = 0;
        let vy = 0;
        let vz = 0;

        if (activePreset === 'spacetime') {
          // Relativistic spacetime swirl (Kerr Frame Dragging)
          const r = Math.sqrt(px * px + pz * pz) + 1.0;
          const theta = Math.atan2(pz, px);
          const spin = (350 / (r + 80)) * audioPulse;

          vx = -Math.sin(theta + t * 0.8) * spin * 2.2 + Math.cos(py * 0.01 + t) * 0.6;
          vy = Math.sin(r * 0.02 - t * 2.0) * 1.2 + Math.sin(px * 0.015) * 0.5;
          vz = Math.cos(theta + t * 0.8) * spin * 2.2 + Math.sin(py * 0.01 + t) * 0.6;
        } else if (activePreset === 'atmospheric') {
          // Atmospheric Jet Stream and Coriolis Wind Grid
          const latFactor = Math.sin(py * 0.008 + t);
          vx = 2.4 * activeSpeed + Math.sin(pz * 0.015 + t) * 1.5;
          vy = Math.cos(px * 0.006 + t) * 1.2 * latFactor;
          vz = Math.sin(px * 0.008 + t * 1.5) * 1.8;
        } else {
          // Bernoulli Lemniscate & Quantum Foam (Stage 438 Lemniscate of Bernoulli: r^2 = 2a^2 cos(2t))
          const phase = (i / PARTICLE_COUNT) * Math.PI * 2 + t * 0.8;
          const scale = 280 * audioPulse;
          const den = 1 + Math.sin(phase) * Math.sin(phase);
          const targetX = (scale * Math.cos(phase)) / den;
          const targetZ = (scale * Math.sin(phase) * Math.cos(phase)) / den;

          vx = (targetX - px) * 0.04;
          vy = Math.sin(px * 0.01 + t * 2) * 1.2;
          vz = (targetZ - pz) * 0.04;
        }

        // Add interactive mouse fluid vortex impulse
        const dx = px - vortexX;
        const dy = py - vortexY;
        const distSq = dx * dx + dy * dy;
        if (distSq < 45000 && distSq > 10) {
          const invDist = 1 / Math.sqrt(distSq);
          vx += -dy * invDist * 3.5 + mouseVelocityX * 0.8;
          vy += dx * invDist * 3.5 + mouseVelocityY * 0.8;
        }

        // Apply velocities with smooth damping
        velocities[i3] = velocities[i3] * 0.94 + vx * 0.06;
        velocities[i3 + 1] = velocities[i3 + 1] * 0.94 + vy * 0.06;
        velocities[i3 + 2] = velocities[i3 + 2] * 0.94 + vz * 0.06;

        px += velocities[i3] * (activeSpeed * 1.2);
        py += velocities[i3 + 1] * (activeSpeed * 1.2);
        pz += velocities[i3 + 2] * (activeSpeed * 1.2);

        // Torus wrapping & seamless lifetime respawn (prevents edge pops)
        if (
          Math.abs(px) > bounds.x ||
          Math.abs(py) > bounds.y ||
          Math.abs(pz) > bounds.z ||
          lifetimes[i] > maxLifetimes[i]
        ) {
          lifetimes[i] = 0;
          px = (Math.random() - 0.5) * bounds.x * 1.6;
          py = (Math.random() - 0.5) * bounds.y * 1.6;
          pz = (Math.random() - 0.5) * bounds.z * 1.6;
        }

        posArr[i3] = px;
        posArr[i3 + 1] = py;
        posArr[i3 + 2] = pz;
      }
      posAttr.needsUpdate = true;

      // Update flow streamlines / filaments
      const filAttr = filamentGeom.attributes.position as THREE.BufferAttribute;
      const filArr = filAttr.array as Float32Array;
      for (let f = 0; f < FILAMENT_COUNT; f++) {
        const baseAngle = (f / FILAMENT_COUNT) * Math.PI * 2 + t * 0.4;
        const baseRadius = 150 + (f % 4) * 60;
        for (let p = 0; p < FILAMENT_POINTS; p++) {
          const idx = (f * FILAMENT_POINTS + p) * 3;
          const arc = baseAngle + p * 0.08;
          const r = baseRadius + Math.sin(p * 0.3 + t * 2) * 25 * audioPulse;
          filArr[idx] = Math.cos(arc) * r;
          filArr[idx + 1] = Math.sin(p * 0.4 + t * 3 + f) * 35;
          filArr[idx + 2] = Math.sin(arc) * r;
        }
      }
      filAttr.needsUpdate = true;

      // Smooth camera interpolation
      camera.position.x += (targetCameraX - camera.position.x) * 0.04;
      camera.position.y += (targetCameraY - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);

      // Orbital rings rotation
      orbitalGroup.rotation.z = t * 0.2;
      orbitalGroup.rotation.y = t * 0.15;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      flowGeom.dispose();
      flowMaterial.dispose();
      filamentGeom.dispose();
      filamentMaterial.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Subtle Flow Runtime Visual HUD Overlay (Top-Right or Bottom-Right) */}
      <div className="absolute bottom-10 right-4 pointer-events-auto z-20">
        <div className="flex items-center gap-1.5 bg-[#030a16]/85 backdrop-blur-md p-1 rounded-lg border border-[#42f5ff]/25 text-[9px] font-mono shadow-lg">
          <button
            type="button"
            onClick={() => setShowControls(!showControls)}
            title="Toggle Flow Runtime Settings"
            className="px-2 py-1 rounded bg-[#061426] text-[#42f5ff] hover:text-white hover:bg-[#0a223e] flex items-center gap-1 transition cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#74ff9b] animate-ping" />
            <span className="font-bold">FLOW RUNTIME</span>
            <span className="text-[#8aa0b6]">({flowPreset.toUpperCase()})</span>
          </button>

          {showControls && (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-[#42f5ff]/20 animate-fadeIn">
              {/* Preset Selector */}
              <button
                type="button"
                onClick={() => setFlowPreset('spacetime')}
                className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                  flowPreset === 'spacetime'
                    ? 'bg-[#42f5ff]/20 text-[#42f5ff] border border-[#42f5ff]/50 font-bold'
                    : 'text-[#8aa0b6] hover:text-white'
                }`}
              >
                SPACETIME
              </button>
              <button
                type="button"
                onClick={() => setFlowPreset('atmospheric')}
                className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                  flowPreset === 'atmospheric'
                    ? 'bg-[#74ff9b]/20 text-[#74ff9b] border border-[#74ff9b]/50 font-bold'
                    : 'text-[#8aa0b6] hover:text-white'
                }`}
              >
                ATMOSPHERIC
              </button>
              <button
                type="button"
                onClick={() => setFlowPreset('lemniscate')}
                className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                  flowPreset === 'lemniscate'
                    ? 'bg-[#f5ce70]/20 text-[#f5ce70] border border-[#f5ce70]/50 font-bold'
                    : 'text-[#8aa0b6] hover:text-white'
                }`}
              >
                LEMNISCATE
              </button>

              {/* Speed Toggle */}
              <button
                type="button"
                onClick={() => setFlowSpeed((prev) => (prev >= 2.0 ? 0.5 : prev + 0.5))}
                title="Toggle Flow Speed Multiplier"
                className="px-1.5 py-0.5 rounded bg-[#061426] text-white border border-[#42f5ff]/30 hover:border-[#42f5ff] transition cursor-pointer font-bold"
              >
                {flowSpeed}x
              </button>

              <button
                type="button"
                onClick={() => setShowControls(false)}
                className="text-[#8aa0b6] hover:text-white px-1 text-[10px] cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
