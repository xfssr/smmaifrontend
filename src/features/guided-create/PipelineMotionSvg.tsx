import React from 'react';

interface PipelineMotionSvgProps {
  className?: string;
}

const PipelineMotionSvg: React.FC<PipelineMotionSvgProps> = ({ className }) => {
  return (
    <div className={`absolute inset-0 h-full w-full overflow-hidden pointer-events-none ${className || ''}`}>
      <div className="absolute top-[-12%] right-[-24%] h-[320px] w-[320px] rounded-full bg-[#E65F2B]/5 blur-[86px]" />
      <div className="absolute bottom-[12%] left-[-22%] h-[260px] w-[260px] rounded-full bg-white/[0.03] blur-[100px]" />

      <svg className="h-full w-full text-white opacity-[0.025]" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <pattern id="pipeline-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <linearGradient id="pipeline-wave" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#FF9F1C" stopOpacity="0.65" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#pipeline-grid)" />
        <path
          d="M-80 70 C 20 20, 100 125, 210 72 S 390 42, 520 92"
          fill="none"
          stroke="url(#pipeline-wave)"
          strokeWidth="2"
          strokeDasharray="34 180"
        >
          <animate attributeName="stroke-dashoffset" values="214;0" dur="7s" repeatCount="indefinite" />
        </path>
      </svg>
    </div>
  );
};

export default PipelineMotionSvg;
