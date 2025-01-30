"use client";
import React from 'react';
import Image from 'next/image';
import Script from 'next/script';

// Update Copyright component
const Copyright = () => (
  <div className="fixed bottom-0 left-0 right-0 py-4 border-t border-white/10 bg-[#000072]">
    <p className="normal-text text-center text-gray-400">
      © {new Date().getFullYear()} DraftAnakITB. All rights reserved.
    </p>
  </div>
);

const FAQPage = () => {
  const faqs = [
    {
      q: "Apa itu DraftAnakITB?",
      a: "DraftAnakITB adalah platform menfess yang dibuat khusus untuk mahasiswa ITB. Platform ini memungkinkan kamu mengirim pesan secara anonim ke Twitter melalui akun @DraftAnakITB."
    },
    {
      q: "Apakah menfess saya dijamin anonim?",
      a: "Ya, identitas pengirim menfess tidak akan pernah dipublikasikan. Email kamu hanya digunakan untuk verifikasi dan notifikasi."
    },
    {
      q: "Apa perbedaan Regular dan Paid Menfess?",
      a: "Regular Menfess gratis tapi terbatas 17 tweet per hari dan 1 tweet per hari per user. Paid Menfess berbayar Rp2.500 dengan keuntungan: bisa kirim video, dijamin terkirim, dan diproses manual oleh admin pada jam 20.00 atau 22.00 WIB."
    },
    {
      q: "Kenapa ada batasan 17 tweet per hari?",
      a: "Karena kebijakan baru Twitter/X yang membatasi penggunaan API gratis menjadi hanya 17 tweet per hari. Itulah mengapa kami menyediakan opsi Paid Menfess sebagai alternatif."
    },
    {
      q: "Berapa lama menfess akan diproses?",
      a: "• Regular Menfess: Langsung diproses otomatis jika kuota masih tersedia\n• Paid Menfess: Diproses manual pada pukul 20.00 atau 22.00 WIB"
    },
    {
      q: "Mengapa saya perlu verifikasi email ITB?",
      a: "Untuk memastikan bahwa layanan ini hanya digunakan oleh mahasiswa ITB dan mencegah penyalahgunaan platform."
    },
    {
      q: "Bagaimana jika saya sudah bayar tapi tweet belum terkirim?",
      a: "Paid Menfess akan diproses manual pada jam 20.00 atau 22.00 WIB. Jika dalam 3 hari tweet belum terkirim, silakan hubungi kami di @satpam_itb."
    },
    {
      q: "Apa saja trigger word yang bisa digunakan?",
      a: "Kamu bisa menggunakan: itb!, maba!, misuh!, bucin!, atau itbparkir! di awal pesanmu."
    },
    {
      q: "Bagaimana jika pembayaran gagal tapi saldo terpotong?",
      a: "Silakan hubungi kami segera di @satpam_itb dengan menyertakan bukti pembayaran dan detail transaksi."
    },
    {
      q: "Saya tidak menerima kode OTP di email ITB saya?",
      a: "Kode OTP biasanya masuk ke folder JUNK/SPAM di Email Outlook ITB. Setelah menemukan email OTP:\n1. Klik tombol 'Bukan Sampah' atau 'Not Junk'\n2. Ini akan membantu agar email OTP selanjutnya masuk ke Inbox utama\n3. Jika masih belum menerima OTP setelah 5 menit, gunakan tombol 'Resend OTP'"
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#000072] to-[#000050] text-white p-4 pb-16">
        <nav className="max-w-7xl mx-auto flex justify-end space-x-6 mb-12 px-4">
          <a href="/" className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-300">HOME</a>
          <a href="/about" className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-300">ABOUT</a>
          <a href="/faq" className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-300">FAQ</a>
        </nav>

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
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-gray-300 max-w-xl mx-auto">
              Temukan jawaban untuk pertanyaan yang sering diajukan tentang layanan DraftAnakITB
            </p>
          </div>

          <div className="grid gap-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-b from-[#000072]/30 to-[#000050]/30 rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-blue-200 mb-3 flex items-start gap-3">
                    <span className="bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full text-sm">
                      Q{index + 1}
                    </span>
                    {faq.q}
                  </h3>
                  <p className="text-gray-300 whitespace-pre-line pl-11">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center p-6 bg-gradient-to-b from-[#000072]/30 to-[#000050]/30 rounded-xl border border-white/10">
            <p className="text-lg text-blue-200 mb-3">
              Masih ada pertanyaan lain?
            </p>
            <p className="text-gray-300">
              Silakan hubungi kami di{' '}
              <a 
                href="https://x.com/satpam_itb" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 hover:underline transition-colors"
              >
                @satpam_itb
              </a>
            </p>
          </div>
        </div>
      </div>

      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9161286456755540"
        crossorigin="anonymous"
      />
      {/* <Copyright /> */}
    </>
  );
};

export default FAQPage;
