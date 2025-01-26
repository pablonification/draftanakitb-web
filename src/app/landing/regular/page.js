"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const RegularMenfessLanding = () => {
  const [timeRemaining, setTimeRemaining] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [dots, setDots] = useState('');
  const [error, setError] = useState('');
  const [menfessData, setMenfessData] = useState(null);
  const [errorDetails, setErrorDetails] = useState({
    type: null, // 'personal' or 'global'
    nextAvailable: null
  });

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
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
      handleTweetSend();
    }
  }, [timeRemaining]);

  useEffect(() => {
    // Dots animation effect
    if (!isComplete) {
      const dotsTimer = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(dotsTimer);
    }
  }, [isComplete]);

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
          const nextAvailable = new Date();
          nextAvailable.setDate(nextAvailable.getDate() + 7); // Add 7 days
          
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
          throw new Error('Batas personal tercapai');
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
          throw new Error('Batas global tercapai');
        }
        
        throw new Error(data.error || 'Failed to send tweet');
      }

      localStorage.removeItem('menfessData');
      setIsComplete(true);

    } catch (error) {
      console.error('Error sending tweet:', error);
      setError(error.message);
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
      localStorage.setItem('menfessData', JSON.stringify(updatedMenfessData));
      window.location.href = '/landing/paid';
    } catch (error) {
      console.error('Error switching to paid menfess:', error);
    }
  };

  const renderErrorMessage = () => {
    if (!error) return null;

    return (
      <div className="bg-red-900/50 p-6 rounded-lg text-center space-y-4">
        <p className="text-xl font-bold text-red-400">
          Menfess Gagal Terkirim
        </p>
        
        {errorDetails.type === 'personal' && (
          <div className="space-y-3">
            <div className="bg-blue-900/30 p-4 rounded-lg">
              <p className="text-sm text-gray-300 mb-2">⚠️ Informasi Batasan:</p>
              <p>Setiap pengguna hanya dapat mengirim 1 regular menfess per minggu karena kebijakan Twitter/X yang membatasi pengiriman tweet melalui API sebanyak 17 tweets per hari.</p>
            </div>
            <p>Kamu sudah mencapai batas pengiriman regular menfess minggu ini.</p>
            <p className="text-sm text-gray-300">
              Kamu dapat mengirim regular menfess lagi pada:
              <br />
              <span className="font-bold text-blue-300">{errorDetails.nextAvailable}</span>
            </p>
          </div>
        )}

        {errorDetails.type === 'global' && (
          <div className="space-y-3">
            <div className="bg-blue-900/30 p-4 rounded-lg">
              <p className="text-sm text-gray-300 mb-2">⚠️ Informasi Batasan Twitter:</p>
              <p>Karena kebijakan baru Twitter/X, kami dibatasi hanya dapat mengirim 17 tweets per hari melalui API. Mohon maaf atas ketidaknyamanannya.</p>
            </div>
            <p>Batas global regular menfess hari ini sudah tercapai.</p>
            <p className="text-sm text-gray-300">
              Regular menfess akan dibuka kembali pada:
              <br />
              <span className="font-bold text-blue-300">{errorDetails.nextAvailable}</span>
            </p>
          </div>
        )}

        <div className="space-y-4 pt-4">
          <p className="text-sm text-gray-300">
            Tidak ingin menunggu? Gunakan layanan paid menfess untuk mengirim pesan sekarang.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleSwitchToPaid}
              className="px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Kirim sebagai Paid Menfess
            </button>
            <a 
              href="/"
              className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#000072] text-white p-4">
      <nav className="flex justify-end space-x-4 mb-8">
        <a href="/" className="hover:underline">HOME</a>
        <a href="/about" className="hover:underline">ABOUT</a>
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
          {error ? (
            renderErrorMessage()
          ) : (
            <>
              <div>
                <h4 className="text-xl font-bold text-center mb-4">
                  {isComplete ? 'PLEASE WAIT' : `PLEASE WAIT${dots}`}
                </h4>
                <p className="text-center leading-relaxed">
                  Menfess kamu akan dikirim ke Twitter sesaat lagi. 
                </p>
                <p className="text-center leading-relaxed">
                  {!isComplete && `Tolong tunggu selama ${timeRemaining} detik sebelum menfess kamu terposting.`}
                </p>
              </div>

              {/* Google Adsense Placeholder */}
              <div className="bg-gray-200 p-4 rounded-md text-center">
                ADS PLACEHOLDER
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
                  0% {
                    width: 0%;
                  }
                  100% {
                    width: 100%;
                  }
                }
              `}</style>

              {isComplete && (
                <div className="text-center text-[#80ffdb]">
                  <p>Menfess berhasil dikirim!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegularMenfessLanding;