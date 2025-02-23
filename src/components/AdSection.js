import React from 'react';
import Image from 'next/image';
import { isAdEnabled, getAdConfig } from '@/config/ads';

const ArrowIcon = () => (
  <svg 
    className="w-4 h-4" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AdSection = ({ position, className }) => {
  // Check if ads are enabled for this position
  if (!isAdEnabled(position)) return null;

  // Get configuration for this position
  const config = getAdConfig(position);
  if (!config) return null;

  const { customContent } = config;

  return (
    <div className={`bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-6 rounded-xl text-center border border-white/5 ${className || ''}`}>
      <a 
        href={customContent.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:opacity-95 transition-all group"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-300 font-medium">{customContent.title}</h3>
          <div className="bg-blue-500/10 text-blue-300 py-1 px-2 rounded text-xs flex items-center gap-1.5 group-hover:bg-blue-500/20 transition-colors">
            <span>Learn More</span>
            <ArrowIcon />
          </div>
        </div>
        
        <div className="text-gray-400 text-sm mb-4 whitespace-pre-line text-left">{customContent.description}</div>
        
        {/* Custom Ad Content */}
        {customContent.imageUrl && (
          <div className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-lg">
            <Image
              src={customContent.imageUrl}
              alt={customContent.title}
              width={800}
              height={600}
              className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-300"
              priority={position === 'main-top'}
              onError={(e) => {
                // Fallback to text-only if image fails to load
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </a>
    </div>
  );
};

export default AdSection; 