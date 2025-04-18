import React, { useState, useEffect, useCallback } from 'react';

const AliasForm = ({ onSubmit, defaultAlias = "Sender", onSkip }) => {
  // Generate a unique default alias with random number suffix
  const generateDefaultAlias = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit number between 1000-9999
    return `Sender${randomNum}`;
  };
  
  const [alias, setAlias] = useState(defaultAlias === "Sender" ? generateDefaultAlias() : defaultAlias);
  const [showInLeaderboard, setShowInLeaderboard] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showExpInfo, setShowExpInfo] = useState(false);
  const [isCheckingAlias, setIsCheckingAlias] = useState(false);
  const [aliasStatus, setAliasStatus] = useState(null); // null = not checked, 'available', 'unavailable'

  // Debounced alias validation using useCallback for stability
  const validateAlias = useCallback(async (aliasToCheck) => {
    if (!aliasToCheck || aliasToCheck.trim().length === 0) {
      setAliasStatus(null);
      return null;
    }
    
    setIsCheckingAlias(true);
    
    try {
      // Use the existing alias check endpoint
      const response = await fetch(`/api/user/alias/check?alias=${encodeURIComponent(aliasToCheck.trim())}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.available === true) {
          setAliasStatus('available');
          setError('');
          return 'available';
        } else {
          setAliasStatus('unavailable');
          setError(data.message || "Nama samaran ini sudah digunakan. Silakan pilih yang lain.");
          return 'unavailable';
        }
      } else {
        // Handle server errors or validation issues
        setAliasStatus('unavailable');
        setError(data.error || "Gagal memvalidasi nama samaran. Silakan coba lagi.");
        return 'unavailable';
      }
    } catch (error) {
      console.error('Alias validation error:', error);
      setAliasStatus('unavailable');
      setError("Terjadi masalah saat memvalidasi nama. Coba nama lain atau coba lagi nanti.");
      return 'unavailable';
    } finally {
      setIsCheckingAlias(false);
    }
  }, []);
  
  // Debounce effect for validating alias as user types
  useEffect(() => {
    // Skip if empty or too short
    if (!alias || alias.trim().length < 3) {
      setAliasStatus(null);
      return;
    }
    
    // Skip validation if it's the original default alias
    if (alias === defaultAlias && defaultAlias.startsWith('Sender')) {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      validateAlias(alias);
    }, 600);
    
    return () => clearTimeout(timeoutId);
  }, [alias, validateAlias, defaultAlias]);
  
  // Main form submission handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Basic validation
    if (!alias || !alias.trim()) {
      setError("Nama samaran tidak boleh kosong");
      return;
    }
    
    if (alias.trim().length < 3) {
      setError("Nama samaran minimal 3 karakter");
      return;
    }
    
    if (alias.trim().length > 20) {
      setError("Nama samaran maksimal 20 karakter");
      return;
    }
    
    // Check for forbidden words
    const forbiddenWords = ["admin", "moderator", "draftanakitb", "admin_itb", "rektor", "dekan"];
    if (forbiddenWords.some(word => alias.toLowerCase().includes(word))) {
      setError("Nama samaran tidak boleh mengandung kata-kata terlarang");
      return;
    }
    
    // Start submission
    setIsSubmitting(true);
    setError("");
    
    try {
      // Always validate uniqueness again before submitting
      const status = await validateAlias(alias);
      
      if (status === 'unavailable') {
        setIsSubmitting(false);
        return; // Error is already set by validateAlias
      }
      
      // Submit only if alias passes validation
      const result = await onSubmit({ 
        alias: alias.trim(),
        showInLeaderboard
      });
      
      // Handle submission result (if there's additional server validation)
      if (result && !result.success) {
        setError(result.error || "Gagal menyimpan nama samaran. Silakan coba lagi.");
      }
    } catch (error) {
      console.error('Submission error:', error);
      setError("Gagal menyimpan nama samaran. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#000072]/30 to-[#000050]/30 rounded-xl border border-white/10 p-6 w-full">
      <h3 className="text-xl font-semibold text-blue-200 mb-4">Buat Nama Samaran</h3>
      
      <p className="text-gray-300 mb-3">
        Nama samaran akan digunakan di leaderboard dan fitur lainnya. 
        Jika tidak diisi, nama default "{alias}" akan digunakan.
      </p>
      
      <div className="bg-yellow-500/10 p-3 rounded-lg mb-4 border border-yellow-500/30">
        <p className="text-yellow-300 text-sm flex items-start">
          <span className="mr-2">⚠️</span>
          <span>Perhatian: Nama samaran hanya dapat diatur satu kali di awal dan tidak dapat diubah kemudian.</span>
        </p>
      </div>
      
      <div className="bg-blue-500/10 p-3 rounded-lg mb-6 border border-blue-500/30">
        <div className="flex justify-between items-start">
          <p className="text-blue-300 text-sm flex items-start">
            <span className="mr-2">✨</span>
            <span>Dapatkan EXP untuk setiap menfess yang kamu kirim dan naik di leaderboard! EXP dapat ditukarkan untuk mengirim paid menfess dan rewards lainnya (coming soon).</span>
          </p>
          <button 
            onClick={() => setShowExpInfo(!showExpInfo)}
            className="text-xs text-blue-300 hover:text-blue-200"
          >
            {showExpInfo ? "Sembunyikan" : "Info"}
          </button>
        </div>
        
        {showExpInfo && (
          <div className="mt-3 text-xs text-gray-300 space-y-2 border-t border-blue-500/20 pt-3">
            <p className="font-semibold text-blue-200">Sistem EXP Draft Anak ITB:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Regular Menfess: <span className="text-green-300">+15 EXP</span></li>
              <li>Paid Menfess: <span className="text-green-300">+35 EXP</span></li>
              <li>Bonus Media: <span className="text-green-300">+5 EXP</span> (gambar) / <span className="text-green-300">+10 EXP</span> (video)</li>
              <li>Weekly Streak: <span className="text-green-300">+5 EXP per hari</span> (maks +35 per minggu)</li>
              {/* <li>Engagement Bonus: <span className="text-green-300">+2 EXP</span> untuk setiap 5 likes</li> */}
            </ul>
            <p className="italic">Level dan rewards akan diumumkan dalam update berikutnya!</p>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="alias" className="block text-sm font-medium text-gray-300 mb-1">
            Nama Samaran
          </label>
          <div className="relative">
            <input
              type="text"
              id="alias"
              value={alias}
              onChange={(e) => {
                const newAlias = e.target.value;
                setAlias(newAlias);
                setError(""); // Clear any existing errors when user types
                // Reset status when user types
                if (newAlias !== alias) {
                  setAliasStatus(null);
                }
              }}
              className={`w-full bg-transparent border ${
                aliasStatus === 'unavailable' ? 'border-red-500' : 
                aliasStatus === 'available' ? 'border-green-500/50' : 
                'border-blue-500/30'
              } focus:border-blue-500 rounded-lg p-3 text-white pr-10`}
              placeholder="Masukkan nama samaran"
              maxLength={20}
              minLength={3}
            />
            
            {/* Status indicators */}
            {isCheckingAlias && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="animate-spin h-5 w-5 text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            )}
            
            {(!isCheckingAlias && aliasStatus === 'unavailable') && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </span>
            )}
            
            {(!isCheckingAlias && aliasStatus === 'available') && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <p className={`text-xs ${
              alias.length > 20 ? 'text-red-400' : 
              alias.length < 3 && alias.length > 0 ? 'text-yellow-400' : 
              'text-gray-400'
            }`}>
              {alias.length}/20 karakter (min 3)
            </p>
            
            {alias.trim().length > 0 && (
              <p className={`text-xs ${
                aliasStatus === 'unavailable' ? 'text-red-400 font-medium' : 
                aliasStatus === 'available' ? 'text-green-400' : 
                'text-gray-400'
              }`}>
                {aliasStatus === 'available' ? '✓ Nama tersedia' : 
                 aliasStatus === 'unavailable' ? '✕ Nama sudah digunakan' : 
                 'Nama harus unik'}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="showInLeaderboard"
            checked={showInLeaderboard}
            onChange={(e) => setShowInLeaderboard(e.target.checked)}
            className="w-4 h-4 rounded bg-transparent border-blue-500"
          />
          <label htmlFor="showInLeaderboard" className="ml-2 text-sm text-gray-300">
            Tampilkan di leaderboard dan ikuti sistem EXP
          </label>
        </div>
        
        {error && (
          <div className="text-red-400 text-sm p-2 bg-red-500/10 rounded border border-red-500/20">
            {error}
          </div>
        )}
        
        <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isCheckingAlias || aliasStatus === 'unavailable' || alias.trim().length < 3}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </button>
          
          <button
            type="button"
            onClick={onSkip}
            disabled={isSubmitting}
            className="flex-1 border border-gray-500 hover:border-gray-400 text-gray-300 hover:text-white py-2 px-4 rounded-lg transition-colors"
          >
            Lewati
          </button>
        </div>
      </div>
    </div>
  );
};

export default AliasForm; 