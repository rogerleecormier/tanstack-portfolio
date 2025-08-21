const CLIENT_ID_M365 = 'YOUR_M365_CLIENT_ID';
const CLIENT_ID_GOOGLE = 'YOUR_GOOGLE_CLIENT_ID';
const REDIRECT_URI = 'YOUR_REDIRECT_URI'; // e.g., https://your-gh-pages-url/

export const initiateM365Login = () => {
  const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${CLIENT_ID_M365}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=openid profile email`;
  window.location.href = url;
};

export const initiateGoogleLogin = () => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID_GOOGLE}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=openid profile email`;
  window.location.href = url;
};

export const handleOAuthCallback = () => {
  // Parse hash fragment for access_token
  if (window.location.hash) {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = params.get('access_token');
    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
      // Optionally redirect to protected page
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