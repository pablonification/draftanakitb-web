"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [paidTweets, setPaidTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminStats, setAdminStats] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    // Restore admin name from localStorage
    const savedAdminName = localStorage.getItem('adminName');
    if (savedAdminName) {
      setAdminName(savedAdminName);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminName', data.admin.name);
        setAdminName(data.admin.name);
        setIsLoggedIn(true);
        setUsername('');
        setPassword('');
        fetchPaidTweets();
        fetchAdminStats();
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setIsLoggedIn(true);
        fetchPaidTweets();
      } else {
        handleLogout();
      }
    } catch (error) {
      handleLogout();
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
  };

  const fetchPaidTweets = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        console.error('No token found');
        setError('Authentication token missing');
        return;
      }

      console.log('Fetching tweets with token:', token);
      const response = await fetch('/api/admin/tweets', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      const data = await response.json();
      console.log('Tweets API response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tweets');
      }

      if (data.success && Array.isArray(data.tweets)) {
        console.log('Setting tweets:', data.tweets.length, 'items');
        setPaidTweets(data.tweets);
      } else {
        console.error('Invalid tweets data:', data);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching tweets:', error);
      setError(`Failed to fetch tweets: ${error.message}`);
      setPaidTweets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (tweetId, status, tweetUrl = '') => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/tweets/${tweetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, tweetUrl })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage('Tweet status updated successfully');
        await fetchPaidTweets();
        await fetchAdminStats();
      } else {
        setError(data.error || 'Failed to update tweet status');
      }
    } catch (error) {
      setError('Failed to update tweet status');
    } finally {
      setActionLoading(false);
      setTimeout(() => setSuccessMessage(''), 1000);
    }
  };

  const handleSendNotification = async (tweetId) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/notify/${tweetId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage('Notification sent successfully');
        await fetchPaidTweets();
      } else {
        setError(data.error || 'Failed to send notification');
      }
    } catch (error) {
      setError('Failed to send notification');
    } finally {
      setActionLoading(false);
      setTimeout(() => setSuccessMessage(''), 1000);
    }
  };

  const handleAddTestData = async () => {
    try {
      setActionLoading(true);
      setError('');
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Not authorized. Please login again.');
      }

      console.log('Adding test data...');
      const response = await fetch('/api/admin/test', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Test data response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add test data');
      }

      setSuccessMessage(`Successfully added ${data.insertedCount} test tweets`);
      
      // Add a longer delay before fetching to ensure database operations are complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      await fetchPaidTweets();
      
    } catch (error) {
      console.error('Error adding test data:', error);
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch('/api/admin/stats', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setAdminStats(data.stats);
        // Store both stats and admin name
        localStorage.setItem('adminStats', JSON.stringify(data.stats));
        if (data.stats.adminName) {
          setAdminName(data.stats.adminName);
          localStorage.setItem('adminName', data.stats.adminName);
        }
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      // Try to load from localStorage if fetch fails
      const cachedStats = localStorage.getItem('adminStats');
      if (cachedStats) {
        setAdminStats(JSON.parse(cachedStats));
      }
    }
  };

  // Add this useEffect to fetch stats periodically
  useEffect(() => {
    if (isLoggedIn) {
      fetchAdminStats();
      // Refresh stats every hour (3600000 ms)
      const interval = setInterval(fetchAdminStats, 3600000); // 1 HOUR
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // Update the stats display in the UI
  const statsDisplay = adminStats && (
    <div>
      <p className="text-gray-300">Welcome, <span className="font-bold text-white">{adminName}</span></p>
      <p className="text-sm text-gray-400">
        Your Tweets: {adminStats.tweetsPosted} / Total System Tweets: {adminStats.totalTweetsInSystem} | 
        Your Share: {adminStats.profitSharePercentage}%
      </p>
      {adminStats.adminShares && (
        <div className="mt-2 text-xs text-gray-500">
          All Admin Shares: {adminStats.adminShares.map(admin => 
            `${admin.adminName}: ${admin.sharePercentage}%`
          ).join(' | ')}
        </div>
      )}
    </div>
  );

  // Add this helper function at the top level of your component
  const isVideoFile = (url) => {
    if (!url) return false;
    // Check both extension and MIME type patterns
    return url.match(/\.(mp4|webm|ogg)$/i) || url.includes('video');
  };

  // Add this helper function at the top level of your component after isVideoFile
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy text:', err);
      return false;
    }
  };

  // Add this helper function at the top level
  const isBase64Url = (url) => {
    return url?.startsWith('data:');
  };

  // Replace the cleanup useEffect with this version
useEffect(() => {
  let cleanupInterval = null;
  const ONE_HOUR = 3600000; // 1 hour in milliseconds

  async function cleanupAllPostedMedia() {
    const currentTime = new Date().toLocaleTimeString();
    console.log(`[${currentTime}] Running hourly media cleanup...`);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token || !isLoggedIn || !paidTweets?.length) {
        console.log('Skipping cleanup - prerequisites not met');
        return;
      }

      const postedTweetsWithMedia = paidTweets.filter(
        tweet => tweet.tweetStatus === 'posted' && 
                tweet.mediaUrl && 
                !tweet.mediaDeleted
      );

      if (postedTweetsWithMedia.length === 0) {
        console.log('No media to clean up at this time');
        return;
      }

      console.log(`Found ${postedTweetsWithMedia.length} tweets with media to clean up`);

      for (const tweet of postedTweetsWithMedia) {
        try {
          const response = await fetch(`/api/admin/media/${tweet._id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();
          if (response.ok && data.success) {
            console.log(`✅ Cleaned up media for tweet ${tweet._id}`);
          }
        } catch (err) {
          console.error(`❌ Error cleaning up tweet ${tweet._id}:`, err);
        }
      }

      await fetchPaidTweets();
      console.log(`[${currentTime}] Cleanup cycle complete`);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  if (isLoggedIn) {
    // Clear any existing interval first
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
    }

    // Run initial cleanup
    console.log('Running initial media cleanup...');
    cleanupAllPostedMedia();

    // Set up hourly interval
    console.log('Setting up hourly cleanup schedule...');
    cleanupInterval = setInterval(cleanupAllPostedMedia, ONE_HOUR);
    console.log('Media cleanup scheduled to run every hour');
  }

  // Cleanup function
  return () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval);
      console.log('Cleanup interval cleared');
    }
  };
}, [isLoggedIn, paidTweets]); // Dependencies

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="bg-gray-800/90 backdrop-blur-sm p-8 rounded-lg shadow-2xl w-96 border border-gray-700">
          <h1 className="text-3xl font-bold mb-6 text-center text-white">Admin Login</h1>
          {error && (
            <div className="bg-red-900/50 border-l-4 border-red-500 text-red-200 p-4 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 rounded-md border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-white">Paid Menfess Dashboard</h1>
              <div className="space-x-4">
                <button 
                  onClick={handleAddTestData} 
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 mr-2"
                >
                  Add Test Data
                </button>
                <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                  Logout
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between bg-gray-700/50 p-4 rounded-lg">
              {statsDisplay}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-900/50 border-l-4 border-red-500 text-red-200 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="fixed top-4 right-4 bg-green-900/90 text-green-200 px-4 py-2 rounded-md border border-green-600 shadow-lg">
            {successMessage}
          </div>
        )}

        {actionLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-gray-800 p-4 rounded-lg shadow-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          </div>
        )}

        <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-700">
          <ul className="divide-y divide-gray-700">
            {Array.isArray(paidTweets) && paidTweets.length > 0 ? (
              paidTweets.map((tweet) => (
                <li key={tweet._id} className="p-6 hover:bg-gray-700/50 transition duration-150">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-200">
                          Email: {tweet.email}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-300">
                            Message: {tweet.messageText}
                          </p>
                          <button
                            onClick={async () => {
                              if (await copyToClipboard(tweet.messageText)) {
                                setSuccessMessage('Message copied to clipboard!');
                                setTimeout(() => setSuccessMessage(''), 1000);
                              }
                            }}
                            className="p-1 rounded hover:bg-gray-600 transition-colors"
                            title="Copy message"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2z" />
                            </svg>
                          </button>
                        </div>
                        {tweet.mediaUrl && (
                          <div className="mt-2">
                            {isVideoFile(tweet.mediaUrl) ? (
                              <div className="relative">
                                <video
                                  key={tweet.mediaUrl} // Add key to force remount
                                  className="mt-2 max-h-64 w-auto rounded-lg shadow-md"
                                  controls
                                  playsInline
                                  preload="metadata"
                                  controlsList="nodownload"
                                  onError={(e) => console.error('Video Error:', e)}
                                >
                                  <source 
                                    src={tweet.mediaUrl} 
                                    type="video/mp4"
                                  />
                                  {/* Fallback content */}
                                  <div className="bg-gray-700 p-2 rounded text-sm text-gray-300">
                                    Video cannot be previewed.
                                    <a 
                                      href={tweet.mediaUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="ml-2 text-blue-400 hover:underline"
                                    >
                                      Open in new tab
                                    </a>
                                  </div>
                                </video>
                              </div>
                            ) : (
                              <img
                                src={tweet.mediaUrl}
                                alt="Tweet media"
                                className="mt-2 max-h-64 w-auto rounded-lg shadow-md"
                              />
                            )}
                            <div className="mt-2 space-x-2">
                              <a
                                href={tweet.mediaUrl}
                                download={`media-${tweet._id}${isVideoFile(tweet.mediaUrl) ? '.mp4' : '.jpg'}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                              >
                                Download Media
                              </a>
                              {!isBase64Url(tweet.mediaUrl) && (
                                <a
                                  href={tweet.mediaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                                >
                                  Open in New Tab
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        tweet.tweetStatus === 'posted' 
                          ? 'bg-green-900/50 text-green-200 border border-green-600'
                          : tweet.tweetStatus === 'pending'
                            ? 'bg-yellow-900/50 text-yellow-200 border border-yellow-600'
                            : 'bg-red-900/50 text-red-200 border border-red-600'
                      }`}>
                        {tweet.tweetStatus.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <select
                        value={tweet.tweetStatus}
                        onChange={(e) => handleStatusUpdate(tweet._id, e.target.value)}
                        className="rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 py-2"
                        disabled={actionLoading}
                      >
                        <option value="pending">Pending</option>
                        <option value="posted">Posted</option>
                        <option value="rejected">Rejected</option>
                      </select>

                      {tweet.tweetStatus === 'posted' && (
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Tweet URL"
                            value={tweet.tweetUrl || ''}
                            onChange={(e) => handleStatusUpdate(tweet._id, 'posted', e.target.value)}
                            className="w-full rounded-md border-gray-600 bg-gray-700 text-white placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 py-2"
                          />
                        </div>
                      )}

                      {tweet.tweetStatus === 'posted' && tweet.tweetUrl && !tweet.notificationSent && (
                        <button
                          onClick={() => handleSendNotification(tweet._id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50"
                          disabled={actionLoading}
                        >
                          {actionLoading ? 'Sending...' : 'Send Notification'}
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-6 py-8 text-center text-gray-400 bg-gray-800/50">
                No paid tweets found
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}