/**
 * Premium 3D Interactive Globe Background
 * Uses SVG fallback by default for performance; 3D Globe only on desktop
 * Fix: polished/parseToRgb requires valid color strings (no "transparent")
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import GlobeErrorBoundary from '@/components/common/GlobeErrorBoundary';

// Dynamically import Globe - heavy bundle, load only when needed
const Globe = dynamic(
  () => import('react-globe.gl').then((mod) => mod.default || mod),
  {
    ssr: false,
    loading: () => <GlobeSVGFallback />,
  }
);

// Mobile SVG Fallback Component
function GlobeSVGFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
      <svg
        width="600"
        height="600"
        viewBox="0 0 600 600"
        className="w-full h-full max-w-4xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle */}
        <circle
          cx="300"
          cy="300"
          r="280"
          stroke="rgba(245, 158, 11, 0.3)"
          strokeWidth="1"
          fill="none"
        />
        {/* Latitude lines */}
        {[-60, -30, 0, 30, 60].map((lat, i) => {
          const radius = 280 * Math.cos((lat * Math.PI) / 180);
          const y = 300 + (280 * Math.sin((lat * Math.PI) / 180));
          return (
            <ellipse
              key={`lat-${i}`}
              cx="300"
              cy={y}
              rx={Math.abs(radius)}
              ry={Math.abs(radius) * 0.3}
              stroke="rgba(245, 158, 11, 0.25)"
              strokeWidth="0.5"
              fill="none"
            />
          );
        })}
        {/* Longitude lines */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((lon, i) => {
          const x1 = 300 + 280 * Math.cos((lon * Math.PI) / 180);
          const y1 = 300 + 280 * Math.sin((lon * Math.PI) / 180);
          const x2 = 300 - 280 * Math.cos((lon * Math.PI) / 180);
          const y2 = 300 - 280 * Math.sin((lon * Math.PI) / 180);
          return (
            <line
              key={`lon-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(245, 158, 11, 0.25)"
              strokeWidth="0.5"
            />
          );
        })}
        {/* Dots for data visualization feel */}
        {Array.from({ length: 50 }).map((_, i) => {
          const lat = (Math.random() - 0.5) * 180;
          const lon = Math.random() * 360;
          const x = 300 + 280 * Math.cos((lat * Math.PI) / 180) * Math.cos((lon * Math.PI) / 180);
          const y = 300 + 280 * Math.cos((lat * Math.PI) / 180) * Math.sin((lon * Math.PI) / 180);
          return (
            <circle
              key={`dot-${i}`}
              cx={x}
              cy={y}
              r="2"
              fill="rgba(245, 158, 11, 0.4)"
            />
          );
        })}
      </svg>
    </div>
  );
}

// Safe colors for polished/parseToRgb (hex, rgb, rgba only - no "transparent")
const SAFE_TRANSPARENT = 'rgba(0,0,0,0)';
const GOLD_RGBA = 'rgba(245,158,11,0.5)';

export default function GlobeBackground() {
  const [isMobile, setIsMobile] = useState(true); // Default true = use SVG until we know
  const [mounted, setMounted] = useState(false);
  const globeRef = useRef<any>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ lat: 0, lon: 0 });

  useEffect(() => {
    setMounted(true);
    
    // Use SVG for mobile and tablets (< 1280px) - faster load, avoids Globe color/weight issues
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280 || window.matchMedia('(pointer: coarse)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile || !mounted) return;

    let animationId: number;
    let checkGlobeInterval: NodeJS.Timeout;

    // Mouse parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Wait for globe to be ready, then start animation
    const startAnimation = () => {
      // Smooth rotation with mouse influence
      const animate = () => {
        if (globeRef.current) {
          rotationRef.current.lon += 0.05; // Slower auto-rotate for cinematic feel
          rotationRef.current.lat += mouseRef.current.y * 0.005; // Subtle mouse influence
          rotationRef.current.lon += mouseRef.current.x * 0.005;

          // Clamp rotation to prevent excessive spinning
          rotationRef.current.lat = Math.max(-30, Math.min(30, rotationRef.current.lat));

          globeRef.current.pointOfView({
            lat: rotationRef.current.lat,
            lng: rotationRef.current.lon,
            altitude: 2.5,
          }, 100); // Smooth transition
        }
        animationId = requestAnimationFrame(animate);
      };
      animate();
    };

    // Check if globe is ready
    checkGlobeInterval = setInterval(() => {
      if (globeRef.current) {
        clearInterval(checkGlobeInterval);
        startAnimation();
      }
    }, 100);

    // Timeout fallback
    setTimeout(() => {
      if (checkGlobeInterval) {
        clearInterval(checkGlobeInterval);
      }
      if (globeRef.current) {
        startAnimation();
      }
    }, 2000);

    return () => {
      if (checkGlobeInterval) {
        clearInterval(checkGlobeInterval);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isMobile, mounted]);

  // Generate wireframe points once (memoized)
  const [pointsData] = useState(() => {
    const N = 60;
    return Array.from({ length: N }, () => ({
      lat: (Math.random() - 0.5) * 180,
      lng: (Math.random() - 0.5) * 360,
      size: Math.random() * 1.5 + 0.5,
    }));
  });

  const arcsData: any[] = [];

  // Mobile or not mounted: use fast SVG fallback (avoids 3D load + color parse issues)
  if (isMobile || !mounted) {
    return <GlobeSVGFallback />;
  }

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden opacity-30" 
      style={{ 
        zIndex: 0,
        // Position globe to the right side, behind content
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: '10%',
      }}
    >
      <div style={{ width: '600px', height: '600px', maxWidth: '50vw' }}>
        <GlobeErrorBoundary fallback={<GlobeSVGFallback />}>
        <Globe
          ref={globeRef}
          globeImageUrl={null}
          backgroundImageUrl={null}
          backgroundColor={SAFE_TRANSPARENT}
          showAtmosphere={false}
          showGraticules={true}
          pointsData={pointsData}
          pointColor={GOLD_RGBA}
          pointRadius={0.6}
          pointLabel=""
          arcsData={arcsData}
          arcColor="rgba(245,158,11,0.2)"
          arcDashLength={0.4}
          arcDashGap={0.4}
          arcDashAnimateTime={0}
          ringsData={[]}
          ringColor="rgba(245,158,11,0.15)"
          ringMaxRadius={2}
          ringPropagationSpeed={0}
          ringRepeatPeriod={0}
          // Wireframe style
          lineHoverPrecision={0}
          // Initial position set via ref in useEffect
          // Styling - responsive
          width={typeof window !== 'undefined' ? Math.min(600, window.innerWidth * 0.5) : 600}
          height={typeof window !== 'undefined' ? Math.min(600, window.innerHeight * 0.8) : 600}
          // Performance
          rendererConfig={{
            antialias: false, // Disable for better performance
            alpha: true,
            preserveDrawingBuffer: false,
          }}
        />
        </GlobeErrorBoundary>
      </div>
      {/* Overlay gradient to ensure text readability on left side */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(10, 25, 47, 0.7) 0%, rgba(10, 25, 47, 0.3) 50%, transparent 100%)',
        }}
      />
    </div>
  );
}

