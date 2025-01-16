"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import TermsModal from '../components/TermsModal';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEmailVerified || !isOtpVerified || !message.trim()) {
      return;
    }
    // Add your form submission logic here
    console.log({
      email,
      otp,
      message,
      menfessType,
      attachment,
    });
  };

  const validateEmail = (email) => {
    return email.endsWith('@mahasiswa.itb.ac.id');
  };

  const handleVerifyEmail = () => {
    if (validateEmail(email)) {
      setIsEmailVerified(true);
      setEmailError('');
      setOtpMessage('Kode OTP telah dikirim ke email anda. Kode akan kadaluarsa dalam 5 menit.');
      console.log('Sending OTP to:', email);
    } else {
      setEmailError('Email tidak valid! Pastikan anda menggunakan email ITB anda!');
    }
  };

  const handleVerifyOtp = () => {
    // Add your OTP verification logic here
    if (otp === '123456') { // Replace with actual OTP validation
      setIsOtpVerified(true);
      setOtpError('');
      setOtpSuccessMessage('OTP berhasil diverifikasi! Silakan lanjutkan mengisi pesan anda.');
    } else {
      setOtpError('OTP tidak valid!');
      setOtpSuccessMessage('');
    }
  };

  const handleResendOtp = () => {
    setOtpMessage('Kode OTP baru telah dikirim ke email anda. Kode akan kadaluarsa dalam 5 menit.');
    console.log('Resending OTP to:', email);
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

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="h1">BOT STATUS:</span>
            <span className="h1 font-bold">ON</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block font-semibold">Email</label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isEmailVerified}
                  className="w-full p-2 bg-transparent border rounded focus:outline-none focus:border-blue-400 disabled:opacity-50"
                  placeholder="Masukan email itb dengan format NIM@mahasiswa.itb.ac.id"
                />
                <button
                  type="button"
                  onClick={handleVerifyEmail}
                  disabled={isEmailVerified}
                  className="px-4 py-2 border rounded hover:bg-blue-900 transition-colors disabled:opacity-50"
                >
                  CHECK
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
            </div>

            {isEmailVerified && (
              <div className="space-y-2">
                <label className="block font-semibold">OTP</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={isOtpVerified}
                    className="w-full p-2 bg-transparent border rounded focus:outline-none focus:border-blue-400 disabled:opacity-50"
                    placeholder="Masukkan kode OTP"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isOtpVerified}
                    className="px-4 py-2 border rounded hover:bg-blue-900 transition-colors disabled:opacity-50"
                  >
                    CHECK
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
                  className="text-blue-300 hover:underline"
                >
                  Resend OTP
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
                    className="mr-2"
                  />
                  Regular Menfess
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="paid"
                    checked={menfessType === 'paid'}
                    onChange={(e) => setMenfessType(e.target.value)}
                    className="mr-2"
                  />
                  Paid Menfess
                </label>
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
                <p className="font-bold text-sm">
                  Media Attachment <span className="font-normal text-gray-400">(opsional)</span>
                </p>
                <input
                  type="file"
                  onChange={(e) => setAttachment(e.target.files[0])}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-white/20 file:text-white file:bg-transparent hover:file:bg-blue-900 file:transition-colors file-input"
                  accept="image/*"
                />
              </div>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isAgreed}
                  onChange={handleCheckboxChange}
                  className="rounded cursor-pointer"
                />
                <span className="text-sm">
                  Dengan ini saya menyetujui semua aturan dan ketentuan yang berlaku di platform ini.
                </span>
              </label>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={!isAgreed || !isEmailVerified || !isOtpVerified}
                  className="px-6 py-2 bg-white text-[#000072] rounded disabled:opacity-50 hover:bg-gray-100 transition-colors"
                >
                  SEND
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