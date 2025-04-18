"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import OtpHelpModal from '../../components/OtpHelpModal';
import Script from 'next/script';
import AdSection from '@/components/AdSection';
import Navbar from '@/components/Navbar';

// Whitelist constant at the top (sama dengan yang ada di page.js)
const WHITELISTED_EMAILS = ['arqilasp@gmail.com'];

// Dev mode setting for testing
const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

// Help Circle Icon
const HelpCircleIcon = () => (
  <svg 
    className="w-3 h-3" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 17h.01" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// OTP Help Button
const OtpHelpButton = ({ onClick }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className="ml-2 text-blue-300 hover:text-blue-200 transition-colors flex items-center gap-1.5 group"
  >
    <HelpCircleIcon />
    <span className="normal-text group-hover:underline">Bantuan OTP</span>
  </button>
);

// Warning Icon
const WarningIcon = () => (
  <svg 
    className="w-5 h-5 text-yellow-400" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Delete Icon
const DeleteIcon = () => (
  <svg 
    className="w-5 h-5 text-red-400" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Vote Counter Component
const VoteCounter = ({ count, threshold }) => {
  const percentage = Math.min((count / threshold) * 100, 100);
  
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-300">{count} dari {threshold} vote</span>
        <span className="text-sm text-blue-300">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div 
          className="bg-blue-500 h-2.5 rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// Main component
const DelVotePage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [reason, setReason] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false); // Tracking OTP verification separately
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [showOtpHelp, setShowOtpHelp] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [voteCount, setVoteCount] = useState(0);
  const VOTE_THRESHOLD = 10;

  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => {
        setCooldownTime(cooldownTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (cooldownTime === 0 && isRateLimited) {
      setIsRateLimited(false);
    }
  }, [cooldownTime, isRateLimited]);

  const startOtpCooldown = () => {
    setIsRateLimited(true);
    setCooldownTime(60); // 1 minute cooldown for OTP requests
  };

  const validateEmail = (email) => {
    // Allow any email in dev mode
    if (DEV_MODE) {
      return true;
    }
    
    // Allow whitelisted emails to bypass the validation
    if (WHITELISTED_EMAILS.includes(email)) {
      return true;
    }
    return email.endsWith('@mahasiswa.itb.ac.id');
  };

  const validateTwitterUrl = (url) => {
    // In dev mode, accept any URL for testing
    if (DEV_MODE) {
      // Still enforce basic URL validation
      return url.startsWith('http') && (url.includes('twitter.com/') || url.includes('x.com/'));
    }
    
    // Strict validation for DraftAnakITB tweets
    const pattern = /^https:\/\/x\.com\/DraftAnakITB\/status\/\d+/;
    // Also accept twitter.com for backward compatibility
    const patternTwitter = /^https:\/\/twitter\.com\/DraftAnakITB\/status\/\d+/;
    return pattern.test(url) || patternTwitter.test(url);
  };

  const handleVerifyEmail = async () => {
    // In dev mode, auto-verify immediately without sending OTP
    if (DEV_MODE) {
      console.log('DEV MODE: Auto-verifying email without OTP');
      setIsEmailVerified(true);
      setIsOtpVerified(true); // Skip OTP verification entirely in DEV mode
      setEmailError('');
      setOtpMessage('DEV MODE: Email verified automatically');
      setOtpSuccessMessage('DEV MODE: OTP verification bypassed');
      return;
    }
    
    // Check for whitelist first
    const isWhitelisted = WHITELISTED_EMAILS.includes(email);
    
    if ((isWhitelisted || validateEmail(email)) && !isSendingOtp && cooldownTime === 0) {
      setIsSendingOtp(true);
      setEmailError('');
      
      // Add a timeout to abort the fetch if it takes too long
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        // Temporarily make the email input readonly to prevent zoom
        const emailInput = document.querySelector('input[type="email"]');
        if (emailInput) emailInput.readOnly = true;

        const response = await fetch('/api/otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Server error');
        }

        const data = await response.json();
        
        if (data.success) {
          setIsEmailVerified(true);
          setShowOtpField(true);
          setEmailError('');
          setOtpMessage('Kode OTP telah dikirim ke email anda. Tolong cek dalam folder JUNK EMAIL di Email ITB (Outlook anda). Kode akan kadaluarsa dalam 5 menit.');
          startOtpCooldown();
        } else {
          setEmailError(data.error || 'Gagal mengirim OTP. Silakan coba lagi.');
        }
      } catch (error) {
        clearTimeout(timeoutId);
        
        console.error('Error:', error);
        if (error.name === 'AbortError') {
          setEmailError('Request timed out. Server mungkin sedang sibuk, silakan coba lagi dalam beberapa saat.');
        } else {
          setEmailError('Terjadi kesalahan. Silakan coba lagi.');
        }
      } finally {
        // Remove readonly after a short delay
        setTimeout(() => {
          const emailInput = document.querySelector('input[type="email"]');
          if (emailInput) emailInput.readOnly = false;
        }, 100);
        
        setIsSendingOtp(false);
      }
    } else {
      setEmailError('Email tidak valid! Pastikan anda menggunakan email ITB anda!');
    }
  };

  const handleVerifyOtp = async () => {
    if (isVerifyingOtp) return;
    
    setIsVerifyingOtp(true);
    setOtpError('');
    setOtpSuccessMessage('');

    // Add a timeout to abort the fetch if it takes too long
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      // Temporarily make the OTP input readonly to prevent zoom
      const otpInput = document.querySelector('input[placeholder="Masukkan kode OTP"]');
      if (otpInput) otpInput.readOnly = true;

      const response = await fetch('/api/otp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server error');
      }

      const data = await response.json();

      if (data.success) {
        setIsOtpVerified(true);
        setOtpSuccessMessage('OTP berhasil diverifikasi! Silakan lanjutkan untuk vote.');
      } else {
        setOtpError(data.error || 'OTP tidak valid!');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      console.error('Error:', error);
      if (error.name === 'AbortError') {
        setOtpError('Request timed out. Server mungkin sedang sibuk, silakan coba lagi dalam beberapa saat.');
      } else {
        setOtpError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      // Remove readonly after a short delay
      setTimeout(() => {
        const otpInput = document.querySelector('input[placeholder="Masukkan kode OTP"]');
        if (otpInput) otpInput.readOnly = false;
      }, 100);
      
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (isSendingOtp || cooldownTime > 0) return;
    
    setIsSendingOtp(true);
    
    // Add a timeout to abort the fetch if it takes too long
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      const response = await fetch('/api/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server error');
      }

      const data = await response.json();
      
      if (data.success) {
        setOtpMessage('Kode OTP baru telah dikirim ke email anda. Kode akan kadaluarsa dalam 5 menit.');
        startOtpCooldown();
      } else {
        setEmailError(data.error || 'Gagal mengirim OTP. Silakan coba lagi.');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      console.error('Error:', error);
      if (error.name === 'AbortError') {
        setEmailError('Request timed out. Server mungkin sedang sibuk, silakan coba lagi dalam beberapa saat.');
      } else {
        setEmailError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Render whitelist info message
  const renderWhitelistInfo = () => {
    if (WHITELISTED_EMAILS.includes(email)) {
      return (
        <div className="bg-green-900/30 p-4 rounded-lg mt-4">
          <div className="flex items-start space-x-3">
            <div className="text-green-300 text-sm">✨</div>
            <div>
              <p className="text-sm font-semibold text-green-300">Whitelisted Account</p>
              <p className="text-normal text-gray-300">
                Email ini memiliki akses khusus untuk vote tanpa melalui email ITB.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleSubmitVote = async () => {
    if (!twitterUrl) {
      setErrorMessage('URL Twitter tidak boleh kosong');
      return;
    }

    if (!validateTwitterUrl(twitterUrl)) {
      if (DEV_MODE) {
        setErrorMessage('URL tidak valid! Pastikan format: https://x.com/... atau https://twitter.com/...');
      } else {
        setErrorMessage('URL tidak valid! Pastikan URL tweet dari akun @DraftAnakITB dengan format: https://x.com/DraftAnakITB/status/...');
      }
      return;
    }

    if (!reason) {
      setErrorMessage('Alasan tidak boleh kosong');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/delvote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          twitterUrl,
          reason
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Vote telah dikirim. Terima kasih atas partisipasi Anda!');
        setVoteCount(data.currentVotes || voteCount + 1);
        
        // Reset form
        setTwitterUrl('');
        setReason('');
        
        // Check if threshold reached
        if (data.thresholdReached) {
          setSuccessMessage('Threshold tercapai! Tweet akan segera dihapus.');
        }
      } else {
        setErrorMessage(data.error || 'Gagal mengirim vote');
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      setErrorMessage('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailKeyPress = (e) => {
    if (e.key === 'Enter' && !isEmailVerified && !isSendingOtp) {
      e.preventDefault();
      handleVerifyEmail();
    }
  };

  const handleOtpKeyPress = (e) => {
    if (e.key === 'Enter' && !isOtpVerified && !isVerifyingOtp) {
      e.preventDefault();
      handleVerifyOtp();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#000072] via-[#000060] to-[#000045] text-white p-4 pb-16">
        <Navbar />

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Image
              src="/logo.jpg"
              alt="DraftAnakITB Logo" 
              width={100}
              height={100}
              className="mx-auto shadow-lg"
              priority
            />
            <h1 className="text-3xl font-bold mt-6 bg-gradient-to-r from-blue-200 to-blue-400 bg-clip-text text-transparent">
              Tweet Deletion Request
            </h1>
            <p className="mt-4 text-gray-300 max-w-xl mx-auto">
              Laporkan tweet yang melanggar ketentuan untuk menjalankan moderasi berbasis komunitas.
            </p>
            {DEV_MODE && (
              <div className="mt-4 bg-yellow-500/20 text-yellow-300 px-4 py-2 rounded-md inline-block">
                <span className="font-bold">🛠️ DEV MODE ACTIVE</span>
                <div className="mt-1 text-xs text-left">
                  <ul className="list-disc list-inside">
                    <li>Email validation disabled</li>
                    <li>OTP verification bypassed</li>
                    <li>URL validation relaxed</li>
                    <li>Multiple votes allowed</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Top Ad
          <div className="mb-10">
            <AdSection position="main-top" />
          </div> */}

          {/* Alert & Info */}
          <div className="p-4 mb-8 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <WarningIcon />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-400">Perhatian</h3>
                <div className="mt-2 text-sm text-gray-300">
                  <p>
                    Fitur ini hanya untuk melaporkan tweet yang melanggar ketentuan.
                    Vote akan dihitung jika mencapai minimal {VOTE_THRESHOLD} suara.
                    Penyalahgunaan fitur ini dapat mengakibatkan pemblokiran akun Anda.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="p-8 mx-auto bg-gradient-to-b from-[#000160]/60 to-[#000136]/60 rounded-2xl shadow-lg border border-white/5">
            {voteCount > 0 && (
              <VoteCounter count={voteCount} threshold={VOTE_THRESHOLD} />
            )}

            {/* Success/Error Messages */}
            {successMessage && (
              <div className="p-4 mb-6 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400">{successMessage}</p>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400">{errorMessage}</p>
              </div>
            )}

            {/* Email & OTP Verification */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block font-semibold">Email</label>
                <div className="flex items-center gap-2 input-wrapper">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleEmailKeyPress}
                    disabled={isEmailVerified}
                    placeholder="Email ITB NIM@mahasiswa.itb.ac.id"
                    className="w-full p-2 bg-transparent border rounded focus:outline-none focus:border-blue-400 disabled:opacity-50 text-base md:text-sm"
                    inputMode="email"
                    autoComplete="email"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck="false"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={isEmailVerified || isSendingOtp || cooldownTime > 0}
                    className="px-4 py-2 border rounded hover:bg-blue-900 transition-colors disabled:opacity-50"
                  >
                    {isSendingOtp ? 'SENDING...' : 'CHECK'}
                  </button>
                </div>
                {emailError && (
                  <p className="text-red-400 text-sm">{emailError}</p>
                )}
                {otpMessage && (
                  <p className="text-green-400 text-sm mt-2">{otpMessage}</p>
                )}
                {renderWhitelistInfo()}
              </div>

              {isEmailVerified && (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <label className="block font-semibold">OTP</label>
                    <OtpHelpButton onClick={() => setShowOtpHelp(true)} />
                  </div>
                  <div className="flex items-center gap-2 input-wrapper">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      onKeyDown={handleOtpKeyPress}
                      disabled={isOtpVerified}
                      placeholder="Masukkan kode OTP"
                      className="w-full p-2 bg-transparent border rounded focus:outline-none focus:border-blue-400 disabled:opacity-50 text-base md:text-sm"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck="false"
                      pattern="[0-9]*"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={isOtpVerified || isVerifyingOtp}
                      className="px-4 py-2 border rounded hover:bg-blue-900 transition-colors disabled:opacity-50"
                    >
                      {isVerifyingOtp ? 'CHECKING...' : 'CHECK'}
                    </button>
                  </div>
                  {otpError && (
                    <p className="text-red-400 text-sm">{otpError}</p>
                  )}
                  {otpSuccessMessage && (
                    <p className="text-green-400 text-sm">{otpSuccessMessage}</p>
                  )}
                  <button 
                    type="button" 
                    onClick={handleResendOtp}
                    disabled={isSendingOtp || cooldownTime > 0}
                    className="text-blue-300 hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {isSendingOtp ? 'SENDING...' : cooldownTime > 0 ? `Wait ${cooldownTime}s` : 'Resend OTP'}
                  </button>
                </div>
              )}

              {/* Vote Form after verification */}
              {isOtpVerified && (
                <>
                  <div className="space-y-2">
                    <label className="block font-semibold">
                      URL Tweet <span className="text-red-400">*</span>
                    </label>
                    <div className="w-full bg-gradient-to-b from-[#000072]/30 to-[#000050]/30 rounded-xl border border-white/10 input-wrapper">
                      <input
                        type="text"
                        value={twitterUrl}
                        onChange={(e) => setTwitterUrl(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="https://x.com/DraftAnakITB/status/..."
                        className="w-full p-4 bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-base md:text-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-400">
                      Contoh: https://x.com/DraftAnakITB/status/1234567890
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-semibold">
                      Alasan Penghapusan <span className="text-red-400">*</span>
                    </label>
                    <div className="w-full bg-gradient-to-b from-[#000072]/30 to-[#000050]/30 rounded-xl border border-white/10 input-wrapper">
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={isSubmitting}
                        placeholder="Jelaskan alasan mengapa tweet ini harus dihapus"
                        rows={4}
                        className="w-full p-4 bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none text-base md:text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handleSubmitVote}
                      disabled={!twitterUrl || !reason || isSubmitting}
                      className="flex items-center justify-center w-full px-6 py-3 text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <DeleteIcon />
                      <span className="ml-2">
                        {isSubmitting ? "Memproses..." : "Vote untuk Menghapus"}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* OTP Help Modal */}
      <OtpHelpModal isOpen={showOtpHelp} onClose={() => setShowOtpHelp(false)} />

      {/* Google Ads Script */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9161286456755540"
        crossOrigin="anonymous"
      />
    </>
  );
};

export default DelVotePage; 