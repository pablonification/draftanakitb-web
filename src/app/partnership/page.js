"use client";
import React, { useState, useEffect } from 'react';
import { Inter, DM_Serif_Display } from 'next/font/google';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'] });
const dmSerif = DM_Serif_Display({ weight: '400', subsets: ['latin'] });

// SVG Icons
const CheckIcon = () => (
  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z" />
  </svg>
);

const HashtagIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const PriceCard = ({ duration, price, features, isPopular }) => (
  <div className={`relative bg-white/[0.03] backdrop-blur-lg border ${isPopular ? 'border-blue-500/50' : 'border-white/10'} rounded-2xl p-8 transition-all hover:border-white/20 hover:bg-white/[0.05]`}>
    {isPopular && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <span className="bg-blue-500 text-white text-sm font-medium px-4 py-1 rounded-full">Paling Populer</span>
      </div>
    )}
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-white mb-2">{duration}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white">{price}</span>
        <span className="text-gray-400">/paket</span>
      </div>
    </div>
    <ul className="space-y-4 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start gap-3 text-gray-300">
          <CheckIcon />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <a 
      href="https://forms.gle/ADzKrDsV23EcdBoZ7"
      target="_blank"
      rel="noopener noreferrer"
      className={`w-full py-3 px-6 rounded-xl font-medium transition-all text-center block
        ${isPopular 
          ? 'bg-blue-500 hover:bg-blue-600 text-white' 
          : 'bg-white/10 hover:bg-white/20 text-white'}`}
    >
      Pilih Paket
    </a>
  </div>
);

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white/[0.03] backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/[0.05] transition-all">
    <div className="bg-blue-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
);

