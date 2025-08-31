import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Shield, CheckCircle } from 'lucide-react';

export const CloudflareAccessTestPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-teal-600" />
            <CardTitle>Cloudflare Access Test Page</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <div className="font-medium text-green-800">Access Granted!</div>
              <div className="text-sm text-green-600">
                If you can see this page, Cloudflare Access is working correctly.
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">What this means:</h3>
            <ul className="text-sm space-y-1">
              <li>• You have been authenticated through Cloudflare Access</li>
              <li>• Your identity has been verified</li>
              <li>• You have permission to access this protected resource</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Next Steps:</h3>
            <ul className="text-sm space-y-1">
              <li>• Check the debugger at <code>/cloudflare-debug</code></li>
              <li>• Look for Cloudflare cookies in your browser</li>
              <li>• Verify headers are being set correctly</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
