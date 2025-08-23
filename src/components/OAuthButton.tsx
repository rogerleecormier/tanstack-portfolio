import React from 'react';
import { Button } from './ui/button';
import { P } from './ui/typography';

interface OAuthButtonProps {
    provider: 'm365' | 'google';
    onClick: () => void;
    className?: string;
}

const OAuthButton: React.FC<OAuthButtonProps> = ({ provider, onClick, className }) => (
    <Button 
        onClick={onClick}
        className={`bg-teal-600 hover:bg-teal-700 focus:ring-teal-500 focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${className || ''}`}
    >
        <P className="text-white font-medium">
            Login with {provider === 'm365' ? 'Microsoft 365' : 'Google'}
        </P>
    </Button>
);

export default OAuthButton;