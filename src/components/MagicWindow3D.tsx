import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface MagicWindow3DProps {
  interactive?: boolean;
}

export const MagicWindow3D: React.FC<MagicWindow3DProps> = ({ interactive = true }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Set up Three.js Scene, Camera, Renderer
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02050b, 0.0015);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Starfield Particle Geometry
    const particleCount = 1800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x42f5ff);
    const color2 = new THREE.Color(0x74ff9b);
    const color3 = new THREE.Color(0xf5ce70);
    const color4 = new THREE.Color(0xc084fc);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 1200;
      positions[i3 + 1] = (Math.random() - 0.5) * 1200;
      positions[i3 + 2] = (Math.random() - 0.5) * 1200;

      const mixed = color1.clone().lerp(
        i % 4 === 0 ? color2 : i % 4 === 1 ? color3 : color4,
        Math.random()
      );
      colors[i3] = mixed.r;
      colors[i3 + 1] = mixed.g;
      colors[i3 + 2] = mixed.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Orbital Rings
    const ringGroup = new THREE.Group();
    const ringRadii = [120, 180, 240, 310];
    ringRadii.forEach((r, idx) => {
      const ringGeom = new THREE.RingGeometry(r, r + 0.8, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: idx % 2 === 0 ? 0x42f5ff : 0x74ff9b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.18,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI * 0.35 + idx * 0.1;
      ring.rotation.y = idx * 0.2;
      ringGroup.add(ring);
    });
    scene.add(ringGroup);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      mouseX = (e.clientX - width / 2) * 0.15;
      mouseY = (e.clientY - height / 2) * 0.15;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      particles.rotation.y += 0.0006;
      particles.rotation.x += 0.0003;

      ringGroup.rotation.z += 0.001;
      ringGroup.rotation.y += 0.0007;

      camera.position.x += (mouseX - camera.position.x) * 0.03;
      camera.position.y += (-mouseY - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none z-0 overflow-hidden" />;
};
