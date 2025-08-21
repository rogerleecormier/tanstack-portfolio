const CLIENT_ID_M365 = 'YOUR_M365_CLIENT_ID';
const CLIENT_ID_GOOGLE = '18305868200-shl50nih7f25huprknrhanojdak7ttq4.apps.googleusercontent.com';
const REDIRECT_URI = 'https://rcormier.dev'; // e.g., https://your-gh-pages-url/

export const initiateM365Login = () => {
  const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${CLIENT_ID_M365}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=openid profile email`;
  window.location.href = url;
};

export const initiateGoogleLogin = () => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID_GOOGLE}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=openid profile email`;
  window.location.href = url;
};

export const handleOAuthCallback = async () => {
  if (window.location.hash) {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token');
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);

      // Fetch user info from Google or Microsoft
      let userInfo = null;
      if (window.location.href.includes('google')) {
        // Google user info endpoint
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        userInfo = await res.json();
      } else {
        // Microsoft user info endpoint
        const res = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        userInfo = await res.json();
      }

      localStorage.setItem('user_info', JSON.stringify(userInfo));
      window.location.replace('/protected');
    }
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

export const logout = () => {
  localStorage.removeItem('access_token');
  window.location.replace('/');
};