'use client';

import CurrencyIcon from '@/components/CurrencyIcon';

export default function TestImagePage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-white text-2xl mb-8">Image Test Page</h1>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4">
            <span className="text-white">Gold Icon:</span>
            <CurrencyIcon type="gold" size={32} />
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <span className="text-white">SP Icon:</span>
            <CurrencyIcon type="sp" size={32} />
          </div>
          
          <div className="mt-8">
            <p className="text-gray-400">If you see colored circles instead of images, the images failed to load.</p>
            <p className="text-gray-400">If you see the actual coin images, everything is working correctly.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 