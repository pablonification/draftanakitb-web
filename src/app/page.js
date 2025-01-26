"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import TermsModal from '../components/TermsModal';
import { validateFile, convertFileToBase64 } from '@/app/utils/fileUpload';

// Add whitelist constant at the top
const WHITELISTED_EMAILS = ['arqilasp@gmail.com'];

// Add this helper function after the WHITELISTED_EMAILS constant
const isVideoFile = (file) => {
  return file?.type?.startsWith('video/');
};

// Replace the OtpHelpTooltip component
const OtpHelpTooltip = () => {
  const [showMobileTooltip, setShowMobileTooltip] = useState(false);

  return (
    <div className="relative group">
      <div 
        className="cursor-help ml-2 text-blue-300"
        onClick={() => setShowMobileTooltip(prev => !prev)} // for mobile
      >
        <span>ℹ️ Belum menerima OTP?</span>
      </div>
      
      {/* Desktop tooltip */}
      <div className="hidden group-hover:md:block absolute z-50 w-[400px] p-4 mt-2 -left-1/2 
        bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700">
        <h4 className="font-semibold text-blue-300 mb-2">Tidak menerima kode OTP?</h4>
        <p className="text-sm text-gray-300 mb-3">
          Kode OTP biasanya masuk ke folder JUNK/SPAM di Email Outlook ITB anda.
          Silakan cek folder tersebut seperti pada gambar di bawah ini:
        </p>
        <Image
          src="/junk.png"
          alt="Junk Email Location"
          width={350}
          height={200}
          className="rounded-lg border border-gray-600"
        />
        <div className="absolute w-3 h-3 bg-gray-800 rotate-45 transform 
          -translate-y-1.5 left-[80px] -top-1 border-t border-l border-gray-700">
        </div>
      </div>

      {/* Mobile tooltip */}
      {showMobileTooltip && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-50 p-4 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700">
          <div className="max-w-lg mx-auto space-y-3">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-blue-300">Tidak menerima kode OTP?</h4>
              <button 
                onClick={() => setShowMobileTooltip(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-300">
              Kode OTP biasanya masuk ke folder JUNK/SPAM di Email Outlook ITB anda.
            </p>
            <div className="relative w-full max-w-[300px] mx-auto">
              <Image
                src="/junk.png"
                alt="Junk Email Location"
                width={300}
                height={170}
                className="rounded-lg border border-gray-600"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add this new component after OtpHelpTooltip
const PaidMenfessTooltip = () => {
  const [showMobileTooltip, setShowMobileTooltip] = useState(false);

  return (
    <div className="relative group">
      <div 
        className="cursor-help ml-1 text-gray-400"
        onClick={() => setShowMobileTooltip(prev => !prev)}
      >
        ℹ️
      </div>
      
      {/* Desktop tooltip */}
      <div className="hidden group-hover:md:block absolute z-20 w-72 right-0 bottom-full mb-2
        bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-700">
        <p className="text-sm text-gray-200">
          Menfess akan dikirim secara manual oleh admin pada pukul 20.00 atau 22.00 WIB.
        </p>
        <div className="absolute w-3 h-3 bg-gray-800/95 rotate-45 transform 
          right-4 bottom-0 translate-y-full border-r border-b border-gray-700">
        </div>
      </div>

      {/* Mobile tooltip */}
      {showMobileTooltip && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-50 p-4 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700">
          <div className="max-w-lg mx-auto">
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-blue-300">Tentang Paid Menfess</h4>
              <button 
                onClick={() => setShowMobileTooltip(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-300 mt-2">
              Menfess akan dikirim secara manual oleh admin pada pukul 20.00 atau 22.00 WIB.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const MainPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [menfessType, setMenfessType] = useState('regular');
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isAgreed, setIsAgreed] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [botStatus, setBotStatus] = useState({ 
    status: 'ON', 
    isPaidOnly: false, 
    remainingRegular: 17,
    personalLimitExceeded: false 
  });
  const [personalLimitError, setPersonalLimitError] = useState('');
  const [attachmentError, setAttachmentError] = useState('');
  const [showPaidInfo, setShowPaidInfo] = useState(false);

  useEffect(() => {
    const fetchBotStatus = async () => {
      try {
        const response = await fetch('/api/messages');
        const data = await response.json();
        setBotStatus({
          ...data,
          personalLimitExceeded: data.personalLimitExceeded || false
        });
        // Force paid menfess when global limit is exceeded
        if (data.isPaidOnly) {
          setMenfessType('paid');
        }
      } catch (error) {
        console.error('Error fetching bot status:', error);
      }
    };

    fetchBotStatus();
    const interval = setInterval(fetchBotStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const startOtpCooldown = () => {
    setOtpCooldown(30);
    const timer = setInterval(() => {
      setOtpCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getMediaTypeInfo = () => {
    if (menfessType === 'paid') {
      return "Pictures (JPG, PNG, GIF, 1MB) or Video (MP4, 60s max, 720p, 5MB)";
    }
    return "Pictures only (JPG, PNG, GIF, 1MB)";
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setAttachmentError('');
    setAttachment(null);

    if (!file) return;

    // Use the effective menfess type for validation
    const effectiveType = botStatus.isPaidOnly ? 'paid' : menfessType;
    const validation = await validateFile(file, effectiveType === 'paid');
    if (!validation.valid) {
      setAttachmentError(validation.error);
      e.target.value = ''; // Clear the file input
      return;
    }

    setAttachment(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEmailVerified || !isOtpVerified || !message.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    setPersonalLimitError('');

    try {
      let base64Attachment = null;
      if (attachment) {
        base64Attachment = await convertFileToBase64(attachment);
      }

      // Check if email is whitelisted
      const isWhitelisted = WHITELISTED_EMAILS.includes(email);
      
      // Determine correct menfess type based on bot status and whitelist
      const effectiveType = botStatus.isPaidOnly ? 'paid' : 
                          isWhitelisted ? 'regular' : 
                          menfessType;

      const menfessData = {
        email,
        message,
        type: effectiveType,
        attachment: base64Attachment,
        remainingRegular: botStatus.remainingRegular,
        personalLimitExceeded: botStatus.personalLimitExceeded,
        isWhitelisted
      };
      
      localStorage.setItem('menfessData', JSON.stringify(menfessData));

      // Redirect based on effective type
      window.location.href = effectiveType === 'paid' 
        ? '/landing/paid'
        : '/landing/regular';

    } catch (error) {
      console.error('Error:', error);
      setSubmitError('Terjadi kesalahan. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  const validateEmail = (email) => {
    // Allow whitelisted emails to bypass the validation
    if (WHITELISTED_EMAILS.includes(email)) {
      return true;
    }
    return email.endsWith('@mahasiswa.itb.ac.id');
  };

  const handleVerifyEmail = async () => {
    // Check for whitelist first
    const isWhitelisted = WHITELISTED_EMAILS.includes(email);
    
    if ((isWhitelisted || validateEmail(email)) && !isSendingOtp && otpCooldown === 0) {
      setIsSendingOtp(true);
      try {
        const response = await fetch('/api/otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email })
        });

        const data = await response.json();
        
        if (data.success) {
          setIsEmailVerified(true);
          setEmailError('');
          setOtpMessage('Kode OTP telah dikirim ke email anda. Tolong cek dalam folder JUNK EMAIL di Email ITB (Outlook anda). Kode akan kadaluarsa dalam 5 menit.');
          startOtpCooldown();
        } else {
          setEmailError(data.error || 'Gagal mengirim OTP. Silakan coba lagi.');
        }
      } catch (error) {
        console.error('Error:', error);
        setEmailError('Terjadi kesalahan. Silakan coba lagi.');
      } finally {
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

    try {
      const response = await fetch('/api/otp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (data.success) {
        setIsOtpVerified(true);
        setOtpSuccessMessage('OTP berhasil diverifikasi! Silakan lanjutkan mengisi pesan anda.');
      } else {
        setOtpError(data.error || 'OTP tidak valid!');
      }
    } catch (error) {
      console.error('Error:', error);
      setOtpError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (isSendingOtp || otpCooldown > 0) return;
    
    setIsSendingOtp(true);
    try {
      const response = await fetch('/api/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email })
      });

      const data = await response.json();
      
      if (data.success) {
        setOtpMessage('Kode OTP baru telah dikirim ke email anda. Kode akan kadaluarsa dalam 5 menit.');
        startOtpCooldown();
      } else {
        setEmailError(data.error || 'Gagal mengirim OTP. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error:', error);
      setEmailError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleCheckboxChange = (e) => {
    e.preventDefault();
    if (!isAgreed) {
      setShowTermsModal(true);
    }
  };

  const handleAcceptTerms = () => {
    setIsAgreed(true);
    setShowTermsModal(false);
  };

  // Add info message for whitelisted users
  const renderWhitelistInfo = () => {
    if (WHITELISTED_EMAILS.includes(email)) {
      return (
        <div className="bg-green-900/30 p-4 rounded-lg mt-4">
          <div className="flex items-start space-x-3">
            <div className="text-green-300 text-sm">✨</div>
            <div>
              <p className="text-sm font-semibold text-green-300">Admin/Test Account</p>
              <p className="text-normal text-gray-300">
                Email ini memiliki akses khusus untuk bypass limit regular menfess.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Add these new key press handlers
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

  const handlePaidInfoToggle = () => {
    setShowPaidInfo(prev => !prev);
  };

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

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="h1">BOT STATUS:</span>
            <span className="h1 font-bold">
              {botStatus.isPaidOnly ? 'PAID MENFESS ONLY' : 'ON'}
            </span>
          </div>

          {/* Add Twitter API Limit Info */}
          {botStatus.isPaidOnly && (
            <div className="bg-blue-900/30 p-4 rounded-lg mb-6">
              <div className="flex items-start space-x-3">
                <div className="text-yellow-300 text-sm">ℹ️</div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-white-300">Regular Menfess Unavailable</p>
                  <p className="text-normal text-gray-300">
                    Karena kebijakan baru Twitter/X yang membatasi penggunaan API, kami hanya dapat mengirim maksimal 17 tweets per hari untuk layanan regular menfess. Batas harian ini telah tercapai.
                  </p>
                  <div className="flex items-center space-x-2 text-normal">
                    <span className="text-gray-400">Sisa kuota:</span>
                    <span className="bg-red-900/50 text-red-300 px-2 py-1 rounded">
                      {botStatus.remainingRegular} tweets
                    </span>
                  </div>
                  <p className="text-normal text-blue-300">
                    ✨ Anda masih dapat menggunakan layanan paid menfess untuk mengirim pesan.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!botStatus.isPaidOnly && botStatus.remainingRegular < 5 && (
            <div className="bg-yellow-900/30 p-4 rounded-lg mb-6">
              <div className="flex items-start space-x-3">
                <div className="text-yellow-300 text-sm">⚠️</div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-yellow-300">Kuota Regular Menfess Hampir Habis</p>
                  <p className="text-normal text-gray-300">
                    Karena kebijakan Twitter/X, kami hanya dapat mengirim 17 tweets per hari untuk layanan regular menfess.
                  </p>
                  <div className="flex items-center space-x-2 text-normal">
                    <span className="text-normal text-gray-400">Sisa kuota:</span>
                    <span className="bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded">
                      {botStatus.remainingRegular} tweets
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block font-semibold">Email</label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleEmailKeyPress}
                  disabled={isEmailVerified}
                  className="w-full p-2 bg-transparent border rounded focus:outline-none focus:border-blue-400 disabled:opacity-50"
                  placeholder="Email ITB NIM@mahasiswa.itb.ac.id"
                />
                <button
                  type="button"
                  onClick={handleVerifyEmail}
                  disabled={isEmailVerified || isSendingOtp}
                  className="px-4 py-2 border rounded hover:bg-blue-900 transition-colors disabled:opacity-50"
                >
                  {isSendingOtp ? 'SENDING...' : 'CHECK'}
                </button>
              </div>
              {emailError && (
                <p className="error-message">{emailError}</p>
              )}
              {otpMessage && (
                <p className="success-message mt-2">
                  {otpMessage}
                </p>
              )}
              {renderWhitelistInfo()}
            </div>

            {isEmailVerified && (
              <div className="space-y-2">
                <div className="flex items-center">
                  <label className="block font-semibold">OTP</label>
                  <OtpHelpTooltip />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    onKeyDown={handleOtpKeyPress}
                    disabled={isOtpVerified}
                    className="w-full p-2 bg-transparent border rounded focus:outline-none focus:border-blue-400 disabled:opacity-50"
                    placeholder="Masukkan kode OTP"
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
                  <p className="error-message">{otpError}</p>
                )}
                {otpSuccessMessage && (
                  <p className="success-message">{otpSuccessMessage}</p>
                )}
                <button 
                  type="button" 
                  onClick={handleResendOtp}
                  disabled={isSendingOtp || otpCooldown > 0}
                  className="text-blue-300 hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {isSendingOtp ? 'SENDING...' : otpCooldown > 0 ? `Wait ${otpCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-xl font-bold text-center">PESAN YANG INGIN DIKIRIM</h4>
              <div className="flex items-center justify-center space-x-4">
                <span className="font-semibold">Tipe Layanan:</span>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="regular"
                    checked={menfessType === 'regular'}
                    onChange={(e) => setMenfessType(e.target.value)}
                    disabled={botStatus.isPaidOnly}
                    className="mr-2"
                  />
                  Regular Menfess
                </label>
                <div className="relative flex items-center">
                  <input
                    type="radio"
                    value="paid"
                    checked={menfessType === 'paid' || botStatus.isPaidOnly}
                    onChange={(e) => setMenfessType(e.target.value)}
                    className="mr-2"
                  />
                  <span>Paid Menfess</span>
                  <PaidMenfessTooltip />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold">
                  Pesan <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={280}
                  required
                  className="w-full h-32 p-2 bg-transparent border rounded focus:outline-none focus:border-blue-400"
                  placeholder='🚀 Silakan ketik pesanmu disini dengan triggerword itb! maba! misuh! bucin! atau itbparkir! untuk mengirim menfess ke Twitter. Contoh menfess: "itb! please ada yang bisa ajarin sender kimia ga?? sender udah hopless banget buat besok uas dan gatau harus ngapain lagi 😭 😭 apa pasrah aja ya??" Maksimal 280 kata.'
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-normal">
                    Media Attachment <span className="font-normal text-gray-400">(opsional)</span>
                  </p>
                  <span className="text-xs text-gray-400">
                    {getMediaTypeInfo()}
                  </span>
                </div>
                
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-white/20 file:text-white file:bg-transparent hover:file:bg-blue-900 file:transition-colors"
                  accept={botStatus.isPaidOnly || menfessType === 'paid' ? "image/*,video/mp4" : "image/*"}
                />
                
                {attachmentError && (
                  <p className="text-red-400 text-sm">{attachmentError}</p>
                )}
                
                {attachment && (
                  <div className="mt-2">
                    {isVideoFile(attachment) ? (
                      <video
                        src={URL.createObjectURL(attachment)}
                        className="max-h-32 rounded-lg"
                        controls
                      />
                    ) : (
                      <img
                        src={URL.createObjectURL(attachment)}
                        alt="Preview"
                        className="max-h-32 rounded-lg"
                      />
                    )}
                  </div>
                )}
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isAgreed}
                  onChange={handleCheckboxChange}
                  className="rounded cursor-pointer"
                />
                <span className="normal-text">
                  Dengan ini saya menyetujui semua aturan dan ketentuan yang berlaku di platform ini.
                </span>
              </label>

              {submitError && (
                <p className="error-message text-center">{submitError}</p>
              )}
              {submitSuccess && (
                <p className="success-message text-center">{submitSuccess}</p>
              )}

              <div className="text-center">
                <button
                    type="submit"
                    disabled={!isAgreed || !isEmailVerified || !isOtpVerified || isSubmitting}
                    className="px-6 py-2 bg-white text-[#000072] rounded disabled:opacity-50 hover:bg-gray-100 transition-colors"
                >
                    {isSubmitting ? 'SENDING...' : 'SEND'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <TermsModal 
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleAcceptTerms}
      />
    </div>
  );
};

export default MainPage;