import React from 'react';
import { Stethoscope } from 'lucide-react';

export default function Loader({ fullScreen = true }) {
  const containerClasses = fullScreen 
    ? "fixed inset-0 z-[9999] bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center transition-colors duration-500"
    : "w-full h-48 flex items-center justify-center";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Outer rotating ring */}
          <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-primary animate-spin"></div>
          {/* Inner pulsing icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-primary animate-pulse" />
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium tracking-wide animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
