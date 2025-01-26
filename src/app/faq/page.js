"use client";
import React from 'react';
import Image from 'next/image';

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
      a: "Regular Menfess gratis tapi terbatas 17 tweet per hari dan 1 tweet per minggu per user. Paid Menfess berbayar Rp3.000 dengan keuntungan: bisa kirim video, dijamin terkirim, dan diproses manual oleh admin pada jam 20.00 atau 22.00 WIB."
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
    }
  ];

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
          <h1 className="text-2xl font-bold mt-4">Frequently Asked Questions</h1>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-blue-900/30 p-4 rounded-lg hover:bg-blue-900/40 transition-colors"
            >
              <h3 className="text-lg font-semibold text-blue-300 mb-2">
                {faq.q}
              </h3>
              <p className="text-gray-300 whitespace-pre-line">
                {faq.a}
              </p>
            </div>
          ))}

          <div className="text-center mt-8 p-4 bg-gray-800/50 rounded-lg">
            <p className="text-sm">
              Masih ada pertanyaan lain? Silakan hubungi kami di{' '}
              <a 
                href="https://x.com/satpam_itb" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-300 hover:underline"
              >
                @satpam_itb
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
