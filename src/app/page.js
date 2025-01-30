"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import TermsModal from '../components/TermsModal';
import { validateFile, convertFileToBase64 } from '@/app/utils/fileUpload';
import OtpHelpModal from '../components/OtpHelpModal';
import Script from 'next/script';
import Head from 'next/head';

// Add whitelist constant at the top
const WHITELISTED_EMAILS = ['arqilasp@gmail.com'];

// Add this helper function after the WHITELISTED_EMAILS constant
const isVideoFile = (file) => {
  return file?.type?.startsWith('video/');
};

// Add HelpCircleIcon for OTP help
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

// Update OTP help button with new icon
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

// Custom SVG for help/info - Question mark in circle
const InfoIcon = () => (
  <svg 
    className="w-3 h-3" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Custom SVG for automatic posting - Lightning bolt
const AutoPostIcon = () => (
  <svg 
    className="w-5 h-5 text-green-400" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Custom SVG for scheduled posting - Clock
const ScheduledIcon = () => (
  <svg 
    className="w-5 h-5 text-green-400" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Custom SVG for media support - Image/video
const MediaIcon = () => (
  <svg 
    className="w-5 h-5 text-green-400" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Custom SVG for video support - Video camera
const VideoIcon = () => (
  <svg 
    className="w-5 h-5 text-green-400" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Custom SVG for no video - Crossed out video camera
const NoVideoIcon = () => (
  <svg 
    className="w-5 h-5 text-red-400" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5a2.25 2.25 0 01-2.25-2.25v-9a2.25 2.25 0 012.25-2.25H12M3 9.75l9 9m0-9l-9 9" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Custom SVG for daily limit - Calendar with warning
const LimitIcon = () => (
  <svg 
    className="w-5 h-5 text-yellow-400" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
  </svg>
);

// Custom SVG for unlimited - Infinity symbol
const UnlimitedIcon = () => (
  <svg 
    className="w-5 h-5 text-green-400" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
  >
    <path d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Update ComparisonModal component with new styling and icons
const ComparisonModal = ({ isOpen, onClose, botStatus, setMenfessType }) => {
  const handleServiceSelect = (type) => {
    // If isPaidOnly is true, always set to paid
    const effectiveType = botStatus.isPaidOnly ? 'paid' : type;
    setMenfessType(effectiveType);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm" 
          onClick={onClose}
        ></div>

        <div className="relative inline-block w-full max-w-4xl p-8 overflow-hidden text-left align-middle transition-all transform bg-gradient-to-b from-[#000072] to-[#000050] rounded-xl shadow-2xl border border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h3 className="text-2xl font-bold text-center mb-8 text-white">Pilih Layanan Sesuai Kebutuhanmu</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Regular Menfess Card */}
            <div 
              onClick={() => !botStatus.isPaidOnly && handleServiceSelect('regular')}
              className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 transition-all ${
                !botStatus.isPaidOnly ? 'hover:border-white/20 hover:bg-white/10 cursor-pointer' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">Regular Menfess</h4>
                  <p className="text-blue-300 text-sm">Pengiriman Otomatis</p>
                </div>
                <span className="px-4 py-1.5 bg-blue-500/20 text-blue-300 text-sm font-medium rounded-full border border-blue-400/20">
                  Free
                </span>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <AutoPostIcon />
                  <span>Pengiriman langsung & otomatis</span>
                </li>
                <li className="flex items-center gap-3">
                  <MediaIcon />
                  <span>Gambar (JPG, PNG, GIF max 1MB)</span>
                </li>
                <li className="flex items-center gap-3">
                  <NoVideoIcon />
                  <span className="text-gray-400">Video tidak didukung</span>
                </li>
                <li className="flex items-center gap-3">
                  <LimitIcon />
                  <span>Batas 1 tweet/hari (per user)</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm text-gray-400">
                  Ideal untuk pengiriman pesan biasa tanpa media khusus seperti video
                </p>
              </div>
            </div>

            {/* Paid Menfess Card */}
            <div 
              onClick={() => handleServiceSelect('paid')}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 hover:bg-white/10 cursor-pointer transition-all relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">Paid Menfess</h4>
                  <p className="text-blue-300 text-sm">Pengiriman Terjadwal</p>
                </div>
                <span className="px-4 py-1.5 bg-blue-500/20 text-blue-300 text-sm font-medium rounded-full border border-blue-400/20">
                  Rp3.000
                </span>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <ScheduledIcon />
                  <span>Pengiriman terjadwal (20.00-22.00 WIB)</span>
                </li>
                <li className="flex items-center gap-3">
                  <MediaIcon />
                  <span>Gambar (JPG, PNG, GIF max 1MB)</span>
                </li>
                <li className="flex items-center gap-3">
                  <VideoIcon />
                  <span>Video (MP4, 60s, 720p, max 5MB)</span>
                </li>
                <li className="flex items-center gap-3">
                  <UnlimitedIcon />
                  <span>Tidak ada batasan harian</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-sm text-gray-400">
                  Sempurna untuk konten dengan media khusus seperti video dan jika ingin mengirim pesan lebih dari 1 tweet/hari
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Update the comparison button styling
const ComparisonButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex items-center gap-2 mx-auto px-4 py-2 text-sm text-blue-300 hover:text-blue-200 hover:bg-blue-500/10 rounded-lg transition-all duration-200"
  >
    <InfoIcon />
    <span className="group-hover:underline">Bandingkan layanan Regular vs Paid</span>
  </button>
);

// Update PaidMenfessTooltip to use InfoIcon
const PaidMenfessTooltip = () => {
  const [showMobileTooltip, setShowMobileTooltip] = useState(false);

  return (
    <div className="relative group">
      <div 
        className="cursor-help ml-1 text-gray-400 hover:text-gray-200 transition-colors"
        onClick={() => setShowMobileTooltip(prev => !prev)}
      >
        <InfoIcon />
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
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
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

// Update ServiceTypeDescription component
const ServiceTypeDescription = ({ type, isPaidOnly }) => {
  const effectiveType = isPaidOnly ? 'paid' : type;
  
  if (effectiveType === 'regular') {
    return (
      <div className="w-full mt-4 bg-gradient-to-b from-[#000072]/50 to-[#000050]/50 p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all">
        <div className="flex items-start gap-3">
          <ScheduledIcon />
          <div className="min-w-0 flex-1">
            <p className="normal-text font-medium text-blue-200">Regular Menfess - Gratis</p>
            <p className="normal-text text-gray-300 mt-1">Pengiriman otomatis, support gambar, batas {isPaidOnly ? '0' : '17'} tweets/hari</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full mt-4 bg-gradient-to-b from-[#000072]/50 to-[#000050]/50 p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-start gap-3">
        <AutoPostIcon />
        <div className="min-w-0 flex-1">
          <p className="normal-text font-medium text-blue-200">Paid Menfess - Rp3.000</p>
          <p className="normal-text text-gray-300 mt-1">Pengiriman terjadwal 20.00-22.00 WIB, support gambar & video, unlimited</p>
        </div>
      </div>
    </div>
  );
};

// Update Copyright component to be fixed at bottom
const Copyright = () => (
  <div className="fixed bottom-0 left-0 right-0 py-4 border-t border-white/10 bg-[#000072]">
    <p className="normal-text text-center text-gray-400">
      © {new Date().getFullYear()} DraftAnakITB. All rights reserved.
    </p>
  </div>
);

// Add trigger word validation helper
const validateTriggerWord = (message) => {
  const triggerWords = ['itb!', 'maba!', 'misuh!', 'bucin!', 'itbparkir!'];
  const lowerMessage = message.toLowerCase().trim();
  return triggerWords.some(word => lowerMessage.includes(word));
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
  const [isLoading, setIsLoading] = useState(true);
  const [botStatus, setBotStatus] = useState({ 
    status: 'ON', 
    isPaidOnly: false, 
    remainingRegular: 17
  });
  const [personalLimitError, setPersonalLimitError] = useState('');
  const [attachmentError, setAttachmentError] = useState('');
  const [showPaidInfo, setShowPaidInfo] = useState(false);
  const [showOtpHelp, setShowOtpHelp] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const fetchBotStatus = async () => {
      try {
        const response = await fetch('/api/messages');
        const data = await response.json();
        setBotStatus(data);
      } catch (error) {
        console.error('Error fetching bot status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBotStatus();
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

    // Add trigger word validation
    if (!validateTriggerWord(message)) {
      setSubmitError('Pesan harus mengandung salah satu trigger word berikut: itb!, maba!, misuh!, bucin!, atau itbparkir!');
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
      
      // Determine effective type based on bot status and whitelist
      const effectiveType = botStatus.isPaidOnly ? 'paid' : 
                          isWhitelisted ? 'regular' : 
                          menfessType;

      const menfessData = {
        email,
        message,
        type: effectiveType,  // Use effectiveType here
        attachment: base64Attachment,
        remainingRegular: botStatus.remainingRegular,
        personalLimitExceeded: botStatus.personalLimitExceeded,
        isWhitelisted
      };
      
      // Store the data first
      localStorage.setItem('menfessData', JSON.stringify(menfessData));

      // Use effectiveType for redirection
      const redirectPath = effectiveType === 'paid' ? '/landing/paid' : '/landing/regular';
      window.location.replace(redirectPath);

    } catch (error) {
      console.error('Error:', error);
      setSubmitError('Terjadi kesalahan. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  // Add real-time message validation
  const handleMessageChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    
    // Clear error if message now contains a trigger word
    if (validateTriggerWord(newMessage)) {
      setSubmitError('');
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
        // Temporarily make the email input readonly to prevent zoom
        const emailInput = document.querySelector('input[type="email"]');
        if (emailInput) emailInput.readOnly = true;

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

          // Remove readonly after a short delay
          setTimeout(() => {
            const emailInput = document.querySelector('input[type="email"]');
            if (emailInput) emailInput.readOnly = false;
          }, 100);
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
      // Temporarily make the OTP input readonly to prevent zoom
      const otpInput = document.querySelector('input[value="'+otp+'"]');
      if (otpInput) otpInput.readOnly = true;

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

      // Remove readonly after a short delay
      setTimeout(() => {
        const otpInput = document.querySelector('input[value="'+otp+'"]');
        if (otpInput) otpInput.readOnly = false;
      }, 100);
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
    <>
      <Head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" 
        />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-[#000072] via-[#000060] to-[#000045] text-white p-4 pb-16">
        <nav className="max-w-7xl mx-auto flex justify-end space-x-6 mb-12 px-4">
          <a href="/" className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-300">HOME</a>
          <a href="/about" className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-300">ABOUT</a>
          <a href="/faq" className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-300">FAQ</a>
      </nav>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Image
            src="/logo.jpg"
            alt="DraftAnakITB Logo" 
            width={100}
            height={100}
            className="mx-auto shadow-lg"
            priority
          />
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="h1">BOT STATUS:</span>
            <span className="h1 font-bold">
              {isLoading ? (
                <span className="animate-pulse">LOADING...</span>
              ) : (
                botStatus.isPaidOnly ? 'PAID MENFESS ONLY' : 'ON'
              )}
            </span>
          </div>

          {/* Only show warnings after loading and when conditions are met */}
          {!isLoading && (
            <>
          {botStatus.isPaidOnly && (
                <div className="bg-blue-900/30 p-4 rounded-lg mb-6 animate-fadeIn">
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
                <div className="bg-yellow-900/30 p-4 rounded-lg mb-6 animate-fadeIn">
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
            </>
          )}
        </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block font-semibold">Email</label>
            <div className="flex items-center gap-2 input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleEmailKeyPress}
                  disabled={isEmailVerified}
                  className="w-full p-2 bg-transparent border rounded focus:outline-none focus:border-blue-400 disabled:opacity-50 text-base md:text-sm"
                  placeholder="Email ITB NIM@mahasiswa.itb.ac.id"
                  inputMode="email"
                  autoComplete="email"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck="false"
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
                  <OtpHelpButton onClick={() => setShowOtpHelp(true)} />
                </div>
              <div className="flex items-center gap-2 input-wrapper">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    onKeyDown={handleOtpKeyPress}
                    disabled={isOtpVerified}
                    className="w-full p-2 bg-transparent border rounded focus:outline-none focus:border-blue-400 disabled:opacity-50 text-base md:text-sm"
                    placeholder="Masukkan kode OTP"
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
            <div className="space-y-2">
              <div className="flex flex-col items-center">
                <div className="w-full flex items-center justify-center space-x-6 bg-gradient-to-b from-[#000072]/30 to-[#000050]/30 p-4 rounded-xl border border-white/10">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <span className="normal-text font-semibold text-gray-400">Tipe Layanan:</span>
                    <input
                      type="radio"
                      value="regular"
                      checked={!botStatus.isPaidOnly && menfessType === 'regular'}
                      onChange={(e) => setMenfessType(e.target.value)}
                      disabled={botStatus.isPaidOnly}
                      className="w-3 h-3 text-blue-500 border-gray-400 focus:ring-blue-500"
                    />
                    <span className={`normal-text font-medium ${botStatus.isPaidOnly ? 'text-gray-400' : 'group-hover:text-blue-200'}`}>
                      Regular Menfess
                    </span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="radio"
                      value="paid"
                      checked={botStatus.isPaidOnly || menfessType === 'paid'}
                      onChange={(e) => setMenfessType(e.target.value)}
                      className="w-3 h-3 text-blue-500 border-gray-400 focus:ring-blue-500"
                    />
                    <span className="normal-text font-medium group-hover:text-blue-200">Paid Menfess</span>
                  </label>
                </div>
                
                <ServiceTypeDescription 
                  type={botStatus.isPaidOnly ? 'paid' : menfessType} 
                  isPaidOnly={botStatus.isPaidOnly} 
                />
                
                <button
                  type="button"
                  onClick={() => setShowComparison(true)}
                  className="mt-3 normal-text text-blue-300 hover:text-blue-200 flex items-center gap-1.5 group px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition-all"
                >
                  <InfoIcon />
                  <span className="group-hover:underline">Lihat detail perbandingan layanan</span>
                </button>
                </div>
              </div>

            <div className="space-y-2">
                <label className="block font-semibold">
                  Pesan <span className="text-red-400">*</span>
                </label>
              <div className="w-full bg-gradient-to-b from-[#000072]/30 to-[#000050]/30 rounded-xl border border-white/10 input-wrapper">
                <textarea
                  value={message}
                  onChange={handleMessageChange}
                  maxLength={280}
                  required
                  className="w-full h-32 p-4 bg-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none text-base md:text-sm"
                  placeholder='🚀 Silakan ketik pesanmu disini dengan triggerword itb! maba! misuh! bucin! atau itbparkir! untuk mengirim menfess ke Twitter. Contoh menfess: "itb! please ada yang bisa ajarin sender kimia ga?? sender udah hopless banget buat besok uas dan gatau harus ngapain lagi 😭 😭 apa pasrah aja ya??" Maksimal 280 kata.'
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck="false"
                />
              </div>
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
                
              <div className="bg-gradient-to-b from-[#000072]/30 to-[#000050]/30 p-4 rounded-xl border border-white/10">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-white/20 file:text-white file:bg-transparent hover:file:bg-blue-900 file:transition-colors"
                  accept={botStatus.isPaidOnly || menfessType === 'paid' ? "image/*,video/mp4" : "image/*"}
                />
              </div>
                
                {attachmentError && (
                  <p className="text-red-400 text-sm">{attachmentError}</p>
                )}
                
                {attachment && (
                <div className="mt-2 bg-gradient-to-b from-[#000072]/30 to-[#000050]/30 p-4 rounded-xl border border-white/10">
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

        {/* Add Copyright */}
        {/* <Copyright /> */}
      </div>

    {/* Add ComparisonModal */}
    <ComparisonModal
      isOpen={showComparison}
      onClose={() => setShowComparison(false)}
      botStatus={botStatus}
      setMenfessType={setMenfessType}
    />

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleAcceptTerms}
      />
      <OtpHelpModal
        isOpen={showOtpHelp}
        onClose={() => setShowOtpHelp(false)}
      />
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9161286456755540"
        crossorigin="anonymous"
      />
    </div>
</>
  );
};

export default MainPage;