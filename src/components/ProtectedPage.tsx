import React from 'react';
import useAuth from '../hooks/useAuth';

const ProtectedPage: React.FC = () => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <div>You are not authorized to view this page. Please log in.</div>;
    }

    return (
        <div>
            <h1>Protected Content</h1>
            <p>This content is only visible to authenticated users.</p>
        </div>
    );
};

export default ProtectedPage;