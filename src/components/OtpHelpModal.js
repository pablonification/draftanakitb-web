import React from 'react';
import Image from 'next/image';

const OtpHelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={onClose}
        ></div>

        <div className="relative inline-block p-4 overflow-hidden text-left align-bottom transition-all transform bg-[#000072] rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold text-blue-300 mb-4">
                Tidak Menerima Kode OTP?
              </h3>
              
              <div className="space-y-6">
                <div>
                  <p className="text-white mb-2">
                    1. Cek folder JUNK/SPAM di Email Outlook ITB anda:
                  </p>
                  <Image
                    src="/junk.png"
                    alt="Junk Email Location"
                    width={400}
                    height={225}
                    className="rounded-lg border border-gray-600 mx-auto"
                  />
                </div>

                <div>
                  <p className="text-white mb-2">
                    2. Setelah menemukan email OTP, klik "Bukan Sampah" agar email selanjutnya masuk ke Inbox:
                  </p>
                  <Image
                    src="/notjunk.png"
                    alt="Not Junk Button"
                    width={400}
                    height={225}
                    className="rounded-lg border border-gray-600 mx-auto"
                  />
                </div>

                <p className="text-sm text-gray-300">
                  Jika masih belum menerima OTP setelah 5 menit, gunakan tombol "Resend OTP"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpHelpModal;
