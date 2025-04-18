import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = ({ showLogo = true }) => {
  return (
    <div className="w-full">
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-12 px-4">
        
        <div className={`flex space-x-6 ${showLogo ? 'flex-1 justify-end' : 'flex-auto justify-end'}`}>
          <Link href="/" className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-300">
            HOME
          </Link>
          <Link href="/leaderboard" className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-300">
            LEADERBOARD
          </Link>
          <Link href="/delvote" className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-300">
            DELVOTE
          </Link>
          <Link href="/about" className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-300">
            ABOUT
          </Link>
          <Link href="/faq" className="text-gray-300 hover:text-white hover:scale-105 transition-all duration-300">
            FAQ
          </Link>
        </div>
      </nav>
{/*       
      {showLogo && (
        <div className="text-center mb-8">
          <Image
            src="/logo.jpg"
            alt="DraftAnakITB Logo" 
            width={100}
            height={100}
            className="mx-auto shadow-lg"
            priority
          />
        </div>
      )} */}
    </div>
  );
};

export default Navbar; 
 
 