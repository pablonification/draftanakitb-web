"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [paidTweets, setPaidTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingStates, setLoadingStates] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminStats, setAdminStats] = useState(null);
  const [regularTweets, setRegularTweets] = useState([]);
  const [activeTab, setActiveTab] = useState('paid');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('message');
  const [searchStatus, setSearchStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const tweetsPerPage = 10;
  const router = useRouter();
  const [urlInputs, setUrlInputs] = useState({});
  const [urlUpdateTimeout, setUrlUpdateTimeout] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInputValue, setSearchInputValue] = useState('');
  const [batchChanges, setBatchChanges] = useState([]);
  const [batchNotifications, setBatchNotifications] = useState([]);

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

  // Improved fetch with timeout and cleanup
  const fetchWithTimeout = async (url, options = {}, timeout = 30000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      // Handle timeout more gracefully
      if (error.name === 'AbortError') {
        return {
          ok: false,
          status: 408,
          json: async () => ({ error: 'Request timed out' })
        };
      }
      throw error;
    } finally {
      clearTimeout(id);
    }
  };

  // Improved fetch with retry
  const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetchWithTimeout(url, options);
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        return response;
      } catch (error) {
        lastError = error;
        if (i === maxRetries - 1) break;
        
        // Don't retry on authentication errors
        if (error.message.includes('401') || error.message.includes('403')) {
          throw error;
        }
        
        const delay = Math.min(1000 * Math.pow(2, i), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  };

  // Add debounce utility
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const fetchPaidTweets = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Authentication token missing');
        return;
      }

      const searchParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: tweetsPerPage.toString()
      });

      if (searchQuery) {
        searchParams.append('search', searchQuery);
        searchParams.append('searchType', searchType);
      }

      if (searchStatus !== 'all') {
        searchParams.append('status', searchStatus);
      }

      const response = await fetchWithRetry(
        `/api/admin/tweets?${searchParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setPaidTweets(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(data.tweets)) {
            return data.tweets;
          }
          return prev;
        });
        setTotalPages(data.totalPages);
      } else {
        throw new Error(data.error || 'Failed to fetch tweets');
      }
    } catch (error) {
      console.error('Error fetching tweets:', error);
      setError(
        error.message === 'Request timed out'
          ? 'Request timed out. Please try again.'
          : `Failed to fetch tweets: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Debounced version of fetchPaidTweets
  const debouncedFetchPaidTweets = debounce(fetchPaidTweets, 300);

  const fetchRegularTweets = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Authentication token missing');
        return;
      }

      const searchParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: tweetsPerPage.toString()
      });

      if (searchQuery) {
        searchParams.append('search', searchQuery);
        searchParams.append('searchType', searchType);
      }

      if (searchStatus !== 'all') {
        searchParams.append('status', searchStatus);
      }

      const response = await fetchWithRetry(
        `/api/admin/regular?${searchParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setRegularTweets(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(data.tweets)) {
            return data.tweets;
          }
          return prev;
        });
        setTotalPages(data.totalPages);
      } else {
        throw new Error(data.error || 'Failed to fetch regular tweets');
      }
    } catch (error) {
      console.error('Error fetching regular tweets:', error);
      setError(
        error.message === 'Request timed out'
          ? 'Request timed out. Please try again.'
          : `Failed to fetch regular tweets: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Debounced version of fetchRegularTweets
  const debouncedFetchRegularTweets = debounce(fetchRegularTweets, 300);

  // Function to add changes to batch
  const addToBatch = (tweetId, status, tweetUrl) => {
    setBatchChanges(prev => {
      const existing = prev.find(change => change.tweetId === tweetId);
      if (existing) {
        return prev.map(change => 
          change.tweetId === tweetId ? { ...change, status, tweetUrl } : change
        );
      }
      return [...prev, { tweetId, status, tweetUrl }];
    });
  };

  // Function to add notifications to batch
  const addToNotificationBatch = (tweetId) => {
    setBatchNotifications(prev => [...new Set([...prev, tweetId])]);
  };

  // Function to save all batch changes
  const saveBatchChanges = async () => {
    const loadingKey = 'batch_save';
    try {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
      setError('');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Authentication token missing');
      }

      for (const change of batchChanges) {
        const endpoint = activeTab === 'paid' ? `/api/admin/tweets/${change.tweetId}` : `/api/admin/regular/${change.tweetId}`;
        
        const response = await fetchWithRetry(
          endpoint,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            body: JSON.stringify({ 
              status: change.status, 
              tweetUrl: change.tweetUrl 
            })
          },
          3 // max retries
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update tweet status');
        }
      }

      // Show success message
      setSuccessMessage('All changes saved successfully');
      
      // Refresh the data to ensure consistency
      if (activeTab === 'paid') {
        await fetchPaidTweets();
      } else {
        await fetchRegularTweets();
      }
      
      // Update admin stats
      await fetchAdminStats();
      
      // Clear batch after successful save
      setBatchChanges([]);

    } catch (error) {
      console.error('Batch save error:', error);
      setError(`Failed to save changes: ${error.message}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
      setTimeout(() => setSuccessMessage(''), 2000);
    }
  };

  // Update handleSendNotification to properly update the state
  const handleSendNotification = async (tweetId, addToBatchOnly = false) => {
    const loadingKey = `notify_${tweetId}`;
    try {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
      setError('');

      if (addToBatchOnly) {
        addToNotificationBatch(tweetId);
        setSuccessMessage('Added to notification batch');
        return;
      }

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Authentication token missing');
      }

      const response = await fetchWithRetry(
        `/api/admin/notify/${tweetId}`,
        {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        },
        3 // max retries
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send notification');
      }

      // Update the state immediately
      setPaidTweets(prev => 
        prev.map(tweet => 
          tweet._id === tweetId 
            ? { ...tweet, notificationSent: true }
            : tweet
        )
      );

      setSuccessMessage('Notification sent successfully');

    } catch (error) {
      console.error('Notification error:', error);
      setError(`Failed to send notification: ${error.message}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
      setTimeout(() => setSuccessMessage(''), 2000);
    }
  };

  // Update sendBatchNotifications to properly update the state
  const sendBatchNotifications = async () => {
    const loadingKey = 'batch_notify';
    try {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
      setError('');

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Authentication token missing');
      }

      const successfulNotifications = [];

      for (const tweetId of batchNotifications) {
        try {
          const response = await fetchWithRetry(
            `/api/admin/notify/${tweetId}`,
            {
              method: 'POST',
              headers: { 
                Authorization: `Bearer ${token}`,
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              }
            },
            3 // max retries
          );

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to send notification');
          }

          successfulNotifications.push(tweetId);
        } catch (error) {
          console.error(`Failed to send notification for tweet ${tweetId}:`, error);
        }
      }

      // Update state for successful notifications
      if (successfulNotifications.length > 0) {
        setPaidTweets(prev => 
          prev.map(tweet => 
            successfulNotifications.includes(tweet._id)
              ? { ...tweet, notificationSent: true }
              : tweet
          )
        );
      }

      setSuccessMessage(`Successfully sent ${successfulNotifications.length} notifications`);
      setBatchNotifications([]); // Clear batch after success

    } catch (error) {
      console.error('Batch notification error:', error);
      setError(`Failed to send notifications: ${error.message}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
      setTimeout(() => setSuccessMessage(''), 2000);
    }
  };

  // Update handleStatusUpdate to add changes to batch
  const handleStatusUpdate = async (tweetId, status, tweetUrl = '') => {
    addToBatch(tweetId, status, tweetUrl);
    // Optimistically update the UI
    if (activeTab === 'paid') {
      setPaidTweets(prev => 
        prev.map(tweet => 
          tweet._id === tweetId 
            ? { ...tweet, tweetStatus: status, tweetUrl: status === 'posted' ? (tweetUrl || tweet.tweetUrl) : '' }
            : tweet
        )
      );
    } else {
      setRegularTweets(prev => 
        prev.map(tweet => 
          tweet._id === tweetId 
            ? { ...tweet, tweetStatus: status }
            : tweet
        )
      );
    }
  };

  const handleAddTestData = async () => {
    const loadingKey = 'add_paid_test';
    try {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
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
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      await fetchPaidTweets();
      
    } catch (error) {
      console.error('Error adding test data:', error);
      setError(error.message);
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleAddRegularTestData = async () => {
    const loadingKey = 'add_regular_test';
    try {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
      setError('');
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Not authorized. Please login again.');
      }

      console.log('Adding regular test data...');
      const response = await fetch('/api/admin/test', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'regular' })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add test data');
      }

      setSuccessMessage(`Successfully added ${data.insertedCount} test regular tweets`);
      await fetchRegularTweets();
      
    } catch (error) {
      console.error('Error adding regular test data:', error);
      setError(error.message);
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
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

  // Replace the cleanup useEffect with this simpler version that just refreshes data
  useEffect(() => {
    if (isLoggedIn) {
      fetchPaidTweets();
      fetchRegularTweets();
      // Refresh data every 5 minutes
      const interval = setInterval(() => {
        fetchPaidTweets();
        fetchRegularTweets();
      }, 300000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // Add custom SVG icons at the top
  const DashboardIcon = () => (
    <svg 
      className="w-6 h-6 text-blue-400" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
    >
      <path d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const LogoutIcon = () => (
    <svg 
      className="w-5 h-5" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
    >
      <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const TestDataIcon = () => (
    <svg 
      className="w-5 h-5" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
    >
      <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const CopyIcon = () => (
    <svg 
      className="w-4 h-4" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
    >
      <path d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const NotificationIcon = () => (
    <svg 
      className="w-5 h-5" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
    >
      <path d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const handleDelete = async (tweetId) => {
    const loadingKey = `delete_${tweetId}`;
    try {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
      const token = localStorage.getItem('adminToken');
      const endpoint = activeTab === 'paid' ? `/api/admin/tweets/${tweetId}` : `/api/admin/regular/${tweetId}`;
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage('Tweet deleted successfully');
        if (activeTab === 'paid') {
          await fetchPaidTweets();
        } else {
          await fetchRegularTweets();
        }
        await fetchAdminStats();
      } else {
        setError(data.error || 'Failed to delete tweet');
      }
    } catch (error) {
      setError('Failed to delete tweet');
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
      setTimeout(() => setSuccessMessage(''), 1000);
    }
  };

  // Simplified fetch function without search logic in useEffect
  useEffect(() => {
    if (isLoggedIn) {
      if (activeTab === 'paid') {
        fetchPaidTweets();
      } else {
        fetchRegularTweets();
      }
    }
  }, [isLoggedIn, activeTab, currentPage, searchQuery, searchType, searchStatus]);

  // Separate search handler
  const handleSearch = () => {
    if (searchInputValue !== searchQuery) {
      setSearchQuery(searchInputValue);
      setCurrentPage(1);
      // Trigger immediate fetch
      if (activeTab === 'paid') {
        fetchPaidTweets();
      } else {
        fetchRegularTweets();
      }
    }
  };

  // Update search type handler
  const handleSearchTypeChange = (newType) => {
    setSearchType(newType);
    if (searchInputValue) {
      setCurrentPage(1);
      if (activeTab === 'paid') {
        fetchPaidTweets();
      } else {
        fetchRegularTweets();
      }
    }
  };

  // Add status change handler
  const handleStatusChange = (newStatus) => {
    setSearchStatus(newStatus);
    setCurrentPage(1);
    if (activeTab === 'paid') {
      fetchPaidTweets();
    } else {
      fetchRegularTweets();
    }
  };

  // Update the search section JSX
  const searchSection = (
    <div className="flex-1 w-full">
      <div className="flex gap-2 max-sm:flex-col">
        <div className="w-40 max-sm:w-full">
          <select
            value={searchType}
            onChange={(e) => handleSearchTypeChange(e.target.value)}
            className="w-full px-2 py-2 rounded-xl border border-white/10 bg-black/40 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          >
            <option value="message">Search by Message</option>
            <option value="email">Search by Email</option>
          </select>
        </div>
        <div className="w-40 max-sm:w-full">
          <select
            value={searchStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-2 py-2 rounded-xl border border-white/10 bg-black/40 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="posted">Posted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="flex-1 relative flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={searchType === 'email' ? "Search by email..." : "Search in messages..."}
              className="w-full px-4 py-2 pl-10 rounded-xl border border-white/10 bg-black/40 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />
            <svg 
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 rounded-xl transition-all text-sm whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );

  // Update tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    // Only keep search if there's an actual query
    if (!searchInputValue) {
      setSearchQuery('');
    }
  };

  // Add pagination controls component
  const PaginationControls = ({ totalPages }) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    
    return (
      <div className="flex items-center justify-center gap-2 p-6 border-t border-white/5">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1 || loading}
          className="px-3 py-1 rounded-lg bg-black/40 text-gray-300 hover:bg-black/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Previous
        </button>
        {pages.map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            disabled={loading}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              currentPage === page
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/20'
                : 'bg-black/40 text-gray-300 hover:bg-black/60'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || loading}
          className="px-3 py-1 rounded-lg bg-black/40 text-gray-300 hover:bg-black/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Next
        </button>
      </div>
    );
  };

  // Reset page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const handleUrlInputChange = (tweetId, value) => {
    // Update local state immediately for smooth typing
    setUrlInputs(prev => ({ ...prev, [tweetId]: value }));
    
    // Clear any existing timeout
    if (urlUpdateTimeout) {
      clearTimeout(urlUpdateTimeout);
    }
    
    // Set new timeout for the API call
    const timeoutId = setTimeout(() => {
      handleStatusUpdate(tweetId, 'posted', value);
    }, 1500); // Increased to 1.5 seconds for better debouncing
    
    setUrlUpdateTimeout(timeoutId);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (urlUpdateTimeout) {
        clearTimeout(urlUpdateTimeout);
      }
    };
  }, [urlUpdateTimeout]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedFetchPaidTweets.cancel?.();
      debouncedFetchRegularTweets.cancel?.();
    };
  }, []);

  // Update the initial loading state
  if (!isLoggedIn && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000030] via-[#000025] to-[#000020] flex items-center justify-center">
        <div className="flex items-center justify-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000030] via-[#000025] to-[#000020] flex items-center justify-center">
        <div className="bg-black/40 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-96 border border-white/10">
          <div className="text-center mb-8">
            <DashboardIcon />
            <h1 className="text-3xl font-bold mt-4 bg-gradient-to-r from-blue-200 to-blue-400 bg-clip-text text-transparent">
              Admin Login
            </h1>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-400 text-center">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-blue-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Update the batch action buttons JSX to show loading state
  const batchActionButtons = (
    <div className="flex items-center gap-4 mt-4 bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-white/10">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={saveBatchChanges}
          disabled={loadingStates.batch_save || batchChanges.length === 0}
          className="flex items-center gap-2 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-300 border border-green-500/20 rounded-xl transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingStates.batch_save ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-300"></div>
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Changes ({batchChanges.length})</span>
          )}
        </button>
        <button 
          onClick={sendBatchNotifications}
          disabled={loadingStates.batch_notify || batchNotifications.length === 0}
          className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 rounded-xl transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <NotificationIcon />
          {loadingStates.batch_notify ? (
            <span>Sending...</span>
          ) : (
            <span>Send Notifications ({batchNotifications.length})</span>
          )}
        </button>
      </div>
      {(batchChanges.length > 0 || batchNotifications.length > 0) && (
        <div className="text-sm text-gray-400">
          {batchChanges.length > 0 && <span>{batchChanges.length} changes pending</span>}
          {batchChanges.length > 0 && batchNotifications.length > 0 && <span> • </span>}
          {batchNotifications.length > 0 && <span>{batchNotifications.length} notifications queued</span>}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#000030] via-[#000025] to-[#000020] text-white">
        <div className="bg-black/40 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="absolute right-4 top-0 sm:top-4 h-16 flex items-center gap-2">
              <button 
                onClick={handleAddTestData}
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-sm"
              >
                <TestDataIcon />
                <span>Add Paid Test</span>
              </button>
              <button 
                onClick={handleAddRegularTestData}
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-sm"
              >
                <TestDataIcon />
                <span>Add Regular Test</span>
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 rounded-xl transition-all text-sm"
              >
                <LogoutIcon />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

            <div className="py-6 sm:pt-6 pt-0">
              <div className="h-16 flex items-center mb-6">
                <div className="flex items-center gap-3">
                  <DashboardIcon />
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-blue-400 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                </div>
              </div>
              
              <div className="bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-white/10">
                {statsDisplay}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Search and filter section */}
            <div className="flex items-center gap-4 max-sm:flex-col">
              {searchSection}
              <div className="inline-flex p-0.5 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 max-sm:w-full max-sm:justify-center shrink-0 w-[172px]">
                <button
                  onClick={() => handleTabChange('paid')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all text-sm ${
                    activeTab === 'paid' 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Paid
                </button>
                <button
                  onClick={() => handleTabChange('regular')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all text-sm ${
                    activeTab === 'regular' 
                      ? 'bg-blue-500/20 text-blue-300' 
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Regular
                </button>
              </div>
            </div>

            {/* Batch action buttons */}
            {batchActionButtons}

            <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
              <ul className="divide-y divide-white/5">
                {(() => {
                  const tweets = activeTab === 'paid' ? paidTweets : regularTweets;
                  
                  if (loading) {
                    return (
                      <li className="p-6">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                          <span className="ml-3 text-gray-400">Loading tweets...</span>
                        </div>
                      </li>
                    );
                  }
                  
                  if (tweets.length === 0) {
                    return (
                      <li className="p-6 text-center text-gray-400">
                        {searchQuery ? 'No tweets found matching your search.' : 'No tweets available.'}
                      </li>
                    );
                  }

                  return (
                    <>
                      {tweets.map((tweet) => (
                        <li key={tweet._id} className="p-6 hover:bg-black/60 transition-all">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <p className="text-sm text-blue-300">
                                    {tweet.email}
                                  </p>
                                  {tweet.mediaUrl && (
                                    <span className="px-2 py-0.5 text-xs bg-blue-500/10 text-blue-300 rounded-full border border-blue-500/20">
                                      Has Media
                                    </span>
                                  )}
                                  {activeTab === 'paid' ? (
                                    tweet.tweetUrl && (
                                      <a
                                        href={tweet.tweetUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2 py-0.5 text-xs bg-green-500/10 text-green-300 rounded-full border border-green-500/20 hover:bg-green-500/20 transition-all"
                                      >
                                        View Tweet
                                      </a>
                                    )
                                  ) : (
                                    tweet.tweetId && (
                                      <a 
                                        href={`https://twitter.com/x/status/${tweet.tweetId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2 py-0.5 text-xs bg-green-500/10 text-green-300 rounded-full border border-green-500/20 hover:bg-green-500/20 transition-all"
                                      >
                                        View Tweet
                                      </a>
                                    )
                                  )}
                                  {activeTab === 'paid' && (
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                      tweet.tweetStatus === 'posted' 
                                        ? 'bg-green-500/10 text-green-300 border border-green-500/20'
                                        : tweet.tweetStatus === 'pending'
                                          ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20'
                                          : 'bg-red-500/10 text-red-300 border border-red-500/20'
                                    }`}>
                                      {tweet.tweetStatus.toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-start gap-2">
                                  <p className="text-sm text-gray-300 break-words whitespace-pre-wrap">
                                    {tweet.messageText}
                                  </p>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={async () => {
                                        if (await copyToClipboard(tweet.messageText)) {
                                          setSuccessMessage('Message copied to clipboard!');
                                          setTimeout(() => setSuccessMessage(''), 1000);
                                        }
                                      }}
                                      className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-gray-300 transition-all"
                                      title="Copy message"
                                    >
                                      <CopyIcon />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(tweet._id)}
                                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-300 hover:text-red-200 transition-all disabled:opacity-50"
                                      disabled={loadingStates[`delete_${tweet._id}`]}
                                      title={loadingStates[`delete_${tweet._id}`] ? 'Deleting...' : 'Delete tweet'}
                                    >
                                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                <p className="text-xs text-gray-400">
                                  Sent: {new Date(activeTab === 'paid' ? (tweet.postedAt || tweet.createdAt) : tweet.createdAt).toLocaleString()}
                                </p>
                                {tweet.mediaUrl && (
                                  <div className="mt-3">
                                    {isVideoFile(tweet.mediaUrl) ? (
                                      <div className="relative">
                                        <video
                                          key={tweet.mediaUrl}
                                          className="max-h-64 w-auto rounded-xl shadow-lg"
                                          controls
                                          playsInline
                                          preload="metadata"
                                        >
                                          <source src={tweet.mediaUrl} type="video/mp4" />
                                        </video>
                                      </div>
                                    ) : (
                                      <img
                                        src={tweet.mediaUrl}
                                        alt="Tweet media"
                                        className="max-h-64 w-auto rounded-xl shadow-lg"
                                      />
                                    )}
                                    <div className="mt-3 flex gap-2">
                                      <a
                                        href={tweet.mediaUrl}
                                        download={`media-${tweet._id}${isVideoFile(tweet.mediaUrl) ? '.mp4' : '.jpg'}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-all"
                                      >
                                        Download Media
                                      </a>
                                      {!isBase64Url(tweet.mediaUrl) && (
                                        <a
                                          href={tweet.mediaUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-all"
                                        >
                                          Open in New Tab
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {activeTab === 'paid' && (
                              <div className="flex flex-wrap items-center gap-2">
                                <select
                                  value={tweet.tweetStatus}
                                  onChange={(e) => handleStatusUpdate(tweet._id, e.target.value)}
                                  className="w-full sm:w-auto px-4 py-2 rounded-xl border border-white/10 bg-black/40 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                  disabled={loadingStates[`status_${tweet._id}`]}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="posted">Posted</option>
                                  <option value="rejected">Rejected</option>
                                </select>

                                {tweet.tweetStatus === 'posted' && (
                                  <div className="flex-1 min-w-[200px] sm:min-w-[400px] lg:min-w-[500px]">
                                    <input
                                      type="text"
                                      placeholder="Tweet URL"
                                      value={urlInputs[tweet._id] ?? tweet.tweetUrl ?? ''}
                                      onChange={(e) => handleUrlInputChange(tweet._id, e.target.value)}
                                      className="w-full px-4 py-2 rounded-xl border border-white/10 bg-black/40 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                      disabled={loadingStates[`status_${tweet._id}`]}
                                    />
                                  </div>
                                )}

                                {tweet.tweetStatus === 'posted' && tweet.tweetUrl && !tweet.notificationSent && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleSendNotification(tweet._id, false)}
                                      className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 rounded-xl transition-all disabled:opacity-50 text-sm shrink-0"
                                      disabled={loadingStates[`notify_${tweet._id}`]}
                                    >
                                      <NotificationIcon />
                                      <span>{loadingStates[`notify_${tweet._id}`] ? 'Sending...' : 'Send Now'}</span>
                                    </button>
                                    <button
                                      onClick={() => handleSendNotification(tweet._id, true)}
                                      className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 rounded-xl transition-all text-sm shrink-0"
                                      disabled={batchNotifications.includes(tweet._id)}
                                    >
                                      <NotificationIcon />
                                      <span>{batchNotifications.includes(tweet._id) ? 'Added to Batch' : 'Add to Batch'}</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </>
                  );
                })()}
              </ul>
              {/* Pagination controls */}
              {totalPages > 1 && (
                <PaginationControls 
                  totalPages={totalPages} 
                />
              )}
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
}