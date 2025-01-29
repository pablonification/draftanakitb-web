import React from 'react';
import Image from 'next/image';

const OtpHelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm" 
          onClick={onClose}
        ></div>

        <div className="relative inline-block w-full max-w-2xl overflow-hidden text-left align-middle transition-all transform bg-gradient-to-b from-[#000072] to-[#000050] rounded-xl shadow-2xl">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-blue-400 bg-clip-text text-transparent">
              Bantuan OTP
            </h2>
          </div>

          <div className="p-6 space-y-6 text-gray-300">
            <div className="space-y-3">
              <p className="normal-text font-semibold text-blue-200">
                1. Cek folder JUNK/SPAM di Email Outlook ITB anda:
              </p>
              <div className="bg-gradient-to-b from-[#000072]/30 to-[#000050]/30 rounded-xl border border-white/10 p-6">
                <Image
                  src="/junk.png"
                  alt="Junk Email Location"
                  width={400}
                  height={225}
                  className="rounded-lg mx-auto"
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="normal-text font-semibold text-blue-200">
                2. Setelah menemukan email OTP, klik "Bukan Sampah" agar email selanjutnya masuk ke Inbox:
              </p>
              <div className="bg-gradient-to-b from-[#000072]/30 to-[#000050]/30 rounded-xl border border-white/10 p-6">
                <Image
                  src="/notjunk.png"
                  alt="Not Junk Button"
                  width={400}
                  height={225}
                  className="rounded-lg mx-auto"
                />
              </div>
            </div>

            <div className="bg-gradient-to-b from-[#000072]/30 to-[#000050]/30 rounded-xl border border-white/10 p-6">
              <p className="normal-text">
                Jika masih belum menerima OTP setelah 5 menit, gunakan tombol "Resend OTP"
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-white/10 bg-gradient-to-b from-[#000072]/30 to-[#000050]/30">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-white text-[#000072] rounded hover:bg-gray-100 transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpHelpModal;
