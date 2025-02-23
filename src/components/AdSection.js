import React from 'react';
import Image from 'next/image';
import { isAdEnabled, getAdConfig } from '@/config/ads';

const AdSection = ({ position, className }) => {
  // Check if ads are enabled for this position
  if (!isAdEnabled(position)) return null;

  // Get configuration for this position
  const config = getAdConfig(position);
  if (!config) return null;

  const { customContent } = config;

  return (
    <div className={`bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-6 rounded-xl text-center border border-white/5 ${className || ''}`}>
      <h3 className="text-gray-300 font-medium mb-2">{customContent.title}</h3>
      <p className="text-gray-400 text-sm mb-4">{customContent.description}</p>
      
      {/* Custom Ad Content */}
      {customContent.link && (
        <a 
          href={customContent.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:opacity-90 transition-opacity"
        >
          {customContent.imageUrl ? (
            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg">
              <Image
                src={customContent.imageUrl}
                alt={customContent.title}
                width={1200}
                height={630}
                className="object-cover w-full h-full"
                priority={position === 'main-top'}
                onError={(e) => {
                  // Fallback to text-only if image fails to load
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="bg-gray-700/50 rounded-lg p-4 text-gray-300 hover:bg-gray-700/60 transition-colors">
              {customContent.title}
            </div>
          )}
        </a>
      )}
    </div>
  );
};

export default AdSection; 