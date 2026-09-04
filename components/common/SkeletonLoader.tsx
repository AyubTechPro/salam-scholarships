'use client';

import { motion } from 'framer-motion';

export function OpportunityCardSkeleton() {
  return (
    <div className="bg-white dark:bg-navy-light border border-gray-200 dark:border-navy-lighter rounded-xl overflow-hidden shadow-lg animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-navy-lighter" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-navy-lighter rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-navy-lighter rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-navy-lighter rounded w-5/6" />
        <div className="flex space-x-2 mt-4">
          <div className="h-6 bg-gray-200 dark:bg-navy-lighter rounded w-20" />
          <div className="h-6 bg-gray-200 dark:bg-navy-lighter rounded w-24" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-navy-lighter rounded w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-navy-light rounded-xl p-6 border border-gray-200 dark:border-navy-lighter">
            <div className="h-4 bg-gray-200 dark:bg-navy-lighter rounded w-1/2 mb-4" />
            <div className="h-8 bg-gray-200 dark:bg-navy-lighter rounded w-1/3" />
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-navy-light rounded-xl p-6 border border-gray-200 dark:border-navy-lighter">
        <div className="h-6 bg-gray-200 dark:bg-navy-lighter rounded w-1/4 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-navy-lighter rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="h-14 bg-gradient-to-r from-brand-navy to-brand-navy/90" />
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={`h-16 border-t border-gray-200 flex items-center gap-4 px-6 ${
              i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            }`}
          >
            {Array.from({ length: cols }).map((_, j) => (
              <div
                key={j}
                className={`h-4 rounded ${
                  j === 0 ? 'w-48 bg-brand-gold/20' : j === cols - 1 ? 'w-24 bg-gray-200 ml-auto' : 'w-32 bg-gray-200'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
          <div className="h-48 bg-gray-200" />
          <div className="p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="flex space-x-2 mt-4">
              <div className="h-6 bg-gray-200 rounded w-20" />
              <div className="h-6 bg-gray-200 rounded w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

