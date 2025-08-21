import React from 'react';

interface OAuthButtonProps {
    provider: 'm365' | 'google';
    onClick: () => void;
}

const OAuthButton: React.FC<OAuthButtonProps> = ({ provider, onClick }) => (
    <button onClick={onClick}>
        Login with {provider === 'm365' ? 'Microsoft 365' : 'Google'}
    </button>
);

export default OAuthButton;