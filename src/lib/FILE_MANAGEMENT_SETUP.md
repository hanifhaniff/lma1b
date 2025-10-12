# File Management Setup Guide

This guide will help you set up the necessary database tables for the file management system, including password protection and file sharing features.

## Prerequisites

Before setting up the file management system, make sure you have:

1. A Supabase project created
2. Your Supabase URL and API keys configured in your `.env.local` file
3. Cloudflare R2 bucket configured with proper credentials in your `.env.local` file

## Database Tables Setup

### 1. Files Table

The `files` table stores file metadata and password protection information.

#### SQL Schema

```sql
CREATE TABLE IF NOT EXISTS files (
  id bigserial NOT NULL,
  file_key text NOT NULL,
  nama_file text NOT NULL,
  password text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT files_pkey PRIMARY KEY (id),
  CONSTRAINT files_file_key_key UNIQUE (file_key)
) TABLESPACE pg_default;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_files_file_key ON files(file_key);
CREATE INDEX IF NOT EXISTS idx_files_nama_file ON files(nama_file);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);
```

#### How to Set Up

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL schema above
4. Run the query to create the table

### 2. File Shares Table

The `file_shares` table stores shareable links for files with optional expiration dates.

#### SQL Schema

```sql
CREATE TABLE IF NOT EXISTS file_shares (
  id TEXT PRIMARY KEY,
  file_key TEXT NOT NULL REFERENCES files(file_key),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_file_shares_file_key ON file_shares(file_key);
CREATE INDEX IF NOT EXISTS idx_file_shares_created_at ON file_shares(created_at);
CREATE INDEX IF NOT EXISTS idx_file_shares_expires_at ON file_shares(expires_at);
```

#### How to Set Up

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the SQL schema above
4. Run the query to create the table

## Features

### Password Protection

The file management system supports password protection for uploaded files:

1. When uploading a file, users can optionally set a password
2. Password-protected files require the correct password to download
3. Passwords are stored securely in the database
4. The system automatically checks for password protection during download

### File Sharing

The file sharing system allows users to generate shareable links:

1. Users can generate unique shareable links for their files
2. Shareable links can have different expiration durations:
   - 1 hour
   - 24 hours
   - 3 days
   - 7 days (default)
   - 30 days
   - Unlimited (no expiration)
3. Password-protected files maintain their protection when shared
4. The system tracks all shared links in the database

## Troubleshooting

### Common Issues

1. **"File management is not properly set up" error**
   - This means the required database tables don't exist
   - Make sure you've created both the `files` and `file_shares` tables
   - Run the SQL scripts provided above in your Supabase SQL Editor

2. **"File sharing is not properly set up" error**
   - This means the `file_shares` table doesn't exist
   - Make sure you've created the `file_shares` table
   - Run the SQL script provided above in your Supabase SQL Editor

3. **Environment variable errors**
   - Make sure all required environment variables are set in your `.env.local` file
   - Check that your Cloudflare R2 credentials are correct
   - Verify your Supabase URL and API keys are valid

## Security Considerations

1. All file operations require user authentication
2. Passwords are stored securely in the database
3. File keys are generated randomly to prevent guessing
4. Shareable links have limited lifetimes
5. The system validates all file operations against the database

## Support

If you encounter any issues with the file management system, please check:

1. That all database tables are properly set up
2. That all environment variables are correctly configured
3. That your Supabase and Cloudflare R2 credentials are valid
4. The browser console for any error messages