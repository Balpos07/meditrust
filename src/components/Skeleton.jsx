import React from 'react';

export default function Skeleton({ className = '' }) {
  return (
    <div className={`skeleton-pulse bg-slate-200 dark:bg-slate-800 rounded ${className}`} />
  );
}
