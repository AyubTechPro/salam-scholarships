'use client';

type GlobeWatermarkProps = {
  size?: number;
  opacity?: number;
  className?: string;
  color?: string;
};

/**
 * Globe Watermark Component - Reuses the Globe icon from the Logo
 * Used as background watermark or loading spinner
 */
export default function GlobeWatermark({ 
  size = 200, 
  opacity = 0.05, 
  className = '',
  color = '#0a192f' 
}: GlobeWatermarkProps) {
  const center = size / 2;
  const radius = size * 0.4;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity }}
    >
      {/* Outer Circle */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke={color}
        strokeWidth={size * 0.08}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Latitude Lines (Horizontal) */}
      <ellipse
        cx={center}
        cy={center - radius * 0.5}
        rx={radius * 0.866}
        ry={radius * 0.25}
        stroke={color}
        strokeWidth={size * 0.06}
        fill="none"
      />
      <ellipse
        cx={center}
        cy={center + radius * 0.5}
        rx={radius * 0.866}
        ry={radius * 0.25}
        stroke={color}
        strokeWidth={size * 0.06}
        fill="none"
      />
      <ellipse
        cx={center}
        cy={center}
        rx={radius * 0.966}
        ry={radius * 0.3}
        stroke={color}
        strokeWidth={size * 0.07}
        fill="none"
      />

      {/* Longitude Lines (Vertical Curves) */}
      <path
        d={`M ${center} ${center - radius} Q ${center + radius * 0.6} ${center} ${center} ${center + radius}`}
        stroke={color}
        strokeWidth={size * 0.06}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M ${center} ${center - radius} Q ${center - radius * 0.6} ${center} ${center} ${center + radius}`}
        stroke={color}
        strokeWidth={size * 0.06}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M ${center - radius * 0.866} ${center - radius * 0.5} Q ${center} ${center - radius * 0.2} ${center + radius * 0.866} ${center - radius * 0.5}`}
        stroke={color}
        strokeWidth={size * 0.05}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M ${center - radius * 0.866} ${center + radius * 0.5} Q ${center} ${center + radius * 0.2} ${center + radius * 0.866} ${center + radius * 0.5}`}
        stroke={color}
        strokeWidth={size * 0.05}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

