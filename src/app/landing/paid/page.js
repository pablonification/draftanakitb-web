"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Script from 'next/script';

const PaidMenfessLanding = () => {
  const [error, setError] = useState('');
  const [menfessData, setMenfessData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('initializing'); // initializing, pending, success, failed
  const [qrUrl, setQrUrl] = useState('');
  const [merchantRef, setMerchantRef] = useState('');
  const PAYMENT_AMOUNT = 3001;

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
    <>
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
                      <p className="text-yellow-300 mt-4">Payment will expire in 30 minutes</p>
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
                    <p className="text-xl font-bold">Pembayaran Berhasil</p>
                    <div className="space-y-2 text-left mt-4">
                      <p>Terima kasih atas pembayaran Anda. Menfess Anda telah berhasil diproses.</p>
                      <p><strong>Apa selanjutnya?</strong></p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Menfess Anda akan dijadwalkan untuk diposting pada pukul 20:00 atau 22:00 WIB</li>
                        <li>Anda akan menerima notifikasi email saat menfess telah diposting</li>
                        <li>Mohon periksa folder spam/junk dan tandai email kami sebagai "Bukan Spam"</li>
                      </ul>
                      <p className="mt-4 text-yellow-300">
                        Catatan: Jika dalam waktu 3 hari menfess Anda belum diposting, silakan hubungi kami di <strong>@satpam_itb</strong> di X (Twitter) dan sertakan bukti pembayaran juga isi tweet yang kalian kirim.
                      </p>
                    </div>
                  </div>
                  <a href="/" className="inline-block mt-4 px-6 py-2 bg-white text-[#000072] rounded-lg hover:bg-gray-100">
                    Kembali ke Beranda
                  </a>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="text-red-400 space-y-4 bg-white/10 p-6 rounded-lg max-w-lg mx-auto">
                  <div className="text-5xl">❌</div>
                  <div>
                    <p className="text-xl font-bold">Pembayaran Gagal</p>
                    <div className="space-y-2 text-left mt-4">
                      <p>Mohon maaf, terjadi kendala dalam memproses pembayaran Anda.</p>
                      <p><strong>Apa yang harus dilakukan?</strong></p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Pastikan metode pembayaran Anda memiliki saldo yang cukup</li>
                        <li>Jika saldo Anda terpotong namun pembayaran gagal, segera hubungi kami di <strong>@satpam_itb</strong> di X (Twitter)</li>
                        <li>Anda dapat mencoba mengirim menfess kembali dengan metode pembayaran yang berbeda</li>
                      </ul>
                    </div>
                  </div>
                  <a href="/" className="inline-block mt-4 px-6 py-2 bg-white text-[#000072] rounded-lg hover:bg-gray-100">
                    Coba Lagi
                  </a>
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

export default PaidMenfessLanding;