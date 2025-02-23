"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import Head from 'next/head';
import AdSection from '@/components/AdSection';

// Update Copyright component
const Copyright = () => (
  <div className="fixed bottom-0 left-0 right-0 py-4 border-t border-white/10 bg-[#000072]">
    <p className="normal-text text-center text-gray-400">
      © {new Date().getFullYear()} DraftAnakITB. All rights reserved.
    </p>
  </div>
);

// Add custom SVG icons
const SuccessIcon = () => (
  <svg 
    className="w-16 h-16 text-green-400 mx-auto mb-4" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const TimerIcon = () => (
  <svg 
    className="w-6 h-6 text-blue-300 animate-spin-slow" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const InfoIcon = () => (
  <svg 
    className="w-6 h-6 text-yellow-300" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Add PaidMenfessWarningModal component
const PaidMenfessWarningModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm" 
          onClick={onClose}
        ></div>

        <div className="relative inline-block w-full max-w-lg p-8 overflow-hidden text-left align-middle transition-all transform bg-gradient-to-b from-[#000072] to-[#000050] rounded-xl shadow-2xl border border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-start gap-4 mb-6">
            <div className="bg-yellow-500/10 p-2 rounded-lg">
              <svg className="w-6 h-6 text-yellow-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Important Notice</h3>
              <p className="text-gray-300 mt-2">
                Your paid menfess will be processed and posted at <span className="text-blue-300 font-medium">20.00</span> or <span className="text-blue-300 font-medium">22.00 WIB</span> within a <span className="text-blue-300 font-medium">3-day range</span> from submission.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#000080]/30 via-[#000072]/30 to-[#000060]/30 rounded-xl p-6">
            <p className="text-gray-300">
              While we aim to process your menfess as soon as possible, please expect some delay. However, we guarantee it will be posted within the 3-day timeframe.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RegularMenfessLanding = () => {
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [menfessData, setMenfessData] = useState(null);
  const [errorDetails, setErrorDetails] = useState({
    type: null, // 'personal' or 'global'
    nextAvailable: null
  });
  const [tweetId, setTweetId] = useState(null);
  const [showPaidWarning, setShowPaidWarning] = useState(false);
  const [pendingMenfessData, setPendingMenfessData] = useState(null);

  useEffect(() => {
    // Load menfess data from localStorage
    try {
      const data = JSON.parse(localStorage.getItem('menfessData'));
      if (!data) {
        window.location.href = '/';
        return;
      }
      setMenfessData(data);
    } catch (error) {
      console.error('Error loading menfess data:', error);
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
        setProgress((10 - timeRemaining + 1) * 10);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
      handleTweetSend();
    }
  }, [timeRemaining]);

  const handleTweetSend = async () => {
    if (!menfessData) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: menfessData.email,
          message: menfessData.message,
          type: 'regular',
          attachment: menfessData.attachment
        })
      });

      const data = await response.json();
      
      if (!data.success) {
        if (data.error === 'PERSONAL_LIMIT_EXCEEDED') {
          const nextAvailable = new Date(data.nextAvailable);
          
          setErrorDetails({
            type: 'personal',
            nextAvailable: nextAvailable.toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          });
          setError('Personal limit exceeded');
          return;
        }
        
        if (data.error === 'GLOBAL_LIMIT_EXCEEDED') {
          const nextAvailable = new Date();
          nextAvailable.setHours(24, 0, 0, 0); // Set to next day midnight
          
          setErrorDetails({
            type: 'global',
            nextAvailable: nextAvailable.toLocaleDateString('id-ID', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          });
          setError('Global limit exceeded');
          return;
        }
        
        setError(data.error || 'Failed to send tweet');
        return;
      }

      localStorage.removeItem('menfessData');
      setIsComplete(true);
      setTweetId(data.tweetId);

    } catch (error) {
      console.error('Error sending tweet:', error);
      setError(error.message || 'An unexpected error occurred');
    }
  };

  const handleSwitchToPaid = async () => {
    if (!menfessData) return;
    
    try {
      // Use the same menfess data but change the type to paid
      const updatedMenfessData = {
        ...menfessData,
        type: 'paid'
      };
      
      // Store the updated data and show warning
      setPendingMenfessData(updatedMenfessData);
      setShowPaidWarning(true);
    } catch (error) {
      console.error('Error switching to paid menfess:', error);
    }
  };

  const handlePaidWarningConfirm = () => {
    if (!pendingMenfessData) return;
    
    localStorage.setItem('menfessData', JSON.stringify(pendingMenfessData));
    window.location.href = '/landing/paid';
  };

  const renderErrorMessage = () => {
    if (errorDetails.type === 'personal') {
      return (
        <div className="bg-gradient-to-br from-[#000080]/20 via-[#000072]/20 to-[#000060]/20 backdrop-blur-sm rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)] overflow-hidden">
          <div className="p-8 border-b border-white/10">
            <div className="flex items-center justify-center gap-4">
              <InfoIcon />
              <h4 className="text-2xl font-semibold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
                Personal Limit Reached
              </h4>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <p className="normal-text text-gray-300">
                You have reached your personal menfess limit. You can send another regular menfess on:
              </p>
              <p className="text-lg font-semibold text-blue-200">
                {errorDetails.nextAvailable}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-[#000080]/30 via-[#000072]/30 to-[#000060]/30 rounded-xl p-6">
              <p className="normal-text font-medium text-blue-200 mb-4">Options available:</p>
              <ul className="normal-text text-gray-300 space-y-3">
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Use paid menfess to send your message immediately
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Wait until the next available time for regular menfess
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSwitchToPaid}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Switch to Paid Menfess
              </button>
              <a 
                href="/"
                className="px-6 py-2.5 border border-white/20 text-white rounded-lg hover:bg-white/10 shadow-lg hover:shadow-xl text-center"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    if (errorDetails.type === 'global') {
      return (
        <div className="bg-gradient-to-br from-[#000080]/20 via-[#000072]/20 to-[#000060]/20 backdrop-blur-sm rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)] overflow-hidden">
          <div className="p-8 border-b border-white/10">
            <div className="flex items-center justify-center gap-4">
              <InfoIcon />
              <h4 className="text-2xl font-semibold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
                Daily Limit Reached
              </h4>
            </div>
          </div>
          <div className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <p className="normal-text text-gray-300">
                The daily limit for regular menfess has been reached. Regular menfess will be available again on:
              </p>
              <p className="text-lg font-semibold text-blue-200">
                {errorDetails.nextAvailable}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-[#000080]/30 via-[#000072]/30 to-[#000060]/30 rounded-xl p-6">
              <p className="normal-text font-medium text-blue-200 mb-4">What can you do?</p>
              <ul className="normal-text text-gray-300 space-y-3">
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Use paid menfess to bypass the daily limit
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Try again tomorrow during regular hours
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSwitchToPaid}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Switch to Paid Menfess
              </button>
              <a 
                href="/"
                className="px-6 py-2.5 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    // Default error message
    return (
      <div className="bg-gradient-to-br from-[#000080]/20 via-[#000072]/20 to-[#000060]/20 backdrop-blur-sm rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)] overflow-hidden">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center justify-center gap-4">
            <InfoIcon />
            <h4 className="text-2xl font-semibold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
              Regular Menfess Unavailable
            </h4>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <p className="normal-text text-center text-gray-300">
            Don't want to wait? Use paid menfess to send your message immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSwitchToPaid}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Switch to Paid Menfess
            </button>
            <a 
              href="/"
              className="px-6 py-2.5 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" 
        />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-[#000072] via-[#000060] to-[#000045] text-white p-4 pb-16">
        <nav className="max-w-7xl mx-auto flex justify-end space-x-6 mb-12 px-4 animate-slideUp">
          <a href="/" className="text-gray-300 hover:text-white transition-all-smooth hover-scale">HOME</a>
          <a href="/about" className="text-gray-300 hover:text-white transition-all-smooth hover-scale">ABOUT</a>
          <a href="/faq" className="text-gray-300 hover:text-white transition-all-smooth hover-scale">FAQ</a>
        </nav>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 hover-scale">
            <Image
              src="/logo.jpg"
              alt="DraftAnakITB Logo"
              width={120}
              height={120}
              className="mx-auto shadow-lg transition-all-smooth"
              priority
            />
          </div>

          <div className="space-y-8">
            {error ? (
              <div className="animate-fadeIn">
                {renderErrorMessage()}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-[#000080]/20 via-[#000072]/20 to-[#000060]/20 backdrop-blur-sm rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)] overflow-hidden animate-slideUp hover-scale">
                <div className="p-8 border-b border-white/10">
                  <div className="flex items-center justify-center gap-4">
                    <TimerIcon />
                    <h4 className="text-2xl font-semibold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
                      {isComplete ? 'PROCESSING' : `SENDING`}
                    </h4>
                  </div>
                  <div className="mt-6 space-y-3 text-center">
                    <p className="normal-text text-gray-300">
                      Your menfess will be sent to Twitter shortly.
                    </p>
                    {!isComplete && (
                      <div className="space-y-6">
                        <p className="normal-text text-blue-200">
                          Please wait <span className="font-semibold text-blue-100">{timeRemaining}</span> seconds before your menfess is posted.
                        </p>
                        <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-full transition-all duration-1000 ease-linear"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* Replace Google Adsense Placeholder with AdSection */}
                  <AdSection position="regular-landing" />

                  {isComplete && (
                    <div className="text-center transform scale-100 animate-fadeIn">
                      <div className="flex flex-col items-center justify-center animate-slideUp">
                        <SuccessIcon />
                        <p className="normal-text text-green-300 font-medium animate-fadeIn">
                          Menfess sent successfully!
                        </p>
                        {tweetId && (
                          <a 
                            href={`https://twitter.com/DraftAnakITB/status/${tweetId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/20 hover:bg-blue-500/30 transition-all"
                          >
                            View Tweet
                          </a>
                        )}
                      </div>
                      <div className="mt-6 flex justify-center">
                        <a 
                          href="/"
                          className="hidden sm:block px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all-smooth shadow-lg hover:shadow-xl text-center hover-scale"
                        >
                          Back to Home
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9161286456755540"
        crossorigin="anonymous"
      />
      <PaidMenfessWarningModal 
        isOpen={showPaidWarning}
        onClose={() => setShowPaidWarning(false)}
        onConfirm={handlePaidWarningConfirm}
      />
    </>
  );
};

// Move global styles here, outside of the component
const globalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }

  .animate-slideUp {
    animation: slideUp 0.6s ease-out forwards;
  }

  .animate-pulse-slow {
    animation: pulse 2s ease-in-out infinite;
  }

  .animate-spin-slow {
    animation: spin 2s linear infinite;
  }

  .animate-shimmer {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }

  .transition-all-smooth {
    transition: all 0.3s ease-in-out;
  }

  .hover-scale {
    transition: transform 0.2s ease-in-out;
  }
  
  .hover-scale:hover {
    transform: scale(1.02);
  }
`;

// Add styles to the document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = globalStyles;
  document.head.appendChild(style);
}

export default RegularMenfessLanding;