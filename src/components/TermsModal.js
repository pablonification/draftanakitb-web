import React, { useRef, useState, useEffect } from 'react';

const TermsModal = ({ isOpen, onClose, onAccept }) => {
  const [canAccept, setCanAccept] = useState(false);
  const contentRef = useRef(null);

  const checkScroll = () => {
    const element = contentRef.current;
    if (element) {
      const isScrolledToBottom = 
        Math.ceil(element.scrollHeight - element.scrollTop) <= element.clientHeight;
      setCanAccept(isScrolledToBottom);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCanAccept(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-[#000072] border border-white rounded-lg max-w-2xl w-full h-[600px] flex flex-col">
        <div className="p-4 border-b border-white">
          <h2 className="text-xl font-bold text-white">Aturan dan Ketentuan</h2>
        </div>
        
        <div 
          ref={contentRef}
          onScroll={checkScroll}
          className="p-4 overflow-y-auto flex-1 text-white"
        >
          <p className="mb-4">Halaman ini mengatur penggunaan layanan Menfess DraftAnakITB ("DraftAnakITB"). Dengan menggunakan layanan ini, Anda dianggap menyetujui Aturan dan Ketentuan berikut:</p>

          <h2 className="font-bold mt-4">1. Umum</h2>
          <p>Layanan ini disediakan untuk memfasilitasi pengiriman pesan anonim (menfess). Semua pesan yang dikirimkan akan dipublikasikan tanpa proses moderasi awal.</p>

          <h2 className="font-bold mt-4">2. Konten yang Dilarang</h2>
          <p>Pengguna dilarang mengirimkan konten yang:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Mengandung ujaran kebencian, pornografi, atau SARA.</li>
            <li>Menyebarkan informasi palsu atau memicu konflik.</li>
            <li>Melanggar privasi dengan menyebarkan data pribadi tanpa izin.</li>
          </ul>

          <h2 className="font-bold mt-4">3. Pelaporan dan Penghapusan</h2>
          <p>Pesan yang melanggar dapat dilaporkan oleh pengguna lain. DraftAnakITB berhak menghapus pesan yang dilaporkan dan terbukti melanggar aturan.</p>

          <h2 className="font-bold mt-4">4. Tanggung Jawab Pengguna</h2>
          <p>Pengguna bertanggung jawab atas konten yang dikirimkan. DraftAnakITB tidak bertanggung jawab atas dampak yang ditimbulkan dari pesan yang diterbitkan.</p>

          <h2 className="font-bold mt-4">5. Perubahan Aturan</h2>
          <p>Aturan dan Ketentuan ini dapat diubah sewaktu-waktu tanpa pemberitahuan sebelumnya. Pengguna diimbau untuk memeriksa secara berkala.</p>

          <h2 className="font-bold mt-4">6. Kontak Kami</h2>
          <p>Jika ada pertanyaan atau laporan, hubungi kami di: draftanakitb.dev@gmail.com</p>

          {/* Add this at the bottom to ensure scrolling is necessary */}
          <div className="h-20"></div>
        </div>

        <div className="p-4 border-t border-white flex justify-end gap-2 bg-[#000072]">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded text-white hover:bg-blue-900 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={onAccept}
            disabled={!canAccept}
            className="px-4 py-2 bg-white text-[#000072] rounded disabled:opacity-50 hover:bg-gray-100 transition-colors"
          >
            Setuju
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
