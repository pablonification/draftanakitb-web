import React, { useRef, useState, useEffect } from 'react';

const TermsModal = ({ isOpen, onClose, onAccept }) => {
  const [canAccept, setCanAccept] = useState(false);
  const contentRef = useRef(null);

  const checkScroll = () => {
    const element = contentRef.current;
    if (element) {
      const scrollPosition = Math.ceil(element.scrollTop + element.clientHeight);
      const scrollHeight = Math.ceil(element.scrollHeight);
      const isAtBottom = scrollPosition >= scrollHeight - 2; // 2px threshold
      setCanAccept(isAtBottom);
    }
  };

  // Handle touch events for mobile
  const handleTouchMove = () => {
    checkScroll();
  };

  useEffect(() => {
    const element = contentRef.current;
    if (isOpen && element) {
      // Reset scroll position and canAccept when modal opens
      element.scrollTop = 0;
      setCanAccept(false);

      // Check if content is shorter than container
      if (element.scrollHeight <= element.clientHeight) {
        setCanAccept(true);
      }

      // Add event listeners
      element.addEventListener('scroll', checkScroll, { passive: true });
      element.addEventListener('touchmove', handleTouchMove, { passive: true });

      // Initial check
      checkScroll();

      return () => {
        element.removeEventListener('scroll', checkScroll);
        element.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm" 
          onClick={onClose}
        ></div>

        <div className="relative inline-block w-full max-w-3xl overflow-hidden text-left align-middle transition-all transform bg-gradient-to-b from-[#000072] to-[#000050] rounded-xl shadow-2xl border border-white/10">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-blue-400 bg-clip-text text-transparent">
              Aturan dan Ketentuan
            </h2>
          </div>
          
          <div 
            ref={contentRef}
            className="p-6 overflow-y-auto max-h-[60vh] text-gray-300 space-y-6 overscroll-contain"
          >
            <div className="bg-gradient-to-b from-[#000072]/30 to-[#000050]/30 rounded-xl border border-white/10 p-6">
              <p className="normal-text mb-4">Halaman ini mengatur penggunaan layanan Menfess DraftAnakITB ("DraftAnakITB"). Dengan menggunakan layanan ini, Anda dianggap menyetujui Aturan dan Ketentuan berikut:</p>

              <h2 className="normal-text font-semibold text-blue-200 mt-6 mb-2">1. Umum</h2>
              <p className="normal-text">Layanan ini disediakan untuk memfasilitasi pengiriman pesan anonim (menfess). Semua pesan yang dikirimkan akan dipublikasikan tanpa proses moderasi awal.</p>

              <h2 className="normal-text font-semibold text-blue-200 mt-6 mb-2">2. Konten yang Dilarang</h2>
              <p className="normal-text">Pengguna dilarang mengirimkan konten yang:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li className="normal-text">Mengandung ujaran kebencian, pornografi, atau SARA.</li>
                <li className="normal-text">Menyebarkan informasi palsu atau memicu konflik.</li>
                <li className="normal-text">Melanggar privasi dengan menyebarkan data pribadi tanpa izin.</li>
              </ul>

              <h2 className="normal-text font-semibold text-blue-200 mt-6 mb-2">3. Pelaporan dan Penghapusan</h2>
              <p className="normal-text">Pesan yang melanggar dapat dilaporkan oleh pengguna lain. DraftAnakITB berhak menghapus pesan yang dilaporkan dan terbukti melanggar aturan.</p>

              <h2 className="normal-text font-semibold text-blue-200 mt-6 mb-2">4. Tanggung Jawab Pengguna</h2>
              <p className="normal-text">Pengguna bertanggung jawab atas konten yang dikirimkan. DraftAnakITB tidak bertanggung jawab atas dampak yang ditimbulkan dari pesan yang diterbitkan.</p>

              <h2 className="normal-text font-semibold text-blue-200 mt-6 mb-2">5. Perubahan Aturan</h2>
              <p className="normal-text">Aturan dan Ketentuan ini dapat diubah sewaktu-waktu tanpa pemberitahuan sebelumnya. Pengguna diimbau untuk memeriksa secara berkala.</p>

              <h2 className="normal-text font-semibold text-blue-200 mt-6 mb-2">6. Kontak Kami</h2>
              <p className="normal-text">Jika ada pertanyaan atau laporan, hubungi kami di: draftanakitb.dev@gmail.com</p>

              {/* Add this at the bottom to ensure scrolling is necessary */}
              <div className="h-20"></div>
            </div>
          </div>

          <div className="p-6 border-t border-white/10 bg-gradient-to-b from-[#000072]/30 to-[#000050]/30">
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-white border border-white/50 rounded hover:bg-white/10 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={onAccept}
                disabled={!canAccept}
                className="px-6 py-2 bg-white text-[#000072] rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Setuju
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
