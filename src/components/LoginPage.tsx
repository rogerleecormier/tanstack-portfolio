import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { initiateM365Login, initiateGoogleLogin } from '../utils/oauth';

const LoginPage: React.FC = () => {
  // const router = useRouter();

  const handleLogin = (provider: 'm365' | 'google') => {
    if (provider === 'm365') {
      initiateM365Login();
    } else {
      initiateGoogleLogin();
    }
  };

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Sign in to your account</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="flex items-center gap-2 justify-center"
            onClick={() => handleLogin('m365')}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" className="h-5 w-5" />
            Sign in with Microsoft 365
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2 justify-center"
            onClick={() => handleLogin('google')}
          >
            <img
              src="https://www.gstatic.com/images/branding/product/1x/gsa_64dp.png"
              alt="Google"
              className="h-8 w-8"
              style={{ display: 'inline-block' }}
            />
            Sign in with Google
          </Button>
          <Separator />
          <div className="text-xs text-center text-muted-foreground">
            Your credentials are never stored. OAuth is handled securely via Microsoft or Google.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginPage;