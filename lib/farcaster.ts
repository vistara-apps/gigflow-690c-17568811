/**
 * Farcaster Hub API integration for user identity
 * 
 * This module provides functions to interact with the Farcaster Hub API
 * for retrieving user profile information and verifying identity.
 */

/**
 * Fetch a user's Farcaster profile by FID (Farcaster ID)
 * 
 * @param fid - Farcaster ID to look up
 * @returns User profile information or null if not found
 */
export async function getFarcasterUser(fid: string) {
  try {
    const response = await fetch(`https://api.farcaster.xyz/v1/users/${fid}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.FARCASTER_API_KEY || ''}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Farcaster user: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Farcaster user:', error);
    return null;
  }
}

/**
 * Verify if a wallet address is connected to a Farcaster account
 * 
 * @param walletAddress - Ethereum wallet address to verify
 * @returns Farcaster user information or null if not verified
 */
export async function verifyFarcasterIdentity(walletAddress: string) {
  try {
    // Note: This is a simplified implementation
    // In a production environment, you would use the actual Farcaster API endpoints
    // to verify wallet connections
    const response = await fetch(`https://api.farcaster.xyz/v1/verifications?address=${walletAddress}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.FARCASTER_API_KEY || ''}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to verify Farcaster identity: ${response.statusText}`);
    }

    const data = await response.json();
    
    // If the wallet is verified, return the user information
    if (data && data.verifications && data.verifications.length > 0) {
      const fid = data.verifications[0].fid;
      return await getFarcasterUser(fid);
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying Farcaster identity:', error);
    return null;
  }
}

/**
 * Link a Farcaster account to a user in the application
 * 
 * @param userId - User ID in the application
 * @param farcasterId - Farcaster ID to link
 * @returns Success status
 */
export async function linkFarcasterAccount(userId: string, farcasterId: string) {
  try {
    // This would typically update your database to link the Farcaster ID to the user
    // For this implementation, we'll use the API endpoint we've created
    const response = await fetch('/api/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        farcasterId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to link Farcaster account: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error linking Farcaster account:', error);
    return null;
  }
}

