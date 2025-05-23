import { supabase } from '@/utils/supabase';
import { Session, User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  created_at?: string;
}

/**
 * Sync user profile data with Supabase
 * @param session The user session
 * @returns Success status
 */
export const syncUserProfile = async (session: Session): Promise<boolean> => {
  try {
    const user = session.user;
    
    if (!user) {
      console.error('No user in session');
      return false;
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || '',
      avatar_url: user.user_metadata?.avatar_url || '',
    });

    if (error) {
      console.error('Failed to sync user profile:', error);
      return false;
    }
    
    console.log('User profile synced successfully!');
    return true;
  } catch (error) {
    console.error('Error in syncUserProfile:', error);
    return false;
  }
};

/**
 * Get the current user's profile
 * @param userId Optional user ID (defaults to current user)
 * @returns User profile or null if not found
 */
export const getUserProfile = async (userId?: string): Promise<UserProfile | null> => {
  try {
    // If no userId provided, get the current user's ID
    if (!userId) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error('No active session');
        return null;
      }
      userId = sessionData.session.user.id;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
    
    return data as UserProfile;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

/**
 * Update user profile data
 * @param profileData The profile data to update
 * @returns Updated profile or null if update failed
 */
export const updateUserProfile = async (
  profileData: Partial<UserProfile>
): Promise<UserProfile | null> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error('No active session');
      return null;
    }
    
    const userId = sessionData.session.user.id;
    
    // Ensure we're not overriding the ID
    const updateData = {
      ...profileData,
      id: userId,
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('Failed to update user profile:', error);
      return null;
    }
    
    console.log('User profile updated successfully!');
    return data as UserProfile;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
};

/**
 * Sign out the current user
 * @returns Success status
 */
export const signOutUser = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Failed to sign out:', error);
      return false;
    }
    
    console.log('User signed out successfully!');
    return true;
  } catch (error) {
    console.error('Error in signOutUser:', error);
    return false;
  }
};
