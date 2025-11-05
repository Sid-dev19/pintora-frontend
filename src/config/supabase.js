import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://trzhuqajzjkhmljrezoi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyemh1cWFqempraG1sanJlem9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNDc0NjYsImV4cCI6MjA3NDgyMzQ2Nn0.aVrCv8BJqW4PpQXkWNBKDL_jwx3avJcgYaRgWLnra8o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Helper function to get the current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

// Helper function to sign in
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
