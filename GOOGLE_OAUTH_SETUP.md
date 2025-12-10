# Google OAuth Setup Guide

## Issue: "Google hasn't verified this app"

This warning appears because your app hasn't completed Google's verification process.

## Quick Solution: Add Test Users

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **OAuth consent screen**
4. Scroll down to **Test users** section
5. Click **"+ ADD USERS"**
6. Add the email addresses that need access (yours and any testers)
7. Click **Save**

Now these users can sign in without seeing the warning!

## Alternative: Set to Internal (for Google Workspace)

If you have a Google Workspace account:

1. Go to **OAuth consent screen**
2. Change **User Type** to **Internal**
3. This makes the app available only to users in your organization
4. No verification needed!

## For Production: App Verification

When you're ready to launch publicly:

1. Go to **OAuth consent screen**
2. Change **Publishing status** from "Testing" to "In production"
3. Click **"Prepare for verification"**
4. Complete Google's verification process:
   - Provide app homepage
   - Add privacy policy URL
   - Add terms of service URL
   - Explain why you need the requested scopes
   - Complete security assessment

**Note:** Verification can take several weeks. Only do this when ready for public launch.

## Current Scopes Used

Your app requests:
- `openid` - Basic authentication
- `email` - User's email address
- `profile` - User's name and profile picture
- `https://www.googleapis.com/auth/youtube.readonly` - Read YouTube playlists

## Development Setup (Current)

For now, keep your app in **Testing mode** and add test users as needed. This is perfect for development and limited testing.

## Removing the Warning Completely

The warning will disappear when:
1. You add the user as a test user (Testing mode), OR
2. You change to Internal (Google Workspace only), OR
3. You complete Google's verification process (Production mode)

Choose the option that fits your current stage of development!
