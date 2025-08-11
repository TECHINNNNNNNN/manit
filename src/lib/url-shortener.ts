// Generate short URLs for project sharing

import { createHash } from 'crypto';

// Convert to base62 (more compact than hex, URL-safe unlike base64)
const toBase62 = (num: bigint): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  
  while (num > 0n) {
    result = chars[Number(num % 62n)] + result;
    num = num / 62n;
  }
  
  return result || '0';
};

// Generate short code from project ID using SHA256 hash
export const generateShortCode = (projectId: string): string => {
  // Add timestamp for uniqueness even if same project deployed multiple times
  const input = `${projectId}-${Date.now()}`;
  
  // Create SHA256 hash
  const hash = createHash('sha256').update(input).digest('hex');
  
  // Take first 10 hex chars (40 bits) for good uniqueness vs length balance
  const hexPortion = hash.slice(0, 10);
  
  // Convert to bigint then base62
  const num = BigInt('0x' + hexPortion);
  const shortCode = toBase62(num);
  
  // Pad to minimum 6 chars for consistency
  return shortCode.padStart(6, '0');
};

// Build full short URL from code
export const buildShortUrl = (shortCode: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/s/${shortCode}`;
};

// Extract short code from URL
export const extractShortCode = (url: string): string | null => {
  const match = url.match(/\/s\/([A-Za-z0-9]+)$/);
  return match ? match[1] : null;
};

// Generate QR code URL for sharing
export const generateQRCodeUrl = (url: string): string => {
  const encoded = encodeURIComponent(url);
  // Using qr-server.com API (free, no auth required)
  return `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encoded}`;
};

// Format URLs for display and sharing
export const formatUrlsForDisplay = (deploymentUrl: string, shortUrl: string) => {
  return {
    full: deploymentUrl,
    short: shortUrl,
    qr: generateQRCodeUrl(shortUrl),
    shareText: `Check out my linktree: ${shortUrl}`,
    twitterShare: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my linktree: ${shortUrl}`)}`,
    linkedinShare: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shortUrl)}`,
  };
};