const PasswordProtection = ({ onCorrectPassword }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const PASS_SUBSTRING = 'KJAKAx09';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.includes(PASS_SUBSTRING)) {
      onCorrectPassword();
      localStorage.setItem('partnership-authenticated', 'true');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#000033] flex items-center justify-center z-50">
      <div className="bg-white/[0.03] border border-white/10 rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.jpg"
            alt="DraftAnakITB Logo"
            width={80}
            height={80}
            className="mb-4"
          />
          <h2 className="text-xl font-semibold text-white text-center">
            Halaman Partnership DraftAnakITB
          </h2>
          <p className="text-gray-400 text-sm mt-2 text-center">
            Masukkan kode akses untuk melihat informasi partnership
          </p>
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm text-center font-medium">
              ⚠️ PERINGATAN
            </p>
            <p className="text-red-400 text-xs text-center mt-1">
              Dilarang membagikan link, kode akses, atau isi halaman ini kepada pihak lain.
              Pelanggaran dapat berakibat pada pencabutan akses.
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-white/[0.05] border ${error ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors`}
              placeholder="Masukkan kode akses"
            />
            {error && (
              <p className="text-red-500 text-sm mt-2">
                Kode akses tidak valid
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Akses Halaman
          </button>
        </form>
      </div>
    </div>
  );
};

const PartnershipPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user was previously authenticated
    const authenticated = localStorage.getItem('partnership-authenticated');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return <PasswordProtection onCorrectPassword={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className={`min-h-screen bg-[#000033] text-white ${inter.className}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <Image
                src="/logo.jpg"
                alt="DraftAnakITB Logo"
                width={100}
                height={100}
                className="mb-6"
              />
              <h1 className="text-3xl font-bold text-center tracking-tight text-white">
                DESKRIPSI LAYANAN DRAFTANAKITB
              </h1>
              {/* <div className="mt-6 w-full max-w-2xl p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm text-center font-medium">
                  ⚠️ INFORMASI RAHASIA
                </p>
                <p className="text-red-400 text-xs text-center mt-1">
                  Halaman ini berisi informasi rahasia DraftAnakITB. Dilarang keras membagikan link, kode akses, 
                  screenshot, atau isi halaman ini kepada pihak lain tanpa izin. Pelanggaran dapat berakibat pada 
                  pencabutan akses dan tindakan hukum.
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg prose-invert max-w-none space-y-8">
          {/* Pengenalan Layanan */}
          <div className="bg-white/[0.02] border border-white/10 rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-300">1. Pengenalan Layanan</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              DraftAnakITB menyediakan layanan promosi yang dirancang untuk membantu individu, bisnis, dan organisasi 
              menjangkau komunitas mahasiswa ITB dan sekitarnya. Dengan traffic lebih dari 1 juta per minggu, 
              layanan ini memberikan visibilitas tinggi melalui platform Twitter dan website resmi DraftAnakITB.
            </p>
          </div>

          {/* Jenis Layanan */}
          <div className="bg-white/[0.02] border border-white/10 rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-300">2. Jenis Layanan</h2>
            <p className="mb-6 text-gray-300 text-sm">DraftAnakITB menawarkan dua jenis layanan utama:</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/[0.03] border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-white">Paid Promote</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Layanan promosi melalui Pinned Tweet di Twitter @DraftAnakITB, Daily Tweet (sesuai durasi), 
                  dan Penempatan di Website yang akan selalu terlihat ketika user akan mengirimkan menfess.
                </p>
              </div>
              
              <div className="bg-white/[0.03] border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-white">Media Partner</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Kolaborasi promosi untuk event atau kegiatan khusus.
                </p>
              </div>
            </div>
          </div>

          {/* Detail Layanan */}
          <div className="bg-white/[0.02] border border-white/10 rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-300">3. Detail Layanan</h2>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-blue-300 uppercase tracking-wider mb-2">Deskripsi:</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Layanan promosi yang menampilkan tweet promosi di posisi teratas akun Twitter @DraftAnakITB 
                  serta penempatan promosi di website kami. Konten promosi akan di-tweet juga secara berkala 
                  dengan rentang waktu tertentu sesuai dengan durasi. Selain itu, konten promosi akan mendapat 
                  placement khusus di website kami yang akan dilihat oleh user yang mengunjungi website dan akan 
                  mengirim menfess.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-blue-300 uppercase tracking-wider mb-2">Durasi:</h4>
                <p className="text-gray-300 text-sm">1, 3, atau 7 hari (opsi kustom tersedia berdasarkan kebutuhan klien).</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-blue-300 uppercase tracking-wider mb-2">Isi Konten:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-3 text-gray-300 text-sm">
                    <CheckIcon />
                    <span>Maksimum 280 karakter (jika lebih, bisa dalam bentuk gambar atau thread)</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300 text-sm">
                    <CheckIcon />
                    <span>Bisa menyertakan media (gambar/video)</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300 text-sm">
                    <CheckIcon />
                    <span>Bisa menyertakan hashtag khusus sesuai permintaan klien</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-blue-300 uppercase tracking-wider mb-2">Format Website Placement:</h4>
                <p className="text-gray-300 text-sm">Konten promosi pada bagian main page dan loading page.</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-blue-300 uppercase tracking-wider mb-2">Contoh Format Iklan:</h4>
                <p className="text-gray-300 text-sm mb-2">
                  Untuk melihat contoh format iklan yang dapat diterima, silakan kunjungi dokumen berikut:
                </p>
                <a 
                  href="https://docs.google.com/document/d/1fc0mu_vpRxaCbFR7AGWLSECbhCqZoXSGJRUB-kBXzJk/edit?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Lihat Contoh Format Iklan
                </a>
              </div>
            </div>
          </div>

          {/* Pricing Tables */}
          <div className="bg-white/[0.02] border border-white/10 rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-300">4. Harga dan Paket Paid Promote</h2>
            
            {/* First Table - Paid Promote */}
            <div className="overflow-x-auto bg-white/[0.02] border border-white/10 rounded-lg mx-auto max-w-2xl">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="p-5 text-center text-sm font-medium text-blue-300 uppercase tracking-wider w-1/2">Paket</th>
                    <th className="p-5 text-center text-sm font-medium text-blue-300 uppercase tracking-wider w-1/2">Harga</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-white/10 hover:bg-white/[0.02] transition-colors">
                    <td className="p-5 text-white text-center">1 Hari</td>
                    <td className="p-5 text-white text-center">Rp 30.000</td>
                  </tr>
                  <tr className="border-b border-white/10 hover:bg-white/[0.02] transition-colors">
                    <td className="p-5 text-white text-center">3 Hari</td>
                    <td className="p-5 text-white text-center">Rp 90.000</td>
                  </tr>
                  <tr className="border-b border-white/10 hover:bg-white/[0.02] transition-colors">
                    <td className="p-5 text-white text-center">7 Hari</td>
                    <td className="p-5 text-white text-center">Rp 200.000</td>
                  </tr>
                  <tr className="border-b border-white/10 hover:bg-white/[0.02] transition-colors">
                    <td className="p-5 text-white text-center">14 Hari</td>
                    <td className="p-5 text-white text-center">Rp 400.000</td>
                  </tr>
                  <tr className="border-b border-white/10 hover:bg-white/[0.02] transition-colors">
                    <td className="p-5 text-white text-center">30 Hari</td>
                    <td className="p-5 text-white text-center">Rp 860.000</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-5 text-white text-center">Custom</td>
                    <td className="p-5 text-white text-center">Hubungi kami lebih lanjut</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-xl font-semibold mb-4 mt-8 text-blue-300">5. Harga dan Paket Media Partner</h2>
            
            {/* Second Table - Media Partner */}
            <div className="overflow-x-auto bg-white/[0.02] border border-white/10 rounded-lg mx-auto max-w-2xl">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="p-5 text-center text-sm font-medium text-blue-300 uppercase tracking-wider w-1/2">Jenis Layanan</th>
                    <th className="p-5 text-center text-sm font-medium text-blue-300 uppercase tracking-wider w-1/2">Harga</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-white/10 hover:bg-white/[0.02] transition-colors">
                    <td className="p-5 text-white text-center">Promosi Event</td>
                    <td className="p-5 text-white text-center">Hubungi kami lebih lanjut</td>
                  </tr>
                  <tr className="border-b border-white/10 hover:bg-white/[0.02] transition-colors">
                    <td className="p-5 text-white text-center">Liputan Acara</td>
                    <td className="p-5 text-white text-center">Hubungi kami lebih lanjut</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-5 text-white text-center">Kolaborasi Jangka Panjang</td>
                    <td className="p-5 text-white text-center">Hubungi kami lebih lanjut</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-white/[0.02] border border-white/10 rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-300">6. Syarat dan Ketentuan</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Konten yang Dipromosikan</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-gray-300 text-sm">
                    <CheckIcon />
                    <span>Tidak mengandung unsur SARA, hoax, perjudian, atau hal yang melanggar hukum</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300 text-sm">
                    <CheckIcon />
                    <span>Tidak bertentangan dengan kebijakan Twitter dan norma sosial</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300 text-sm">
                    <CheckIcon />
                    <span>Semua brief content sepenuhnya disiapkan oleh klien, termasuk teks, media, dan elemen kreatif lainnya</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300 text-sm">
                    <CheckIcon />
                    <span>DraftAnakITB hanya bertanggung jawab untuk memposting konten yang diberikan tanpa modifikasi</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300 text-sm">
                    <CheckIcon />
                    <span>Segala bentuk klaim hukum terkait konten promosi sepenuhnya menjadi tanggung jawab klien, dan DraftAnakITB tidak dapat dituntut atas isi promosi yang telah diposting</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Pembayaran</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-gray-300 text-sm">
                    <CheckIcon />
                    <span>Pembayaran harus dilakukan di awal sebelum layanan berjalan</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300 text-sm">
                    <CheckIcon />
                    <span>Pembayaran dilakukan melalui nomor rekening yang tertera pada dokumen perjanjian atau metode lain yang telah disepakati</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Perubahan dan Pembatalan</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-gray-300 text-sm">
                    <CheckIcon />
                    <span>Setelah konten diposting, tidak dapat diubah, atau diganti sebelum durasi promosi berakhir</span>
                  </li>
                  <li className="flex items-start gap-3 text-gray-300 text-sm">
                    <CheckIcon />
                    <span>Pembatalan setelah pembayaran tidak dapat direfund kecuali terdapat kesalahan teknis dari pihak DraftAnakITB</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cara Pemesanan */}
          <div className="bg-white/[0.02] border border-white/10 rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-300">7. Cara Pemesanan</h2>
            
            <div className="space-y-4">
              <li className="flex items-center gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded bg-blue-500/20 text-blue-300 text-sm flex items-center justify-center">1</span>
                <span className="text-gray-300 text-sm">Isi formulir pemesanan melalui link: <a href="https://forms.gle/ADzKrDsV23EcdBoZ7" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200">https://forms.gle/ADzKrDsV23EcdBoZ7</a></span>
              </li>
              <li className="flex items-center gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded bg-blue-500/20 text-blue-300 text-sm flex items-center justify-center">2</span>
                <span className="text-gray-300 text-sm">Tunggu konfirmasi dari tim DraftAnakITB</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded bg-blue-500/20 text-blue-300 text-sm flex items-center justify-center">3</span>
                <span className="text-gray-300 text-sm">Lakukan pembayaran sesuai instruksi yang diberikan</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded bg-blue-500/20 text-blue-300 text-sm flex items-center justify-center">4</span>
                <span className="text-gray-300 text-sm">Layanan akan berjalan sesuai jadwal yang disepakati</span>
              </li>
            </div>

            <p className="text-gray-300 text-sm mt-6 pt-6 border-t border-white/10">
              Untuk informasi lebih lanjut, hubungi kami melalui email atau{' '}
              <a 
                href="https://twitter.com/DraftAnakITB"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200"
              >
                DM di Twitter @DraftAnakITB
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnershipPage;
