"use client";
import React from 'react';
import Image from 'next/image';
import Script from 'next/script';

const AboutPage = () => {
  return (
    <>
      <div className="min-h-screen bg-[#000072] text-white p-4">
        {/* Navigation */}
        <nav className="flex justify-end space-x-4 mb-8">
          <a href="/" className="hover:underline">HOME</a>
          <a href="/about" className="hover:underline">ABOUT</a>
          <a href="/faq" className="hover:underline">FAQ</a>
        </nav>

        <div className="max-w-2xl mx-auto">
          {/* Logo */}
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

          {/* About Content */}
          <div className="space-y-8">
            <div>
              <h4 className="text-xl font-bold text-center mb-4">APA ITU DRAFTANAKITB?</h4>
              <p className="text leading-relaxed">
              DraftAnakITB adalah bot menfess 🤖 yang mewadahi seluruh opini 🗣️ dan pendapat 💬 massa ITB 🎓 tanpa terkecuali. Kami hadir buat kamu yang ingin menyuarakan opini tanpa drama 🎭! Bot menfess ini lebih termoderasi 🛡️ dan fokus untuk jadi tempat nyaman 🛋️ buat massa ITB. Jadi, nggak ada lagi tuh konten yang nggak jelas ❌ atau bikin ribut 🔥.
              </p>
            </div>

            <div>
              <h4 className="text-xl font-bold text-center mb-4">FOR REPORT OR BUSINESS INQUIRIES</h4>
              <div className="text-center space-y-2">
                  <a 
                  href="mailto:draftanakitb.dev@gmail.com"
                  className="hover:underline"
                  >
                  Email: draftanakitb.dev@gmail.com
                  </a>
                  <br />
                  <a 
                  href="https://x.com/satpam_itb" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                  >
                  X: @satpam_itb
                  </a>
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
    </>
  );
};

export default AboutPage;