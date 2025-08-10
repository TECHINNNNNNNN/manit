/**
 * COMPONENT: AnimatedBackground
 * PURPOSE: Creates animated geometric patterns for hero background
 * FLOW: Renders floating orbs and grid patterns with animations
 * DEPENDENCIES: React, CSS animations
 */

"use client";

import { useEffect, useRef } from "react";

export const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Floating particles
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: (Math.random() - 0.5) * 0.8,
        opacity: Math.random() * 0.7 + 0.3,
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particles with gradient
      particles.forEach((particle, index) => {
        // Create gradient for each particle
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        );
        
        // Alternate between orange and purple tones
        if (index % 3 === 0) {
          gradient.addColorStop(0, `rgba(255, 107, 53, ${particle.opacity})`);
          gradient.addColorStop(1, `rgba(255, 107, 53, 0)`);
        } else if (index % 3 === 1) {
          gradient.addColorStop(0, `rgba(255, 215, 0, ${particle.opacity})`);
          gradient.addColorStop(1, `rgba(255, 215, 0, 0)`);
        } else {
          gradient.addColorStop(0, `rgba(139, 92, 246, ${particle.opacity})`);
          gradient.addColorStop(1, `rgba(139, 92, 246, 0)`);
        }
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Update particle position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <>
      {/* Canvas for particles */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none opacity-80"
        style={{ zIndex: -1 }}
      />
      
      {/* Gradient orbs - more vivid */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -2 }}>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-500/30 via-amber-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/25 via-pink-500/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "4s" }} />
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gradient-to-br from-yellow-500/20 to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDelay: "3s" }} />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
      
    </>
  );
};