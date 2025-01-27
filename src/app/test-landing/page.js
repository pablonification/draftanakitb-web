"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const TestLandingPage = () => {
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [isComplete, setIsComplete] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
    }
  }, [timeRemaining]);

  useEffect(() => {
    if (!isComplete) {
      const dotsTimer = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(dotsTimer);
    }
  }, [isComplete]);

  return (
    <div className="min-h-screen bg-[#000072] text-white p-4">
      <nav className="flex justify-end space-x-4 mb-8">
        <a href="/" className="hover:underline">HOME</a>
        <a href="/about" className="hover:underline">ABOUT</a>
        <a href="/faq" className="hover:underline">FAQ</a>
      </nav>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Image
            src="/logo.jpg"
            alt="DraftAnakITB Logo"
            width={100}
            height={100}
            className="mx-auto rounded-full"
            priority
          />
        </div>

        <div className="space-y-8">
          <div>
            <h4 className="text-xl font-bold text-center mb-4">
              {isComplete ? 'PLEASE WAIT' : `PLEASE WAIT${dots}`}
            </h4>
            <p className="text-center leading-relaxed">
              This is a test page for AdSense configuration.
            </p>
            <p className="text-center leading-relaxed">
              {!isComplete && `Tolong tunggu selama ${timeRemaining} detik sebelum menfess kamu terposting.`}
            </p>
          </div>

          {/* Google Adsense Placeholder */}
          <div className="bg-gray-200 p-4 rounded-md text-center">
            ADS
          </div>

          <div className="bg-gray-300 rounded-md h-4 relative">
            <div
              className="bg-blue-500 h-full rounded-md origin-left"
              style={{
                animation: 'progress 10s linear forwards',
                animationPlayState: isComplete ? 'paused' : 'running'
              }}
            ></div>
          </div>

          <style jsx>{`
            @keyframes progress {
              0% { width: 0%; }
              100% { width: 100%; }
            }
          `}</style>

          {isComplete && (
            <div className="text-center text-[#80ffdb]">
              <p>Test completed!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestLandingPage;
