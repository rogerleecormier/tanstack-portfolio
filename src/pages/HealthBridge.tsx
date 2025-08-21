import React from 'react';
import { ProtectedRoute } from '../components/ProtectedRoute';

const HealthBridgeContent: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          HealthBridge Analysis
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Protected Content
          </h2>
          <p className="text-gray-600 mb-4">
            This page is protected by Cloudflare Access with One-Time PIN (OTP) authentication.
            Only authenticated users can view this content.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">Authentication Status</h3>
            <p className="text-sm text-blue-700">
              ✅ You have successfully authenticated using One-Time PIN (OTP)
            </p>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">HealthBridge Features</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Secure access to health analysis tools</li>
              <li>• Protected data and insights</li>
              <li>• OTP-based authentication</li>
              <li>• Enterprise-grade security</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HealthBridge: React.FC = () => {
  return (
    <ProtectedRoute>
      <HealthBridgeContent />
    </ProtectedRoute>
  );
};
