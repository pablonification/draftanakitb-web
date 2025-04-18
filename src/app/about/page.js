"use client";
import React from 'react';
import Image from 'next/image';
import Script from 'next/script';
import Navbar from '@/components/Navbar';

// Update Copyright component
const Copyright = () => (
  <div className="fixed bottom-0 left-0 right-0 py-4 border-t border-white/10 bg-[#000072]">
    <p className="normal-text text-center text-gray-400">
      © {new Date().getFullYear()} DraftAnakITB. All rights reserved.
    </p>
  </div>
);

const AboutPage = () => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#000072] via-[#000060] to-[#000045] text-white p-4 pb-16">
        <Navbar />

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
              About DraftAnakITB
            </h1>
            <p className="mt-4 text-gray-300 max-w-xl mx-auto">
              Platform menfess yang mewadahi seluruh opini dan pendapat massa ITB
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-b from-[#000072]/30 to-[#000050]/30 rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300">
              <div className="p-6">
                <h4 className="text-lg font-semibold text-blue-200 mb-3">APA ITU DRAFTANAKITB?</h4>
                <p className="text-gray-300 leading-relaxed">
                  DraftAnakITB adalah bot menfess 🤖 yang mewadahi seluruh opini 🗣️ dan pendapat 💬 massa ITB 🎓 tanpa terkecuali. Kami hadir buat kamu yang ingin menyuarakan opini tanpa drama 🎭! Bot menfess ini lebih termoderasi 🛡️ dan fokus untuk jadi tempat nyaman 🛋️ buat massa ITB. Jadi, nggak ada lagi tuh konten yang nggak jelas ❌ atau bikin ribut 🔥.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-b from-[#000072]/30 to-[#000050]/30 rounded-xl border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300">
              <div className="p-6">
                <h4 className="text-lg font-semibold text-blue-200 mb-3">FOR REPORT OR BUSINESS INQUIRIES</h4>
                <div className="space-y-3 text-gray-300">
                  <p>
                    <span className="text-blue-200">Email:</span>{' '}
                    <a 
                      href="mailto:draftanakitb.dev@gmail.com"
                      className="hover:text-blue-200 hover:underline transition-colors"
                    >
                      draftanakitb.dev@gmail.com
                    </a>
                  </p>
                  <p>
                    <span className="text-blue-200">Twitter/X:</span>{' '}
                    <a 
                      href="https://x.com/satpam_itb" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-200 hover:underline transition-colors"
                    >
                      @satpam_itb
                    </a>
                  </p>
                </div>
              </div>
            </div>
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

export default AboutPage;