import { supabase } from '@/utils/supabase';
import { Session } from '@supabase/supabase-js';


export async function getSession(): Promise<Session | null> {
  try {
      const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}




