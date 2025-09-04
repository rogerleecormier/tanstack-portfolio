-- Migration: User Authentication Mapping Table
-- This table maps external authentication providers to internal user IDs
-- Allows for flexible user management without hardcoded mappings

-- Temporarily disable foreign key constraints
PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS user_authentication_mapping (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    auth_provider TEXT NOT NULL, -- 'cloudflare_access', 'auth0', 'google', etc.
    auth_user_id TEXT NOT NULL,  -- The ID from the auth provider (email, UUID, etc.)
    internal_user_id TEXT NOT NULL, -- Foreign key to user_profiles.id
    email TEXT, -- For easy lookup and verification
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique combinations
    UNIQUE(auth_provider, auth_user_id),
    UNIQUE(auth_provider, email),
    
    -- Foreign key constraint
    FOREIGN KEY (internal_user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_auth_mapping_auth_user_id ON user_authentication_mapping(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_auth_mapping_email ON user_authentication_mapping(email);
CREATE INDEX IF NOT EXISTS idx_user_auth_mapping_internal_user_id ON user_authentication_mapping(internal_user_id);
CREATE INDEX IF NOT EXISTS idx_user_auth_mapping_provider ON user_authentication_mapping(auth_provider);

-- Insert the existing mapping for rogerleecormier@gmail.com
-- This maps the Cloudflare Access user to internal user ID '1'
INSERT OR IGNORE INTO user_authentication_mapping (
    auth_provider,
    auth_user_id,
    internal_user_id,
    email,
    is_active
) VALUES (
    'cloudflare_access',
    'rogerleecormier@gmail.com',
    '1',
    'rogerleecormier@gmail.com',
    1
);

-- Also add a mapping for the development user
INSERT OR IGNORE INTO user_authentication_mapping (
    auth_provider,
    auth_user_id,
    internal_user_id,
    email,
    is_active
) VALUES (
    'development',
    'dev-user-123',
    'dev-user-123',
    'dev@rcormier.dev',
    1
);

-- Re-enable foreign key constraints
PRAGMA foreign_keys = ON;
