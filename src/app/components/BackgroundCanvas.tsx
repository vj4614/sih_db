"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function BackgroundCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Circular particles
    const particles = new THREE.BufferGeometry();
    const particleCount = 600;
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }

    particles.setAttribute("position", new THREE.BufferAttribute(posArray, 3));

    // Create circular texture
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    const circleTexture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      map: circleTexture,
      transparent: true,
      color: 0x00aaff,
      size: 0.1,
      sizeAttenuation: true,
      alphaTest: 0.5,
    });

    const particleMesh = new THREE.Points(particles, material);
    scene.add(particleMesh);

    camera.position.z = 6;

    const animate = () => {
      requestAnimationFrame(animate);
      particleMesh.rotation.y += 0.0015;
      particleMesh.rotation.x += 0.0005;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      id="bg-canvas"
      className="fixed top-0 left-0 -z-10 w-full h-full pointer-events-none transition-all duration-500"
    />
  );
}
