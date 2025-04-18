"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import Navbar from '@/components/Navbar';

// Trophy Icons
const GoldTrophy = () => (
  <div className="text-yellow-400 text-2xl">🏆</div>
);

const SilverTrophy = () => (
  <div className="text-gray-300 text-2xl">🥈</div>
);

const BronzeTrophy = () => (
  <div className="text-yellow-700 text-2xl">🥉</div>
);

const InfoIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);

const LeaderboardPage = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('all-time'); // 'all-time', 'weekly', 'monthly'

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/leaderboard?period=${period}`);
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data leaderboard');
      }
      
      const data = await response.json();
      setLeaders(data.leaders || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Gagal memuat leaderboard. Silakan coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  // Placeholder data untuk demo. Akan diganti dengan data dari API
  const placeholderLeaders = [
    { rank: 1, alias: "MahasiswaAsik123", messageCount: 42 },
    // { rank: 2, alias: "ITBers2023", messageCount: 36 },
    // { rank: 3, alias: "AnonGanteng", messageCount: 29 },
    // { rank: 4, alias: "FTSLover", messageCount: 23 },
    // { rank: 5, alias: "DraftMaster", messageCount: 21 },
    // { rank: 6, alias: "BucketHatter", messageCount: 19 },
    // { rank: 7, alias: "SBMStudent", messageCount: 17 },
    // { rank: 8, alias: "GaneshaFan", messageCount: 15 },
    // { rank: 9, alias: "AnonymousFTMD", messageCount: 12 },
    // { rank: 10, alias: "Sender", messageCount: 10 },
  ];

  const displayLeaders = leaders.length > 0 ? leaders : placeholderLeaders;

  const getTrophyIcon = (rank) => {
    switch (rank) {
      case 1:
        return <GoldTrophy />;
      case 2:
        return <SilverTrophy />;
      case 3:
        return <BronzeTrophy />;
      default:
        return <div className="text-gray-500 font-bold w-8 text-center">{rank}</div>;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#000072] via-[#000060] to-[#000045] text-white p-4 pb-16">
        <Navbar />

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <Image
              src="/logo.jpg"
              alt="DraftAnakITB Logo" 
              width={100}
              height={100}
              className="mx-auto shadow-lg"
              priority
            />
            <h1 className="text-3xl font-bold mt-6 bg-gradient-to-r from-blue-200 to-blue-400 bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <p className="mt-4 text-gray-300 max-w-xl mx-auto">
              Top Sender berdasarkan jumlah menfess yang telah dikirim
            </p>
          </div>

          <div className="mb-6 flex justify-center space-x-2">
            <button 
              onClick={() => setPeriod('all-time')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                period === 'all-time' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-900/40 text-gray-300 hover:bg-blue-900/60'
              }`}
            >
              All Time
            </button>
            <button 
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                period === 'monthly' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-900/40 text-gray-300 hover:bg-blue-900/60'
              }`}
            >
              Bulan Ini
            </button>
            <button 
              onClick={() => setPeriod('weekly')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                period === 'weekly' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-900/40 text-gray-300 hover:bg-blue-900/60'
              }`}
            >
              Minggu Ini
            </button>
          </div>

          <div className="bg-gradient-to-b from-[#000072]/30 to-[#000050]/30 rounded-xl border border-white/10 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-gray-300">Memuat leaderboard...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-400">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-900/30">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Peringkat</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Nama Samaran</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-300">Jumlah Menfess</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayLeaders.map((leader, index) => (
                      <tr 
                        key={index}
                        className={`${
                          index % 2 === 0 ? 'bg-blue-900/10' : 'bg-blue-900/20'
                        } ${
                          index < 3 ? 'font-semibold' : ''
                        }`}
                      >
                        <td className="px-4 py-4 text-left flex items-center">
                          {getTrophyIcon(leader.rank)}
                        </td>
                        <td className="px-4 py-4 text-white">
                          {leader.alias}
                        </td>
                        <td className="px-4 py-4 text-right text-blue-200">
                          {leader.messageCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 bg-blue-900/20 p-4 rounded-lg border border-blue-500/20 flex items-start space-x-3">
            <div className="text-blue-300 flex-shrink-0 mt-1">
              <InfoIcon />
            </div>
            <div className="text-sm text-gray-300">
              <p>Leaderboard menampilkan pengguna berdasarkan jumlah menfess yang telah dikirim. Untuk menampilkan nama samaran Anda di leaderboard, pilih opsi &quot;Tampilkan di leaderboard&quot; saat mengatur nama samaran Anda.</p>
              <p className="mt-2">Nama samaran dapat diatur setelah verifikasi email.</p>
            </div>
          </div>
        </div>
      </div>

      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9161286456755540"
        crossOrigin="anonymous"
      />
    </>
  );
};

export default LeaderboardPage; 
 
 
 