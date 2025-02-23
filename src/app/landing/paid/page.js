"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import Head from 'next/head';
import { QRCodeSVG } from 'qrcode.react'; // use QRCodeSVG instead of QRCodeCanvas
import AdSection from '@/components/AdSection';

// Update Copyright component
const Copyright = () => (
  <div className="fixed bottom-0 left-0 right-0 py-4 border-t border-white/10 bg-[#000072]">
    <p className="normal-text text-center text-gray-400">
      © {new Date().getFullYear()} DraftAnakITB. All rights reserved.
    </p>
  </div>
);

// Update SVG icons with consistent sizing and styling
const ErrorIcon = () => (
  <svg 
    className="w-16 h-16 text-red-400 mx-auto" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const QRIcon = () => (
  <svg 
    className="w-8 h-8 text-blue-300" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Update TimerIcon with spinning animation
const TimerIcon = () => (
  <svg 
    className="w-8 h-8 text-yellow-300 animate-spin-slow" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WarningIcon = () => (
  <svg 
    className="w-8 h-8 text-yellow-300" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SuccessIcon = () => (
  <svg 
    className="w-12 h-12 text-green-400 mx-auto mb-2" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PaidMenfessLanding = () => {
  const [error, setError] = useState('');
  const [menfessData, setMenfessData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('initializing'); // initializing, pending, success, failed
  const [qrString, setQrString] = useState(''); // replaced qrUrl with qrString
  const [merchantRef, setMerchantRef] = useState('');
  const PAYMENT_AMOUNT = 2800;
  const [timeRemaining, setTimeRemaining] = useState(7); // 7 second countdown
  const [progress, setProgress] = useState(0);

  // Add polling interval state
  const [pollInterval, setPollInterval] = useState(null);

  // Add status checking function
  const checkTransactionStatus = async (ref) => {
    try {
      const response = await fetch(`/api/check-transaction?ref=${ref}`);
      const data = await response.json();
      
      if (data.status === 'PAID') {
        setPaymentStatus('success');
        localStorage.removeItem('paymentSession');
        if (pollInterval) clearInterval(pollInterval);
      } else if (data.status === 'FAILED' || data.status === 'EXPIRED') {
        setPaymentStatus('failed');
        localStorage.removeItem('paymentSession');
        if (pollInterval) clearInterval(pollInterval);
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
    }
  };

  useEffect(() => {
    if (paymentStatus === 'pending' && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
        setProgress((7 - timeRemaining + 1) * (100/7)); // Divide progress bar into 7 equal parts
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, paymentStatus]);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        // Always clear existing payment session
        localStorage.removeItem('paymentSession');
        
        const data = JSON.parse(localStorage.getItem('menfessData'));
        if (!data) {
          throw new Error('No menfess data found');
        }

        // Log the attachment data for debugging
        if (data.attachment) {
          console.log('Sending attachment:', {
            length: data.attachment.length,
            isBase64: data.attachment.includes('base64'),
            preview: data.attachment.substring(0, 50) + '...'
          });
        }

        // Always create new payment
        const response = await fetch('/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          },
          body: JSON.stringify({
            ...data,
            timestamp: Date.now() // Add timestamp to ensure uniqueness
          })
        });

        if (!response.ok) {
          throw new Error('Payment initialization failed');
        }

        const paymentData = await response.json();
        
        if (!paymentData.success) {
          throw new Error(paymentData.error || 'Failed to initialize payment');
        }

        // Retrieve qr_string from response header
        const qrStringFromHeader = response.headers.get('qr_string');
        if (!qrStringFromHeader) {
          throw new Error('QR string not found in response headers');
        }

        // Store payment session with qr_string from header
        localStorage.setItem('paymentSession', JSON.stringify({
          qrString: qrStringFromHeader,
          merchantRef: paymentData.merchantRef,
          createdAt: new Date().toISOString()
        }));

        setQrString(qrStringFromHeader);
        setMerchantRef(paymentData.merchantRef);
        setPaymentStatus('pending');
        setTimeRemaining(7); // Reset countdown to 7 seconds when payment is initialized

        // Start polling for new payment
        const interval = setInterval(() => {
          checkTransactionStatus(paymentData.merchantRef);
        }, 5000);
        setPollInterval(interval);

      } catch (error) {
        console.error('Error initializing payment:', error);
        setError(error.message || 'Failed to initialize payment');
        setPaymentStatus('failed');
      }
    };

    initializePayment();

    // Cleanup payment session on component unmount
    return () => {
      // Only clear if payment wasn't successful
      if (paymentStatus !== 'success') {
        localStorage.removeItem('paymentSession');
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, []); // Keep empty dependency array

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
              width={100}
              height={100}
              className="mx-auto shadow-lg transition-all-smooth"
              priority
            />
          </div>

          <div className="space-y-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 backdrop-blur-sm animate-fadeIn">
                <p className="normal-text text-red-400 text-center">{error}</p>
              </div>
            )}

            <div className="text-center space-y-6 animate-slideUp">
              <div className="space-y-3">
                <h4 className="text-3xl font-bold bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 bg-clip-text text-transparent hover-scale">
                  PAID MENFESS
                </h4>
                <p className="normal-text text-gray-300">
                  Amount to pay: <span className="text-2xl font-semibold bg-gradient-to-r from-blue-300 to-blue-200 bg-clip-text text-transparent animate-pulse-slow">Rp {PAYMENT_AMOUNT.toLocaleString()}</span>
                </p>
              </div>
              
              {paymentStatus === 'initializing' && (
                <div className="animate-pulse bg-gradient-to-br from-[#000080]/20 via-[#000072]/20 to-[#000060]/20 backdrop-blur-sm rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)] p-8 hover-scale">
                  <div className="flex items-center justify-center gap-4">
                    <TimerIcon />
                    <div className="text-left">
                      <p className="normal-text font-medium text-blue-200">Initializing payment...</p>
                      <p className="normal-text text-sm text-gray-400">Please wait while we prepare your QR code</p>
                    </div>
                  </div>
                </div>
              )}

              {paymentStatus === 'pending' && qrString && (
                <div className="bg-gradient-to-br from-[#000080]/20 via-[#000072]/20 to-[#000060]/20 backdrop-blur-sm rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)] overflow-hidden animate-fadeIn hover-scale">
                  {timeRemaining > 0 ? (
                    <div className="p-8 space-y-6">
                      <div className="flex items-center justify-center gap-4">
                        <TimerIcon />
                        <div className="text-left">
                          <p className="normal-text font-medium text-blue-200">
                            Please wait <span className="font-semibold text-blue-100">{timeRemaining}</span> seconds...
                          </p>
                          <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden mt-2">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-full transition-all duration-1000 ease-linear"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Show AdSection during countdown */}
                      <AdSection position="paid-landing" />
                    </div>
                  ) : (
                    <>
                      <div className="p-8 border-b border-white/10">
                        <div className="flex items-center justify-center gap-3 mb-8">
                          <QRIcon />
                          <h5 className="text-2xl font-semibold bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent">
                            Scan QRIS to Pay
                          </h5>
                        </div>
                        <div className="bg-white p-6 rounded-xl inline-block shadow-lg transition-all-smooth hover:scale-105">
                          <QRCodeSVG value={qrString} style={{ width: 250, height: 250 }} />
                        </div>
                      </div>

                      <div className="p-8 space-y-6">
                        <div className="flex items-start gap-4">
                          <TimerIcon />
                          <div className="flex-1 text-left">
                            <p className="normal-text font-medium text-blue-200">Payment Status</p>
                            <p className="normal-text text-gray-300">Waiting for your payment...</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <WarningIcon />
                          <div className="flex-1 text-left">
                            <p className="normal-text font-medium text-blue-200">Important Notes</p>
                            <ul className="normal-text text-gray-300 space-y-2 mt-2">
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                QR Code will expire in 5 minutes
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                Do not close this page until payment is completed
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                After payment, your menfess will be processed at 20.00 or 22.00 WIB in 3 days range
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="bg-gradient-to-br from-[#000080]/20 via-[#000072]/20 to-[#000060]/20 backdrop-blur-sm rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)] overflow-hidden animate-fadeIn hover-scale">
                  <div className="p-8 border-b border-white/10">
                    <ErrorIcon />
                    <h5 className="text-2xl font-bold text-red-400 mt-4">Payment Failed</h5>
                  </div>
                  <div className="p-8 space-y-6">
                    <p className="normal-text text-gray-300 text-center">
                      We apologize, but there was an issue processing your payment.
                    </p>
                    
                    {/* Show AdSection on payment failed */}
                    <AdSection position="paid-landing" />

                    <div className="bg-gradient-to-br from-[#000080]/30 via-[#000072]/30 to-[#000060]/30 rounded-xl p-6">
                      <p className="normal-text font-medium text-blue-200 mb-4">What should you do?</p>
                      <ul className="normal-text text-gray-300 space-y-3">
                        <li className="flex items-center gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                          Ensure your payment method has sufficient balance
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                          If your balance was deducted but payment failed, contact us at @satpam_itb on X (Twitter)
                        </li>
                        <li className="flex items-center gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                          You can try sending menfess again with a different payment method
                        </li>
                      </ul>
                    </div>
                    <div className="text-center mt-8">
                      <a 
                        href="/" 
                        className="inline-block min-w-[200px] px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        Try Again
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {paymentStatus === 'success' && (
                <div className="bg-gradient-to-br from-[#000080]/20 via-[#000072]/20 to-[#000060]/20 backdrop-blur-sm rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.3)] overflow-hidden animate-fadeIn">
                  <div className="p-4 sm:p-8 border-b border-white/10 text-center">
                    <div className="bg-green-500/10 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <SuccessIcon />
                    </div>
                    <h4 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-300 to-green-100 bg-clip-text text-transparent">
                      Payment Successful!
                    </h4>
                    <p className="text-sm sm:text-base text-gray-400 mt-2">
                      Thank you for using our paid menfess service
                    </p>
                  </div>

                  <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                    {/* Transaction Details */}
                    <div className="bg-gradient-to-br from-[#000080]/30 via-[#000072]/30 to-[#000060]/30 rounded-xl p-4 sm:p-6">
                      <h5 className="text-base sm:text-lg font-medium text-blue-200 mb-3 sm:mb-4">Transaction Details</h5>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm sm:text-base">
                          <span className="text-gray-400">Status</span>
                          <span className="text-green-400 font-medium">Completed</span>
                        </div>
                        <div className="flex items-center justify-between text-sm sm:text-base">
                          <span className="text-gray-400">Transaction ID</span>
                          <span className="text-blue-300 font-medium font-mono text-xs sm:text-sm break-all">{merchantRef}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm sm:text-base">
                          <span className="text-gray-400">Processing Time</span>
                          <span className="text-blue-300 text-right">20.00 or 22.00 WIB<br className="sm:hidden" /> in 3 days range</span>
                        </div>
                      </div>
                    </div>

                    {/* Important Information */}
                    <div className="bg-gradient-to-br from-[#000080]/30 via-[#000072]/30 to-[#000060]/30 rounded-xl p-4 sm:p-6">
                      {/* Screenshot Instructions - Moved to top */}
                      <div className="mb-4 sm:mb-6 bg-blue-500/10 p-3 sm:p-4 rounded-lg border border-blue-500/20">
                        <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                          <div className="flex-shrink-0 bg-yellow-500/10 p-1.5 sm:p-2 rounded-lg mt-0.5 sm:mt-0">
                            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm sm:text-base text-yellow-300 font-medium mb-1 sm:mb-2">SCREENSHOT THIS SECTION!</p>
                            <p className="text-xs sm:text-sm text-gray-300">You must take a screenshot of this information as proof for reporting any issues with your menfess.</p>
                          </div>
                        </div>
                      </div>

                      <h5 className="text-base sm:text-lg font-medium text-blue-200 mb-3 sm:mb-4 flex items-center gap-2">
                        <div className="bg-blue-500/10 p-1.5 rounded-lg">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        Important Information
                      </h5>

                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="flex-shrink-0 bg-blue-500/10 p-1.5 rounded-lg mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                          </div>
                          <div className="text-sm sm:text-base text-gray-300">
                            <p>Your menfess will be processed and posted at <span className="text-blue-300 font-medium">20.00</span> or <span className="text-blue-300 font-medium">22.00 WIB</span></p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="flex-shrink-0 bg-blue-500/10 p-1.5 rounded-lg mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                          </div>
                          <div className="text-sm sm:text-base text-gray-300">
                            <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <span>Your Transaction ID (save this):</span>
                              <span className="text-blue-300 font-mono bg-blue-500/10 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm break-all">{merchantRef}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className="flex-shrink-0 bg-blue-500/10 p-1.5 rounded-lg mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                          </div>
                          <div className="text-sm sm:text-base text-gray-300">
                            <p>If your menfess is not posted within 3 days, contact <a href="https://twitter.com/satpam_itb" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 transition-colors">@satpam_itb</a> with your screenshot</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Show AdSection */}
                    <AdSection position="paid-landing" />

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                      <a 
                        href="/"
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl text-center text-sm sm:text-base"
                      >
                        Back to Home
                      </a>
                      <button 
                        onClick={() => window.print()}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/10 transition-all duration-300 text-center text-sm sm:text-base"
                      >
                        Save Receipt
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9161286456755540"
        crossorigin="anonymous"
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
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
`;

// Add styles to the document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = globalStyles;
  document.head.appendChild(style);
}

export default PaidMenfessLanding;