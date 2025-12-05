// src/components/StorageTracker.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface StorageSectionData {
  fileCount: number;
  approximateSize: number; // Size in MB (estimated)
}

interface StorageStats {
  profileImages: StorageSectionData;
  gallery: StorageSectionData;
  documents: StorageSectionData;
  totalUsed: number; // Total in MB
  totalAvailable: number; // Total in MB
  usedPercentage: number;
}

// Default quotas in MB (since file sizes from Supabase storage don't provide exact sizes easily)
const DEFAULT_FREE_TIER_QUOTA_MB = 1024; // 1 GB in MB
const DEFAULT_PAID_TIER_QUOTA_MB = 10 * 1024; // 10 GB in MB

export default function StorageTracker() {
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<'free' | 'paid'>('free');

  // Convert MB to human-readable format
  const formatSize = (mb: number, decimals = 2): string => {
    if (mb === 0) return '0 MB';

    if (mb < 1024) {
      return `${parseFloat(mb.toFixed(decimals))} MB`;
    }

    const gb = mb / 1024;
    return `${parseFloat(gb.toFixed(decimals))} GB`;
  };

  // Count files and calculate actual size for a specific path
  const calculateSectionUsage = async (bucket: string, path: string): Promise<StorageSectionData> => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // List all items in the path
      const { data: items, error } = await supabase.storage
        .from(bucket)
        .list(path, {
          limit: 1000,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) {
        console.error(`Error fetching ${path} items:`, error);
        return { fileCount: 0, approximateSize: 0 };
      }

      if (!items) {
        return { fileCount: 0, approximateSize: 0 };
      }

      // Count files (not folders) and calculate sizes
      let fileCount = 0;
      let totalSizeInBytes = 0;

      // Process each file in the folder
      for (const item of items) {
        if (item.name && item.type === 'file') { // Only count files, not folders
          fileCount++;

          // Get the full path to the file
          const filePath = `${path}${item.name}`;

          try {
            // The most reliable approach - get signed URL and make a HEAD request
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
              .from(bucket)
              .createSignedUrl(filePath, 60); // 60 seconds expiry

            if (signedUrlData && signedUrlData.signedUrl) {
              // Make a HEAD request to get Content-Length
              const headResponse = await fetch(signedUrlData.signedUrl, { method: 'HEAD' });

              if (headResponse.ok) {
                // Try multiple possible header names for content-length
                const contentLengthValue = headResponse.headers.get('content-length') ||
                                         headResponse.headers.get('Content-Length') ||
                                         headResponse.headers.get('CONTENT-LENGTH');

                if (contentLengthValue) {
                  const fileSizeInBytes = parseInt(contentLengthValue.trim(), 10);

                  // Validate the parsed value
                  if (!isNaN(fileSizeInBytes) && isFinite(fileSizeInBytes) && fileSizeInBytes > 0) {
                    // Add to total only if the value is valid and positive
                    totalSizeInBytes = Math.max(0, totalSizeInBytes) + fileSizeInBytes;
                    console.log(`File ${filePath} size: ${fileSizeInBytes} bytes`);
                  } else {
                    console.warn(`Skipping invalid file size for ${filePath}: ${contentLengthValue} (parsed: ${fileSizeInBytes})`);
                  }
                } else {
                  console.warn(`No content-length header found for ${filePath}`);
                }
              } else {
                console.warn(`HEAD request failed for ${filePath} with status: ${headResponse.status}`);
              }
            } else {
              console.error(`Error getting signed URL for ${filePath}:`, signedUrlError);
            }
          } catch (err) {
            console.error(`Error retrieving size for ${filePath}:`, err);
          }
        }
      }

      // Final validation to ensure total size is non-negative
      totalSizeInBytes = Math.max(0, totalSizeInBytes);

      // Convert total bytes to MB for storage display (ensure non-negative)
      const totalSizeInMB = Math.max(0, totalSizeInBytes / (1024 * 1024));

      return { fileCount, approximateSize: totalSizeInMB };
    } catch (err) {
      console.error(`Error calculating ${path} usage:`, err);
      return { fileCount: 0, approximateSize: 0 };
    }
  };

  // Determine the account tier (free/paid) based on quota or other factors
  const determineTier = (): 'free' | 'paid' => {
    // In a real implementation, we'd check the user's account plan via API
    // For now, this could be based on environment variables or user roles
    // Defaulting to free tier for demo purposes
    return 'free';
  };

  // Fetch storage stats
  const fetchStorageStats = async () => {
    try {
      setLoading(true);

      // Determine the tier
      const detectedTier = determineTier();
      setTier(detectedTier);

      // Calculate usage for each section
      const [profileImages, gallery, documents] = await Promise.all([
        calculateSectionUsage('Images', 'profile-images/'),
        calculateSectionUsage('Images', 'gallery/'),
        calculateSectionUsage('Images', 'documents/')
      ]);

      const totalUsed = profileImages.approximateSize + gallery.approximateSize + documents.approximateSize;

      // Determine total available based on tier in MB
      const totalAvailable = detectedTier === 'paid'
        ? DEFAULT_PAID_TIER_QUOTA_MB
        : DEFAULT_FREE_TIER_QUOTA_MB;

      const usedPercentage = (totalUsed / totalAvailable) * 100;

      setStorageStats({
        profileImages,
        gallery,
        documents,
        totalUsed,
        totalAvailable,
        usedPercentage,
      });
    } catch (err) {
      console.error('Error fetching storage stats:', err);
      toast.error('Failed to fetch storage statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-4 mb-6">
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-cyan"></div>
        </div>
      </div>
    );
  }

  if (!storageStats) {
    return (
      <div className="bg-slate-800 rounded-xl p-4 mb-6">
        <p className="text-red-400 text-center">Failed to load storage information</p>
      </div>
    );
  }

  const { profileImages, gallery, documents, totalUsed, totalAvailable, usedPercentage } = storageStats;

  return (
    <div className="bg-slate-800 rounded-xl p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-accent-cyan">Storage Usage</h2>

      {/* Overall progress bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-slate-400">Overall Storage</span>
          <span className="text-sm text-slate-400">{formatSize(totalUsed)} / {formatSize(totalAvailable)}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${
              usedPercentage > 90 ? 'bg-red-500' :
              usedPercentage > 75 ? 'bg-orange-500' :
              usedPercentage > 50 ? 'bg-yellow-500' :
              'bg-accent-cyan'
            }`}
            style={{ width: `${Math.min(100, usedPercentage)}%` }}
          ></div>
        </div>
        <div className="text-right text-sm text-slate-400 mt-1">
          {usedPercentage.toFixed(2)}% used
        </div>
      </div>

      {/* Section breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Images Section */}
        <div className="bg-slate-700 p-4 rounded-lg">
          <h3 className="font-bold mb-2 text-accent-cyan">Profile Images</h3>
          <p className="text-sm text-slate-400 mb-1">Files: {profileImages.fileCount}</p>
          <p className="text-sm text-slate-400">Est. Size: {formatSize(profileImages.approximateSize)}</p>
        </div>

        {/* Gallery Section */}
        <div className="bg-slate-700 p-4 rounded-lg">
          <h3 className="font-bold mb-2 text-accent-cyan">Gallery</h3>
          <p className="text-sm text-slate-400 mb-1">Files: {gallery.fileCount}</p>
          <p className="text-sm text-slate-400">Est. Size: {formatSize(gallery.approximateSize)}</p>
        </div>

        {/* Documents Section */}
        <div className="bg-slate-700 p-4 rounded-lg">
          <h3 className="font-bold mb-2 text-accent-cyan">Documents</h3>
          <p className="text-sm text-slate-400 mb-1">Files: {documents.fileCount}</p>
          <p className="text-sm text-slate-400">Est. Size: {formatSize(documents.approximateSize)}</p>
        </div>
      </div>

      {/* Tier information */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <p className="text-sm text-slate-400">Account Tier: <span className="capitalize">{tier}</span></p>
            <p className="text-xs text-slate-500">
              {tier === 'free'
                ? `${formatSize(DEFAULT_FREE_TIER_QUOTA_MB)} storage limit`
                : `${formatSize(DEFAULT_PAID_TIER_QUOTA_MB)} storage with premium features`}
            </p>
          </div>
          <button
            className="px-4 py-2 bg-accent-cyan text-slate-900 rounded-lg text-sm font-medium hover:bg-cyan-400 transition-colors"
            onClick={() => fetchStorageStats()}
          >
            Refresh Stats
          </button>
        </div>
      </div>
    </div>
  );
}