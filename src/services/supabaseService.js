import { supabase } from '../config/supabase';

// Helper function to handle errors consistently
const handleSupabaseError = (error) => {
  console.error('Supabase Error:', error);
  throw error;
};

// Categories
const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) handleSupabaseError(error);
  return data || [];
};

// Products
const fetchProducts = async (filters = {}) => {
  let query = supabase
    .from('products')
    .select('*');

  // Apply filters if provided
  if (filters.category_id) {
    query = query.eq('category_id', filters.category_id);
  }
  if (filters.subcategory_id) {
    query = query.eq('subcategory_id', filters.subcategory_id);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  
  if (error) handleSupabaseError(error);
  return data || [];
};

const fetchProductById = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) handleSupabaseError(error);
  return data || null;
};

// Cart
const fetchCart = async (userId) => {
  const { data, error } = await supabase
    .from('cart')
    .select(`
      id,
      quantity,
      product:products(*)
    `)
    .eq('user_id', userId);

  if (error) handleSupabaseError(error);
  return data || [];
};

const addToCart = async (userId, productId, quantity = 1) => {
  // Check if item already in cart
  const { data: existing } = await supabase
    .from('cart')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (existing) {
    // Update quantity if item exists
    const { data, error } = await supabase
      .from('cart')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id);
    
    if (error) handleSupabaseError(error);
    return data;
  } else {
    // Add new item to cart
    const { data, error } = await supabase
      .from('cart')
      .insert([{ 
        user_id: userId, 
        product_id: productId, 
        quantity 
      }]);
    
    if (error) handleSupabaseError(error);
    return data;
  }
};

// Authentication
const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) handleSupabaseError(error);
  return data;
};

const signUp = async (email, password, userData) => {
  // First create the auth user
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (signUpError) handleSupabaseError(signUpError);
  
  // Then create a profile in the users table
  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .insert([{
      id: authData.user.id,
      email,
      ...userData
    }])
    .select()
    .single();
    
  if (profileError) handleSupabaseError(profileError);
  
  return { ...authData, profile: profileData };
};

export {
  fetchCategories,
  fetchProducts,
  fetchProductById,
  fetchCart,
  addToCart,
  signIn,
  signUp
};
