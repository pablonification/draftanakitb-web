"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const PaidMenfessLanding = () => {
  const [error, setError] = useState('');
  const [menfessData, setMenfessData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('initializing'); // initializing, pending, success, failed
  const [qrUrl, setQrUrl] = useState('');
  const [merchantRef, setMerchantRef] = useState('');
  const PAYMENT_AMOUNT = 3000;

  // Add mounted check to prevent checks after component unmount
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const data = JSON.parse(localStorage.getItem('menfessData'));
        setMenfessData(data);

        // Change endpoint from '/api/init-payment' to '/payment'
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

        setQrUrl(paymentData.qrUrl);
        setMerchantRef(paymentData.merchantRef);
        setPaymentStatus('pending');

      } catch (error) {
        console.error('Error initializing payment:', error);
        setError(error.message || 'Failed to initialize payment');
        setPaymentStatus('failed');
      }
    };

    initializePayment();
  }, []);

  // Check payment status every 5 seconds
  useEffect(() => {
    let checkInterval;
    
    if (isMounted && paymentStatus === 'pending' && merchantRef) {
      checkInterval = setInterval(async () => {
        try {
          const response = await fetch('/api/check-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ merchantRef })
          });
          
          // Stop checking if component is unmounted
          if (!isMounted) {
            clearInterval(checkInterval);
            return;
          }

          const data = await response.json();
          
          if (data.status === 'PAID') {
            setPaymentStatus('success');
            // Clear stored data
            localStorage.removeItem('menfessData');
          }
        } catch (error) {
          console.error('Error checking payment:', error);
        }
      }, 5000);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [paymentStatus, merchantRef, isMounted]);

  return (
    <div className="min-h-screen bg-[#000072] text-white p-4">
      <nav className="flex justify-end space-x-4 mb-8">
        <a href="/" className="hover:underline">HOME</a>
        <a href="/about" className="hover:underline">ABOUT</a>
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
                    <p className="animate-pulse">Waiting for payment confirmation...</p>
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
                  <p>Your menfess will be posted shortly.</p>
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
                  <p>Please try again or use a different payment method.</p>
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