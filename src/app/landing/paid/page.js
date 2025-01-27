"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const PaidMenfessLanding = () => {
  const [error, setError] = useState('');
  const [menfessData, setMenfessData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('initializing'); // initializing, pending, success, failed
  const [qrUrl, setQrUrl] = useState('');
  const [merchantRef, setMerchantRef] = useState('');
  const PAYMENT_AMOUNT = 1001;

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
    const initializePayment = async () => {
      try {
        // Check for existing payment session
        const existingPayment = localStorage.getItem('paymentSession');
        if (existingPayment) {
          const paymentData = JSON.parse(existingPayment);
          // Reuse existing payment data
          setQrUrl(paymentData.qrUrl);
          setMerchantRef(paymentData.merchantRef);
          setPaymentStatus('pending');
          
          // Start polling for existing payment
          const interval = setInterval(() => {
            checkTransactionStatus(paymentData.merchantRef);
          }, 5000);
          setPollInterval(interval);
          return;
        }

        const data = JSON.parse(localStorage.getItem('menfessData'));
        setMenfessData(data);

        // Only create new payment if no existing session
        const response = await fetch('/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error('Payment initialization failed');
        }

        const paymentData = await response.json();
        
        if (!paymentData.success) {
          throw new Error(paymentData.error || 'Failed to initialize payment');
        }

        // Store payment session
        localStorage.setItem('paymentSession', JSON.stringify({
          qrUrl: paymentData.qrUrl,
          merchantRef: paymentData.merchantRef,
          createdAt: new Date().toISOString()
        }));

        setQrUrl(paymentData.qrUrl);
        setMerchantRef(paymentData.merchantRef);
        setPaymentStatus('pending');

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
    <div className="min-h-screen bg-[#000072] text-white p-4">
      <nav className="flex justify-end space-x-4 mb-8">
        <a href="/" className="hover:underline">HOME</a>
        <a href="/about" className="hover:underline">ABOUT</a>
        <a href="/faq" className="hover:underline">FAQ</a>
      </nav>

      <div className="max-w-3xl mx-auto">
        {/* Logo section */}
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
          {error && (
            <div className="text-red-500 text-center">
              <p>{error}</p>
            </div>
          )}

          <div className="text-center space-y-4">
            <h4 className="text-2xl font-bold">PAID MENFESS</h4>
            <p className="text-lg">Amount to pay: Rp {PAYMENT_AMOUNT.toLocaleString()}</p>
            
            {paymentStatus === 'initializing' && (
              <div className="animate-pulse">
                <p>Initializing payment...</p>
                <p className="text-sm">Please wait while we prepare your QR code</p>
              </div>
            )}

            {paymentStatus === 'pending' && qrUrl && (
              <div className="space-y-6">
                <div className="bg-white/10 p-6 rounded-lg max-w-lg mx-auto">
                  <h5 className="text-xl mb-4">Scan QRIS to Pay</h5>
                  <div className="bg-white p-6 rounded-lg inline-block">
                    <img 
                      src={qrUrl}
                      alt="QRIS Payment QR Code"
                      className="mx-auto w-[300px] h-[300px]"
                    />
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="font-semibold">How to pay:</p>
                    <ol className="text-left list-decimal list-inside space-y-1">
                      <li>Open your mobile banking or e-wallet app</li>
                      <li>Choose QRIS/Scan QR payment option</li>
                      <li>Scan the QR code above</li>
                      <li>Check payment details and confirm</li>
                      <li>Payment will be verified automatically</li>
                    </ol>
                    <p className="text-yellow-300 mt-4">Payment will expire in 24 hours</p>
                    <p>After payment is completed:</p>
                    <ol className="text-left list-decimal list-inside space-y-1">
                      <li>Your payment will be verified automatically</li>
                      <li>Your menfess will be queued for posting</li>
                      <li>You will receive email notification when posted</li>
                    </ol>
                  </div>
                </div>
                
                <div className="text-xs text-gray-300">
                  <p>Supported payment methods:</p>
                  <p>GoPay, OVO, DANA, LinkAja, ShopeePay, and other QRIS-supported apps</p>
                </div>
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="text-[#80ffdb] space-y-4 bg-white/10 p-6 rounded-lg max-w-lg mx-auto">
                <div className="text-5xl">✅</div>
                <div>
                  <p className="text-xl font-bold">Payment successful!</p>
                  <p>Menfess anda akan dikirim pada pukul 20.00 atau 22.00 dan anda akan menerima notifikasi lewat email jika menfess anda sudah dikirim (tolong cek di junk email atau tandai sebagai BUKAN SAMPAH).</p>
                  <p>Jika dalam 3 hari menfess anda belum dikirim, mohon hubungi X:@satpam_itb.</p>
                </div>
                <a href="/" className="inline-block mt-4 px-6 py-2 bg-white text-[#000072] rounded-lg hover:bg-gray-100">
                  Back to Home
                </a>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="text-red-400 space-y-4 bg-white/10 p-6 rounded-lg max-w-lg mx-auto">
                <div className="text-5xl">❌</div>
                <div>
                  <p className="text-xl font-bold">Payment failed!</p>
                  <p>Jika saldo anda terpotong tolong hubungi X:@satpamitb.</p>
                </div>
                <a href="/" className="inline-block mt-4 px-6 py-2 bg-white text-[#000072] rounded-lg hover:bg-gray-100">
                  Try Again
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaidMenfessLanding;